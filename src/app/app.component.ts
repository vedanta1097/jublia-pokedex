import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, NgOptimizedImage, RouterLink, RouterLinkActive],
})
export class AppComponent {
  private readonly mainContent = viewChild.required<unknown, ElementRef<HTMLElement>>(
    'mainContent',
    { read: ElementRef },
  );

  protected focusMainContent(): void {
    this.mainContent().nativeElement.focus();
  }
}
