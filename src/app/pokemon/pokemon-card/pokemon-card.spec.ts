import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POKEMON_IMAGE_FALLBACK } from '../pokemon-mappers';
import { Pokemon } from '../pokemon.models';
import { PokemonCardComponent } from './pokemon-card';

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

describe('PokemonCardComponent', () => {
  const toast = { present: vi.fn().mockResolvedValue(undefined) };
  const toastController = { create: vi.fn().mockResolvedValue(toast) };

  beforeEach(() => {
    localStorage.clear();
    toast.present.mockClear();
    toastController.create.mockClear();
    TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
      providers: [
        provideRouter([]),
        { provide: ToastController, useValue: toastController },
      ],
    });
  });

  it('renders an accessible detail link and Pokémon identity', () => {
    const fixture = TestBed.createComponent(PokemonCardComponent);
    fixture.componentRef.setInput('pokemon', PIKACHU);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const link = element.querySelector<HTMLAnchorElement>('.pokemon-card__link');
    const image = element.querySelector<HTMLImageElement>('img');

    expect(link?.getAttribute('href')).toBe('/pokemon/25');
    expect(link?.getAttribute('aria-label')).toBe('View details for Pikachu');
    expect(image?.alt).toBe('Pikachu official artwork');
    expect(element.textContent).toContain('#025');
    expect(element.textContent).toContain('Pikachu');
    expect(element.textContent).toContain('Electric');
  });

  it('uses the supplied fallback when remote artwork fails', () => {
    const fixture = TestBed.createComponent(PokemonCardComponent);
    fixture.componentRef.setInput('pokemon', PIKACHU);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));

    expect(image.getAttribute('src')).toBe(POKEMON_IMAGE_FALLBACK);
  });

  it('updates favourites and shows confirmation feedback', async () => {
    const fixture = TestBed.createComponent(PokemonCardComponent);
    fixture.componentRef.setInput('pokemon', PIKACHU);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLButtonElement>('.pokemon-card__favourite');
    const icon = button?.querySelector('ion-icon');
    expect(button?.getAttribute('aria-label')).toBe('Add Pikachu to favourites');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(icon).not.toBeNull();

    button?.click();
    fixture.detectChanges();

    expect(button?.getAttribute('aria-label')).toBe('Remove Pikachu from favourites');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(toastController.create).toHaveBeenCalledWith({
      message: 'Pikachu added to favourites',
      duration: 1000,
      position: 'bottom',
      color: 'success',
    });
    await vi.waitFor(() => expect(toast.present).toHaveBeenCalledOnce());

    toast.present.mockClear();
    toastController.create.mockClear();
    button?.click();
    fixture.detectChanges();

    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(toastController.create).toHaveBeenCalledWith({
      message: 'Pikachu removed from favourites',
      duration: 1000,
      position: 'bottom',
      color: 'success',
    });
    await vi.waitFor(() => expect(toast.present).toHaveBeenCalledOnce());
  });
});
