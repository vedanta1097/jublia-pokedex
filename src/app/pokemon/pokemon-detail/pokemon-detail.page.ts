import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: 'pokemon-detail.page.html',
  styleUrl: 'pokemon-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, RouterLink],
})
export class PokemonDetailPage {
  readonly id = input<string>();
}
