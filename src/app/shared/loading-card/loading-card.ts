import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular';

@Component({
  selector: 'app-loading-card',
  templateUrl: 'loading-card.html',
  styleUrl: 'loading-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSkeletonText],
})
export class LoadingCardComponent {
}
