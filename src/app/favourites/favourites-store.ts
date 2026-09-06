import { Service, signal } from '@angular/core';

const STORAGE_KEY = 'jublia-pokedex.favourite-ids';

@Service()
export class FavouritesStore {
  readonly ids = signal<number[]>(this.readIds());

  isFavourite(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): boolean {
    const isAddingToFavorites = !this.isFavourite(id);
    const ids = isAddingToFavorites
      ? [...this.ids(), id]
      : this.ids().filter((favouriteId) => favouriteId !== id);

    this.ids.set(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return isAddingToFavorites;
  }

  private readIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as number[];
    } catch {
      return [];
    }
  }
}
