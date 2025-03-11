import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SnackbarService {
  snackbarMessage: BehaviorSubject<SnackbarMessage>;
  constructor() { 
    this.snackbarMessage = new BehaviorSubject<SnackbarMessage>(undefined);
  }

  setSnackbarMessage(messageOrDefault: string, level: MessageLevel = 'info', timeoutType: TimeoutType = 'none') {
    let message = MEASURDefaultNotifications[messageOrDefault]?  MEASURDefaultNotifications[messageOrDefault] : messageOrDefault;
    let snackbar: SnackbarMessage = {
      msg: message,
      level: level,
      timeoutMS: DismissTimeoutsMS[timeoutType]
    }
    this.snackbarMessage.next(snackbar)
  }
}

export interface SnackbarMessage {
  level: MessageLevel,
  msg: string,
  timeoutMS?: number
}

type MessageLevel = 'danger' | 'info';
type TimeoutType = 'none' | 'short' | 'long';
const DismissTimeoutsMS = {
  short: 3000,
  long: 10000
}

const MEASURDefaultNotifications: Record<string, string> = {
  exploreOpportunities: '<b class="bold title">Explore Opportunities</b>: The selected modification was created using the expert view. There may be changes to the modification that are not visible from this screen.'
}