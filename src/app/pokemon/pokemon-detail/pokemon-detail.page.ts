import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular';
import { finalize } from 'rxjs';
import { PokemonApi } from '../pokemon-api';
import { POKEMON_IMAGE_FALLBACK } from '../pokemon-mappers';
import { Pokemon } from '../pokemon.models';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: 'pokemon-detail.page.html',
  styleUrl: 'pokemon-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonContent, IonSpinner, RouterLink],
})
export class PokemonDetailPage implements OnInit {
  private readonly pokemonApi = inject(PokemonApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string>();
  protected readonly pokemon = signal<Pokemon | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly loadFailed = signal(false);

  ngOnInit(): void {
    this.loadPokemon();
  }

  protected retryLoad(): void {
    this.loadPokemon();
  }

  protected useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.getAttribute('src') !== POKEMON_IMAGE_FALLBACK) {
      image.src = POKEMON_IMAGE_FALLBACK;
    }
  }

  private loadPokemon(): void {
    const id = this.id();

    if (!id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);
    this.notFound.set(false);
    this.loadFailed.set(false);

    this.pokemonApi.getPokemon(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (pokemon) => this.pokemon.set(pokemon),
      error: (error: unknown) => {
        this.notFound.set(error instanceof HttpErrorResponse && error.status === 404);
        this.loadFailed.set(!(error instanceof HttpErrorResponse && error.status === 404));
      },
    });
  }
}
