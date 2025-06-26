import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, } from '@angular/core';
import { AppDefaultNotification, SnackbarMessage, SnackbarService } from './snackbar.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

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
    ],
    standalone: false
})
export class SnackbarNotificationComponent {
  snackbarMessageSub: Subscription;
  snackbarState: string = 'hide';
  snackbarMessage: SnackbarMessage;
  dismissTimeRemaining: number;
  constructor(private snackbarService: SnackbarService, 
    private router: Router, 
    private localStorageService: LocalStorageService) { }

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

  navigateToLink(link: { label: string, uri: string }) {
      this.router.navigateByUrl(link.uri);
  }

  disableDefaultNotification() {
    let disabledDefaultNotifications: any = this.localStorageService.retrieve('disableDefaultNotifications');
    // let disabledDefaultNotifications: Array<AppDefaultNotification> = this.localStorageService.retrieve('disableDefaultNotifications');
    debugger;
    if (!disabledDefaultNotifications) {
      disabledDefaultNotifications = [];
    }
    if (!disabledDefaultNotifications.includes(this.snackbarMessage.appDefaultNotification)) {
      disabledDefaultNotifications.push(this.snackbarMessage.appDefaultNotification);
    }
    this.localStorageService.store('disableDefaultNotification', disabledDefaultNotifications);
    this.closeSnackbar();
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
