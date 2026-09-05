import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonApi } from '../../pokemon/pokemon-api';
import { Pokemon } from '../../pokemon/pokemon.models';
import { FavouritesStore } from '../favourites-store';
import { FavouriteListPage } from './favourite-list.page';

const PIKACHU: Pokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  imageUrl: 'https://example.test/pikachu.png',
  heightDecimetres: 4,
  weightHectograms: 60,
  abilities: [],
  stats: [],
  types: [{ name: 'electric', displayName: 'Electric' }],
};

describe('FavouriteListPage', () => {
  const pokemonApi = { getPokemon: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    pokemonApi.getPokemon.mockReset();
    TestBed.configureTestingModule({
      imports: [FavouriteListPage],
      providers: [
        provideRouter([]),
        { provide: PokemonApi, useValue: pokemonApi },
      ],
    });
  });

  it('shows an empty state when no Pokémon are saved', () => {
    const fixture = TestBed.createComponent(FavouriteListPage);
    fixture.componentInstance.ionViewWillEnter();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No favourites yet');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('assets/pokemon-error.png');
  });

  it('loads and displays saved Pokémon', () => {
    TestBed.inject(FavouritesStore).toggle(25);
    pokemonApi.getPokemon.mockReturnValue(of(PIKACHU));
    const fixture = TestBed.createComponent(FavouriteListPage);
    fixture.componentInstance.ionViewWillEnter();
    fixture.detectChanges();

    expect(pokemonApi.getPokemon).toHaveBeenCalledWith(25);
    expect(fixture.nativeElement.textContent).toContain('Saved Pokémon');
    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(1);
  });

  it('updates immediately when a saved card is removed', () => {
    TestBed.inject(FavouritesStore).toggle(25);
    pokemonApi.getPokemon.mockReturnValue(of(PIKACHU));
    const fixture = TestBed.createComponent(FavouriteListPage);
    fixture.componentInstance.ionViewWillEnter();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('.pokemon-card__favourite')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No favourites yet');
    expect(fixture.nativeElement.querySelectorAll('app-pokemon-card')).toHaveLength(0);
  });

  it('shows a retryable error when saved Pokémon cannot be loaded', () => {
    TestBed.inject(FavouritesStore).toggle(25);
    pokemonApi.getPokemon.mockReturnValue(throwError(() => new Error('network unavailable')));
    const fixture = TestBed.createComponent(FavouriteListPage);
    fixture.componentInstance.ionViewWillEnter();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('We couldn’t load your favourites');
    expect(fixture.nativeElement.textContent).toContain('Try again');
  });
});
