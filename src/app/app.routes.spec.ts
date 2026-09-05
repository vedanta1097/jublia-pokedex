import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  it('opens the Pokémon list as the default route', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toContain('Meet every Pokémon.');
  });

  it('opens the Pokémon detail page from its route', async () => {
    const harness = await RouterTestingHarness.create('/pokemon/25');

    expect(harness.routeNativeElement?.textContent).toContain('Loading Pokémon…');
  });

  it('opens favourites and redirects unknown paths to the Pokédex', async () => {
    const harness = await RouterTestingHarness.create('/favourites');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toContain('Favourite Pokémon.');

    await harness.navigateByUrl('/not-a-route');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent)
      .toContain('Meet every Pokémon.');
  });
});
