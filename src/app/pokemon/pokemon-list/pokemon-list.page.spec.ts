import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonApi } from '../pokemon-api';
import { Pokemon, PokemonReferencePage } from '../pokemon.models';
import { PokemonListPage } from './pokemon-list.page';

function pokemon(id: number): Pokemon {
  return {
    id,
    name: `pokemon-${id}`,
    displayName: `Pokemon ${id}`,
    imageUrl: `${id}.png`,
    heightDecimetres: 10,
    weightHectograms: 100,
    abilities: [],
    stats: [],
    types: [{ name: 'normal', displayName: 'Normal' }],
  };
}

function page(id: number, nextOffset: number | null): PokemonReferencePage {
  return {
    count: nextOffset === null ? id : 100,
    items: [{ id, name: `pokemon-${id}`, displayName: `Pokemon ${id}` }],
    nextOffset,
  };
}

function triggerLoadMore(
  component: PokemonListPage,
  complete = vi.fn().mockResolvedValue(undefined),
): ReturnType<typeof vi.fn> {
  const target = { complete } as unknown as HTMLIonInfiniteScrollElement;
  const event = { target } as InfiniteScrollCustomEvent;

  (component as unknown as { loadMore: (loadEvent: InfiniteScrollCustomEvent) => void })
    .loadMore(event);

  return complete;
}

describe('PokemonListPage', () => {
  const pokemonApi = {
    listPokemon: vi.fn(),
    getPokemonBatch: vi.fn(),
  };

  beforeEach(() => {
    pokemonApi.listPokemon.mockReset();
    pokemonApi.getPokemonBatch.mockReset();

    TestBed.configureTestingModule({
      imports: [PokemonListPage],
      providers: [
        provideRouter([]),
        { provide: PokemonApi, useValue: pokemonApi },
      ],
    });
  });

  it('shows skeletons before rendering the enriched initial page', () => {
    const pageRequest = new Subject<PokemonReferencePage>();
    pokemonApi.listPokemon.mockReturnValue(pageRequest);
    pokemonApi.getPokemonBatch.mockReturnValue(of([pokemon(1)]));
    const fixture = TestBed.createComponent(PokemonListPage);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-loading-card')).toHaveLength(8);
    expect(pokemonApi.listPokemon).toHaveBeenCalledWith(24, 0);

    pageRequest.next(page(1, 24));
    pageRequest.complete();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(1);
    expect(element.textContent).toContain('Pokemon 1');
    expect(element.textContent).toContain('1 loaded');
  });

  it('accumulates pages and ignores another load request while one is pending', () => {
    const nextPageRequest = new Subject<PokemonReferencePage>();
    pokemonApi.listPokemon
      .mockReturnValueOnce(of(page(1, 24)))
      .mockReturnValueOnce(nextPageRequest);
    pokemonApi.getPokemonBatch
      .mockReturnValueOnce(of([pokemon(1)]))
      .mockReturnValueOnce(of([pokemon(25)]));
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    const completeFirst = triggerLoadMore(fixture.componentInstance);
    const completeGuarded = triggerLoadMore(fixture.componentInstance);
    fixture.detectChanges();

    expect(pokemonApi.listPokemon).toHaveBeenCalledTimes(2);
    expect(pokemonApi.listPokemon).toHaveBeenLastCalledWith(24, 24);
    expect(completeGuarded).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Loading more Pokémon…');

    nextPageRequest.next(page(25, null));
    nextPageRequest.complete();
    fixture.detectChanges();

    expect(completeFirst).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('2 loaded');
    expect(fixture.nativeElement.textContent).toContain('end of the Pokédex');
  });

  it('preserves loaded cards and retries after a later page fails', () => {
    const retryRequest = new Subject<PokemonReferencePage>();
    pokemonApi.listPokemon
      .mockReturnValueOnce(of(page(1, 24)))
      .mockReturnValueOnce(throwError(() => new Error('network unavailable')))
      .mockReturnValueOnce(retryRequest);
    pokemonApi.getPokemonBatch
      .mockReturnValueOnce(of([pokemon(1)]))
      .mockReturnValueOnce(of([pokemon(25)]));
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    triggerLoadMore(fixture.componentInstance);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(1);
    expect(element.textContent).toContain('More Pokémon are hiding');

    element.querySelector<HTMLIonButtonElement>('.load-more-error ion-button')?.click();
    fixture.detectChanges();

    expect(pokemonApi.listPokemon).toHaveBeenLastCalledWith(24, 24);
    expect(element.querySelector('.load-more-loading ion-spinner')).not.toBeNull();
    expect(element.textContent).toContain('Loading more Pokémon…');
    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(1);

    retryRequest.next(page(25, null));
    retryRequest.complete();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(2);
    expect(element.querySelector('.load-more-loading ion-spinner')).toBeNull();
    expect(element.textContent).not.toContain('Loading more Pokémon…');
    expect(element.querySelector('.load-more-error')).toBeNull();
  });

  it('offers a retry when the initial request fails', () => {
    pokemonApi.listPokemon
      .mockReturnValueOnce(throwError(() => new Error('network unavailable')))
      .mockReturnValueOnce(of(page(1, null)));
    pokemonApi.getPokemonBatch.mockReturnValue(of([pokemon(1)]));
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('We couldn’t load the Pokédex');
    expect(element.querySelector('img')?.getAttribute('src')).toBe('assets/pokemon-error.png');

    element.querySelector<HTMLIonButtonElement>('.state-panel ion-button')?.click();
    fixture.detectChanges();

    expect(pokemonApi.listPokemon).toHaveBeenLastCalledWith(24, 0);
    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(1);
  });
});
