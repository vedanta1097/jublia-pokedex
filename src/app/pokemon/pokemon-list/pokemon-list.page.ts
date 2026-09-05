import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { Pokemon, PokemonReference, PokemonTypeReference } from '../pokemon.models';

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
  protected readonly types = signal<PokemonTypeReference[]>([]);
  protected readonly selectedType = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly typesLoading = signal(false);
  protected readonly typesLoadFailed = signal(false);
  protected readonly loadingCards = Array.from({ length: 8 });
  private readonly filteredReferences = signal<PokemonReference[]>([]);
  private readonly filteredIndex = signal(0);
  protected readonly hasMore = computed(() => this.selectedType()
    ? this.filteredIndex() < this.filteredReferences().length
    : this.nextOffset() !== null);

  ngOnInit(): void {
    this.loadTypes();
    this.loadNextPage();
  }

  protected loadMore(event: InfiniteScrollCustomEvent): void {
    this.loadNextPage(event.target);
  }

  protected retryLoad(): void {
    const type = this.selectedType();

    if (type && this.filteredReferences().length === 0) {
      this.loadTypePokemon(type);
      return;
    }

    this.loadNextPage();
  }

  protected selectType(event: Event): void {
    const type = (event.target as HTMLSelectElement).value || null;

    if (type === this.selectedType()) {
      return;
    }

    this.selectedType.set(type);
    this.resetPokemon();

    if (type) {
      this.loadTypePokemon(type);
    } else {
      this.loadNextPage();
    }
  }

  protected clearTypeFilter(): void {
    this.selectedType.set(null);
    this.resetPokemon();
    this.loadNextPage();
  }

  protected selectedTypeLabel(): string {
    const type = this.selectedType();
    return this.types().find(({ name }) => name === type)?.displayName ?? type ?? '';
  }

  protected retryTypes(): void {
    this.loadTypes();
  }

  private loadNextPage(infiniteScroll?: HTMLIonInfiniteScrollElement): void {
    if (this.loading() || !this.hasMore()) {
      void infiniteScroll?.complete();
      return;
    }

    if (this.selectedType()) {
      this.loadFilteredPokemon(infiniteScroll);
      return;
    }

    const offset = this.nextOffset();

    if (offset === null) {
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

  private loadTypes(): void {
    this.typesLoading.set(true);
    this.typesLoadFailed.set(false);

    this.pokemonApi.listTypes().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.typesLoading.set(false)),
    ).subscribe({
      next: (types) => this.types.set(types),
      error: () => this.typesLoadFailed.set(true),
    });
  }

  private loadTypePokemon(type: string): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    this.pokemonApi.listPokemonByType(type).pipe(
      switchMap((references) => {
        this.filteredReferences.set(references);
        return this.pokemonApi.getPokemonBatch(references.slice(0, PAGE_SIZE));
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (items) => {
        this.pokemon.set(items);
        this.filteredIndex.set(items.length);
      },
      error: () => this.loadFailed.set(true),
    });
  }

  private loadFilteredPokemon(infiniteScroll?: HTMLIonInfiniteScrollElement): void {
    const start = this.filteredIndex();
    const references = this.filteredReferences().slice(start, start + PAGE_SIZE);

    this.loading.set(true);
    this.loadFailed.set(false);

    this.pokemonApi.getPokemonBatch(references).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        void infiniteScroll?.complete();
      }),
    ).subscribe({
      next: (items) => {
        this.pokemon.update((current) => [...current, ...items]);
        this.filteredIndex.set(start + items.length);
      },
      error: () => this.loadFailed.set(true),
    });
  }

  private resetPokemon(): void {
    this.pokemon.set([]);
    this.nextOffset.set(0);
    this.filteredReferences.set([]);
    this.filteredIndex.set(0);
    this.loadFailed.set(false);
  }
}
