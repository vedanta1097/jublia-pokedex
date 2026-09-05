import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { finalize, forkJoin } from 'rxjs';
import { LoadingCardComponent } from '../../shared/loading-card/loading-card';
import { PokemonApi } from '../../pokemon/pokemon-api';
import { PokemonCardComponent } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/pokemon.models';
import { FavouritesStore } from '../favourites-store';

@Component({
  selector: 'app-favourite-list',
  templateUrl: 'favourite-list.page.html',
  styleUrl: 'favourite-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, LoadingCardComponent, PokemonCardComponent, RouterLink],
})
export class FavouriteListPage {
  private readonly pokemonApi = inject(PokemonApi);
  private readonly favourites = inject(FavouritesStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pokemon = signal<Pokemon[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly loadingCards = Array.from({ length: 4 });
  protected readonly favouritePokemon = computed(() => {
    const ids = new Set(this.favourites.ids());
    return this.pokemon().filter(({ id }) => ids.has(id));
  });

  ionViewWillEnter(): void {
    this.loadFavourites();
  }

  protected retryLoad(): void {
    this.loadFavourites();
  }

  private loadFavourites(): void {
    const ids = this.favourites.ids();

    if (ids.length === 0) {
      this.pokemon.set([]);
      this.loadFailed.set(false);
      return;
    }

    this.loading.set(true);
    this.loadFailed.set(false);

    forkJoin(ids.map((id) => this.pokemonApi.getPokemon(id))).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (pokemon) => this.pokemon.set(pokemon),
      error: () => this.loadFailed.set(true),
    });
  }
}
