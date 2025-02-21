import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, } from '@angular/core';
import { SnackbarMessage, SnackbarService } from './snackbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snackbar-notification',
  templateUrl: './snackbar-notification.component.html',
  styleUrl: './snackbar-notification.component.css',
    animations: [
      trigger('snackbarState', [
        state('show', style({ bottom: '25px' })),
        state('hide', style({ bottom: '-100px' })),
        transition('hide => show', animate('.5s ease')),
        transition('show => hide', animate('.5s ease'))
      ])
    ]
})
export class SnackbarNotificationComponent {
  snackbarMessageSub: Subscription;
  snackbarState: string = 'hide';
  snackbarMessage: SnackbarMessage;
  dismissTimeRemaining: number;
  constructor(private snackbarService: SnackbarService) { }

  ngOnInit() {
    this.snackbarMessageSub = this.snackbarService.snackbarMessage.subscribe(message => {
      this.snackbarMessage = message;
      if (this.snackbarMessage) {
        this.showSnackbar();
      } else if (this.snackbarState === 'show') {
        this.closeSnackbar();
      }
    });
  }

  ngOnDestroy() {
    this.snackbarState = 'hide';
    this.snackbarService.snackbarMessage.next(undefined);
    this.snackbarMessageSub.unsubscribe();
  }

  showSnackbar() {
    this.snackbarState = 'show';
    if (this.snackbarMessage.timeoutMS) {
      setTimeout(() => {
        this.closeSnackbar();
      }, this.snackbarMessage.timeoutMS);
    }
    
  }

  closeSnackbar() {
    this.snackbarState = 'hide';
    setTimeout(() => {
      this.snackbarService.snackbarMessage.next(undefined);
    }, 500);
  }
}
