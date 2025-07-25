import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, } from '@angular/core';
import { AppDefaultNotification, SnackbarMessage, SnackbarService } from './snackbar.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { DISABLED__DEFAULT_NOTIFICATIONS_KEY } from '../models/app';

const snackbarHiddenStyle = { bottom: '-300px', pointerEvents: 'none' };
const snackbarVisibleStyle = { bottom: '25px', pointerEvents: 'auto' };
@Component({
    selector: 'app-snackbar-notification',
    templateUrl: './snackbar-notification.component.html',
    styleUrl: './snackbar-notification.component.css',
    animations: [
        trigger('snackbarState', [
            state('show', style(snackbarVisibleStyle)),
            state('hide', style(snackbarHiddenStyle)),
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

  disabledDefaultNotifications: Array<AppDefaultNotification> = [];
  constructor(private snackbarService: SnackbarService, 
    private router: Router, 
    private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.snackbarMessageSub = this.snackbarService.snackbarMessage.subscribe(message => {
      this.snackbarMessage = message;
      this.disabledDefaultNotifications = this.localStorageService.retrieve(DISABLED__DEFAULT_NOTIFICATIONS_KEY) || [];
      let isMessageDisabled = this.disabledDefaultNotifications.includes(this.snackbarMessage?.appDefaultNotification);
      if (this.snackbarMessage && !isMessageDisabled) {
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
    if (!this.disabledDefaultNotifications.includes(this.snackbarMessage.appDefaultNotification)) {
      this.disabledDefaultNotifications.push(this.snackbarMessage.appDefaultNotification);
    }
    this.localStorageService.store(DISABLED__DEFAULT_NOTIFICATIONS_KEY, this.disabledDefaultNotifications);
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
