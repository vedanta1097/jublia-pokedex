import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, ToastController } from '@ionic/angular';
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
  private readonly toastController = inject(ToastController);

  readonly pokemon = input.required<Pokemon>();

  protected readonly pokedexNumber = computed(
    () => `#${String(this.pokemon().id).padStart(3, '0')}`,
  );
  protected readonly isFavourite = computed(() =>
    this.favourites.isFavourite(this.pokemon().id),
  );
  protected readonly heart = heart;
  protected readonly heartOutline = heartOutline;

  protected async toggleFavourite(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const pokemon = this.pokemon();
    const added = this.favourites.toggle(pokemon.id);
    const toast = await this.toastController.create({
      message: `${pokemon.displayName} ${added ? 'added to' : 'removed from'} favourites`,
      duration: 1000,
      position: 'bottom',
      color: 'secondary',
    });

    await toast.present();
  }

  protected useFallbackImage(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.getAttribute('src') === POKEMON_IMAGE_FALLBACK) {
      return;
    }

    image.src = POKEMON_IMAGE_FALLBACK;
  }
}
