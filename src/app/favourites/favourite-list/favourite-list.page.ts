import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-favourite-list',
  templateUrl: 'favourite-list.page.html',
  styleUrl: 'favourite-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, RouterLink],
})
export class FavouriteListPage {
}
