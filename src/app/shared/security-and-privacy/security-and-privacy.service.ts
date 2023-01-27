import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecurityAndPrivacyService {

  modalOpen: BehaviorSubject<boolean>;
  showSecurityAndPrivacyModal: BehaviorSubject<boolean>;
  constructor() { 
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.showSecurityAndPrivacyModal = new BehaviorSubject<boolean>(undefined);

  }
}
