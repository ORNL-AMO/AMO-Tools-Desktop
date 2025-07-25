import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SnackbarService {
  snackbarMessage: BehaviorSubject<SnackbarMessage>;
  constructor() { 
    this.snackbarMessage = new BehaviorSubject<SnackbarMessage>(undefined);
  }

  setSnackbarMessage(messageOrDefault: string, level: MessageLevel = 'info', timeoutType: TimeoutType = 'none', links?: {label: string, uri: string}[]) {
    let snackbar: SnackbarMessage = {
      msg: undefined,
      level: level,
      timeoutMS: DismissTimeoutsMS[timeoutType],
      links: links
    }
    let defaultMessage: string = MEASURDefaultNotifications[messageOrDefault];
    if (defaultMessage) {
      snackbar.msg = defaultMessage;
      snackbar.appDefaultNotification = messageOrDefault as AppDefaultNotification;
    } else {
      snackbar.msg = messageOrDefault;
    }


    this.snackbarMessage.next(snackbar)
  }
}

export interface SnackbarMessage {
  level: MessageLevel,
  msg: string,
  appDefaultNotification?: AppDefaultNotification,
  timeoutMS?: number,
  links?: {label: string, uri: string}[]
}

type MessageLevel = 'danger' | 'info';
type TimeoutType = 'none' | 'short' | 'long';
const DismissTimeoutsMS = {
  short: 3000,
  long: 10000
}

const MEASURDefaultNotifications: Record<AppDefaultNotification, string> = {
  exploreOpportunities: `<b class="bold title">Explore Opportunities</b>: The selected modification was created using the expert view. 
  There may be changes to the modification that are not visible from this screen.`,
  appDataStorageNotice: `<b class="bold title">You are running MEASUR in a web browser</b>. <br>Disabling browser local storage, cookies, or cache for this website can result in data loss. DOE and MEASUR support staff do not have access to your data. 
  `
}

export type AppDefaultNotification = 'exploreOpportunities' | 'appDataStorageNotice';