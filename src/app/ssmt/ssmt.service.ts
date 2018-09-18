import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SsmtService {
  mainTab: BehaviorSubject<string>;
  stepTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  steamModelTab: BehaviorSubject<string>;
  currentField: BehaviorSubject<string>;
  openNewModificationModal: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor() { 
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.stepTab = new BehaviorSubject<string>('system-basics');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.steamModelTab = new BehaviorSubject<string>('operations')
    this.currentField = new BehaviorSubject<string>('default');
    this.openNewModificationModal = new BehaviorSubject<boolean>(false);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }
}
