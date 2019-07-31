import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySheet } from '../shared/models/treasure-hunt';

@Injectable()
export class TreasureHuntService {

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  getResults: BehaviorSubject<boolean>;
  updateMenuOptions: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor() {
    this.mainTab = new BehaviorSubject<string>('system-basics');
    this.subTab = new BehaviorSubject<string>('settings');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.updateMenuOptions = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initOpportunitySheet(): OpportunitySheet {
    return {
      name: 'New Opportunity',
      equipment: '',
      description: '',
      originator: '',
      date: new Date(),
      owner: '',
      businessUnits: '',
      opportunityCost: {
        engineeringServices: 0,
        material: 0,
        otherCosts: [],
        costDescription: '',
        labor: 0,
        additionalSavings: undefined
      },
      baselineEnergyUseItems: [{
        type: 'Electricity',
        amount: 0
      }],
      modificationEnergyUseItems: []
    };
  }
}
