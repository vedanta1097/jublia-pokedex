import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FavouritesStore } from './favourites-store';

describe('FavouritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds and removes a favourite ID', () => {
    const store = TestBed.inject(FavouritesStore);

    store.toggle(25);
    expect(store.isFavourite(25)).toBe(true);
    expect(store.ids()).toEqual([25]);

    store.toggle(25);
    expect(store.isFavourite(25)).toBe(false);
    expect(store.ids()).toEqual([]);
  });

  it('restores favourite IDs from local storage', () => {
    localStorage.setItem('jublia-pokedex.favourite-ids', JSON.stringify([6, 25]));
    const store = TestBed.inject(FavouritesStore);

    expect(store.ids()).toEqual([6, 25]);
  });

  it('persists each change', () => {
    const store = TestBed.inject(FavouritesStore);

    store.toggle(25);
    expect(localStorage.getItem('jublia-pokedex.favourite-ids')).toBe('[25]');
  });
});
