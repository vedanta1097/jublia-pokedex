import { Service, signal } from '@angular/core';

const STORAGE_KEY = 'jublia-pokedex.favourite-ids';

@Service()
export class FavouritesStore {
  readonly ids = signal<number[]>(this.readIds());

  isFavourite(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): void {
    const ids = this.isFavourite(id)
      ? this.ids().filter((favouriteId) => favouriteId !== id)
      : [...this.ids(), id];

    this.ids.set(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  private readIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as number[];
    } catch {
      return [];
    }
  }
}
