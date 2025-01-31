import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UpdateApplicationService {
  showUpdateToast: BehaviorSubject<boolean>;
  showReleaseNotesModal: BehaviorSubject<boolean>;
  webUpdateAvailable: BehaviorSubject<boolean>;

  constructor() { 
    this.showUpdateToast = new BehaviorSubject<boolean>(false);
    this.showReleaseNotesModal = new BehaviorSubject<boolean>(false);
    this.webUpdateAvailable = new BehaviorSubject<boolean>(false);
  }
}
