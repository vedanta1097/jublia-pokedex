import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonContent,
  IonInfiniteScroll,
  IonSpinner,
} from '@ionic/angular';
import { finalize, map, switchMap } from 'rxjs';
import { LoadingCardComponent } from '../../shared/loading-card/loading-card';
import { PokemonApi } from '../pokemon-api';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card';
import { Pokemon } from '../pokemon.models';

const PAGE_SIZE = 24;

@Component({
  selector: 'app-pokemon-list',
  templateUrl: 'pokemon-list.page.html',
  styleUrl: 'pokemon-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonContent,
    IonInfiniteScroll,
    IonSpinner,
    LoadingCardComponent,
    PokemonCardComponent,
  ],
})
export class PokemonListPage implements OnInit {
  private readonly pokemonApi = inject(PokemonApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pokemon = signal<Pokemon[]>([]);
  protected readonly nextOffset = signal<number | null>(0);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly loadingCards = Array.from({ length: 8 });

  ngOnInit(): void {
    this.loadNextPage();
  }

  protected loadMore(event: InfiniteScrollCustomEvent): void {
    this.loadNextPage(event.target);
  }

  protected retryLoad(): void {
    this.loadNextPage();
  }

  private loadNextPage(infiniteScroll?: HTMLIonInfiniteScrollElement): void {
    const offset = this.nextOffset();

    if (this.loading() || offset === null) {
      void infiniteScroll?.complete();
      return;
    }

    this.loading.set(true);
    this.loadFailed.set(false);

    this.pokemonApi.listPokemon(PAGE_SIZE, offset).pipe(
      switchMap((page) => this.pokemonApi.getPokemonBatch(page.items).pipe(
        map((items) => ({ items, nextOffset: page.nextOffset })),
      )),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        void infiniteScroll?.complete();
      }),
    ).subscribe({
      next: ({ items, nextOffset }) => {
        this.pokemon.update((current) => [...current, ...items]);
        this.nextOffset.set(nextOffset);
      },
      error: () => this.loadFailed.set(true),
    });
  }
}
