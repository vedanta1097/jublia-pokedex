import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonApi } from '../pokemon-api';
import { Pokemon, PokemonReference, PokemonReferencePage, PokemonTypeReference } from '../pokemon.models';
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

const FIRE_TYPE: PokemonTypeReference = {
  id: 10,
  name: 'fire',
  displayName: 'Fire',
};

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

function selectType(fixture: ReturnType<typeof TestBed.createComponent<PokemonListPage>>, value: string): void {
  const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
  select.value = value;
  select.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

describe('PokemonListPage', () => {
  const pokemonApi = {
    listTypes: vi.fn(),
    listPokemon: vi.fn(),
    listPokemonByType: vi.fn(),
    getPokemonBatch: vi.fn(),
  };

  beforeEach(() => {
    pokemonApi.listTypes.mockReset();
    pokemonApi.listPokemon.mockReset();
    pokemonApi.listPokemonByType.mockReset();
    pokemonApi.getPokemonBatch.mockReset();
    pokemonApi.listTypes.mockReturnValue(of([]));

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

  it('filters Pokémon in batches and resets the list when cleared', () => {
    const fireReferences: PokemonReference[] = Array.from({ length: 25 }, (_, index) => ({
      id: index + 100,
      name: `fire-${index + 1}`,
      displayName: `Fire ${index + 1}`,
    }));
    pokemonApi.listTypes.mockReturnValue(of([FIRE_TYPE]));
    pokemonApi.listPokemon.mockReturnValue(of(page(1, null)));
    pokemonApi.listPokemonByType.mockReturnValue(of(fireReferences));
    pokemonApi.getPokemonBatch.mockImplementation((references: PokemonReference[]) =>
      of(references.map(({ id }) => pokemon(id))),
    );
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    selectType(fixture, 'fire');

    expect(pokemonApi.listPokemonByType).toHaveBeenCalledWith('fire');
    expect(fixture.nativeElement.textContent).toContain('Fire · 24 loaded');
    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(24);

    triggerLoadMore(fixture.componentInstance);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(25);
    expect(pokemonApi.getPokemonBatch.mock.calls.at(-1)?.[0]).toHaveLength(1);

    selectType(fixture, '');

    expect(pokemonApi.listPokemon).toHaveBeenLastCalledWith(24, 0);
    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(1);
  });

  it('shows an empty state for a type with no Pokémon', () => {
    pokemonApi.listTypes.mockReturnValue(of([FIRE_TYPE]));
    pokemonApi.listPokemon.mockReturnValue(of(page(1, null)));
    pokemonApi.listPokemonByType.mockReturnValue(of([]));
    pokemonApi.getPokemonBatch.mockImplementation((references: PokemonReference[]) =>
      of(references.map(({ id }) => pokemon(id))),
    );
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    selectType(fixture, 'fire');

    expect(fixture.nativeElement.textContent).toContain('No Fire Pokémon found');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('assets/pokemon-error.png');
  });

  it('shows a filtered error with a way to clear the filter', () => {
    pokemonApi.listTypes.mockReturnValue(of([FIRE_TYPE]));
    pokemonApi.listPokemon.mockReturnValue(of(page(1, null)));
    pokemonApi.listPokemonByType.mockReturnValue(throwError(() => new Error('network unavailable')));
    pokemonApi.getPokemonBatch.mockReturnValue(of([pokemon(1)]));
    const fixture = TestBed.createComponent(PokemonListPage);
    fixture.detectChanges();

    selectType(fixture, 'fire');

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('We couldn’t load Fire Pokémon');

    element.querySelector<HTMLButtonElement>('.text-button')?.click();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-pokemon-card')).toHaveLength(1);
    expect(element.textContent).not.toContain('We couldn’t load Fire Pokémon');
  });
});
