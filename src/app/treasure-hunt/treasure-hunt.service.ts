import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TreasureHunt } from '../shared/models/treasure-hunt';

@Injectable()
export class TreasureHuntService {

  treasureHunt: BehaviorSubject<TreasureHunt>;

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  getResults: BehaviorSubject<boolean>;
  updateMenuOptions: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  constructor() {
    this.mainTab = new BehaviorSubject<string>('system-basics');
    this.subTab = new BehaviorSubject<string>('settings');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.updateMenuOptions = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.treasureHunt = new BehaviorSubject<TreasureHunt>(undefined);
    this.currentField = new BehaviorSubject<string>('operation-costs');

  }

}

