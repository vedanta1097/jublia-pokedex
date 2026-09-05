import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { heart, heartOutline } from 'ionicons/icons';
import { FavouritesStore } from '../../favourites/favourites-store';
import { POKEMON_IMAGE_FALLBACK } from '../pokemon-mappers';
import { Pokemon } from '../pokemon.models';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: 'pokemon-card.html',
  styleUrl: 'pokemon-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, RouterLink],
})
export class PokemonCardComponent {
  private readonly favourites = inject(FavouritesStore);

  readonly pokemon = input.required<Pokemon>();

  protected readonly pokedexNumber = computed(
    () => `#${String(this.pokemon().id).padStart(3, '0')}`,
  );
  protected readonly isFavourite = computed(() => this.favourites.isFavourite(this.pokemon().id));
  protected readonly heart = heart;
  protected readonly heartOutline = heartOutline;

  protected toggleFavourite(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favourites.toggle(this.pokemon().id);
  }

  protected useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.getAttribute('src') === POKEMON_IMAGE_FALLBACK) {
      return;
    }

    image.src = POKEMON_IMAGE_FALLBACK;
  }
}
