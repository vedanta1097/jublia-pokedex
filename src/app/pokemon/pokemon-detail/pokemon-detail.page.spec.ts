import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonApi } from '../pokemon-api';
import { POKEMON_IMAGE_FALLBACK } from '../pokemon-mappers';
import { Pokemon } from '../pokemon.models';
import { PokemonDetailPage } from './pokemon-detail.page';

const PIKACHU: Pokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  imageUrl: 'https://example.test/pikachu.png',
  heightDecimetres: 4,
  weightHectograms: 60,
  abilities: [
    { name: 'static', displayName: 'Static', isHidden: false },
    { name: 'lightning-rod', displayName: 'Lightning Rod', isHidden: true },
  ],
  stats: [{ name: 'hp', displayName: 'Hp', value: 35 }],
  types: [{ name: 'electric', displayName: 'Electric' }],
};

describe('PokemonDetailPage', () => {
  const pokemonApi = { getPokemon: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    pokemonApi.getPokemon.mockReset();
    TestBed.configureTestingModule({
      imports: [PokemonDetailPage],
      providers: [provideRouter([]), { provide: PokemonApi, useValue: pokemonApi }],
    });
  });

  it('loads and displays the Pokémon from the route input', () => {
    pokemonApi.getPokemon.mockReturnValue(of(PIKACHU));
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '25');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(pokemonApi.getPokemon).toHaveBeenCalledWith('25');
    expect(element.querySelector('h1')?.textContent).toContain('Pikachu');
    expect(element.textContent).toContain('Pokédex #25');
    expect(element.textContent).toContain('0.4 m');
    expect(element.textContent).toContain('6 kg');
    expect(element.textContent).toContain('Lightning Rod');
    expect(element.textContent).toContain('Hidden');
    expect(element.textContent).toContain('Hp');
  });

  it('shows loading until the detail request completes', () => {
    const request = new Subject<Pokemon>();
    pokemonApi.getPokemon.mockReturnValue(request);
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '25');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading Pokémon…');

    request.next(PIKACHU);
    request.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pikachu');
  });

  it('shows a not-found state for a 404 response', () => {
    pokemonApi.getPokemon.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '99999');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pokémon not found');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('assets/pokemon-error.png');
  });

  it('shows a retry action for a request error', () => {
    pokemonApi.getPokemon
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })))
      .mockReturnValueOnce(of(PIKACHU));
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '25');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLIonButtonElement>('ion-button');
    expect(element.textContent).toContain('We couldn’t load this Pokémon');
    button?.click();
    fixture.detectChanges();

    expect(pokemonApi.getPokemon).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Pikachu');
  });

  it('uses the supplied fallback when artwork fails to load', () => {
    pokemonApi.getPokemon.mockReturnValue(of(PIKACHU));
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '25');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const image = element.querySelector<HTMLImageElement>('.pokemon-detail__hero img');
    image?.dispatchEvent(new Event('error'));

    expect(image?.getAttribute('src')).toBe(POKEMON_IMAGE_FALLBACK);
  });

  it('adds and removes the Pokémon from favourites', () => {
    pokemonApi.getPokemon.mockReturnValue(of(PIKACHU));
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('id', '25');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLButtonElement>('.pokemon-detail__favourite');
    expect(button?.getAttribute('aria-label')).toBe('Add Pikachu to favourites');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.querySelector('ion-icon')).not.toBeNull();

    button?.click();
    fixture.detectChanges();

    expect(button?.getAttribute('aria-label')).toBe('Remove Pikachu from favourites');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });
});
