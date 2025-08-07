import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MEASUR_RESOURCES_URL } from '../models/utilities';

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

export const CORE_DATA_WARNING = `<b class="bold title">MEASUR has detected browser storage restrictions and cannot run the application</b></br>To use MEASUR, 
        follow your browser's instructions to enable data storage for this site. For more information, visit: <a href="${MEASUR_RESOURCES_URL}" target="_blank">${MEASUR_RESOURCES_URL}</a>`;
export const SECONDARY_DATA_WARNING =  `<b class="bold title">Non-essential storage options have been disabled for this browser</b>.<br>Core MEASUR functionality will continue, but some features may be limited or unavailable. For more information, visit: <a href="${MEASUR_RESOURCES_URL}" target="_blank">${MEASUR_RESOURCES_URL}</a>`;

const MEASURDefaultNotifications: Record<AppDefaultNotification, string> = {
  exploreOpportunities: `<b class="bold title">Explore Opportunities</b>: The selected modification was created using the expert view. 
  There may be changes to the modification that are not visible from this screen.`,
  appDataStorageNotice: `<b class="bold title">MEASUR data are stored in this browser on your local machine</b>. 
  <br>Performing operations that delete browsing data for this website can result in data loss. 
  DOE and MEASUR support staff do not have access to your data.`
}

export type AppDefaultNotification = 'exploreOpportunities' | 'appDataStorageNotice';