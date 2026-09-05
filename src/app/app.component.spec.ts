import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders linked branding and accessible primary navigation', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const logo = element.querySelector<HTMLImageElement>('.brand__logo');
    const navigation = element.querySelectorAll<HTMLElement>('nav[aria-label="Primary navigation"]');
    const destinations = [...element.querySelectorAll<HTMLAnchorElement>('nav a')]
      .map((link) => link.getAttribute('href'));

    expect(logo?.alt).toBe('Pokémon');
    expect(navigation).toHaveLength(2);
    expect(destinations).toEqual(['/pokemon', '/favourites', '/pokemon', '/favourites']);
    const skipLink = element.querySelector<HTMLButtonElement>('.skip-link');
    skipLink?.click();
    expect(document.activeElement?.id).toBe('main-content');
  });
});
