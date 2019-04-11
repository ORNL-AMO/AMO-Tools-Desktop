import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySheet } from '../shared/models/treasure-hunt';

@Injectable()
export class TreasureHuntService {

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  constructor() {
    this.mainTab = new BehaviorSubject<string>('system-basics');
    this.subTab = new BehaviorSubject<string>('settings');
  }

  initOpportunitySheet(): OpportunitySheet {
    return {
      name: 'New Opportunity',
      equipment: '',
      description: '',
      originator: '',
      date: new Date(),
      plant: '',
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
    }
  }
}
