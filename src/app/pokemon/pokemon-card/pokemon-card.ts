import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { POKEMON_IMAGE_FALLBACK } from '../pokemon-mappers';
import { Pokemon } from '../pokemon.models';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: 'pokemon-card.html',
  styleUrl: 'pokemon-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class PokemonCardComponent {
  readonly pokemon = input.required<Pokemon>();

  protected readonly pokedexNumber = computed(
    () => `#${String(this.pokemon().id).padStart(3, '0')}`,
  );

  protected useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.getAttribute('src') === POKEMON_IMAGE_FALLBACK) {
      return;
    }

    image.src = POKEMON_IMAGE_FALLBACK;
  }
}
