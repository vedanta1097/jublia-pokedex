import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: 'pokemon-list.page.html',
  styleUrl: 'pokemon-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent],
})
export class PokemonListPage {
}
