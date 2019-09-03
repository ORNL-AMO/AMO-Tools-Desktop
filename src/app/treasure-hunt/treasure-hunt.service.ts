import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OpportunitySheet, TreasureHunt, LightingReplacementTreasureHunt } from '../shared/models/treasure-hunt';

@Injectable()
export class TreasureHuntService {

  treasureHunt: BehaviorSubject<TreasureHunt>;

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
    this.treasureHunt = new BehaviorSubject<TreasureHunt>(undefined);
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

  addNewLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt){
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    if(!treasureHunt.lightingReplacements){
      treasureHunt.lightingReplacements = new Array();
    }
    treasureHunt.lightingReplacements.push(lightingReplacementTreasureHunt);
    this.treasureHunt.next(treasureHunt);
  }

  editLightingReplacementTreasureHuntItem(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt, index: number){
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.lightingReplacements[index] = lightingReplacementTreasureHunt;
    this.treasureHunt.next(treasureHunt);
  }

  deleteLightingReplacementTreasureHuntItem(index: number){
    let treasureHunt: TreasureHunt = this.treasureHunt.value;
    treasureHunt.lightingReplacements.splice(index, 1);
    this.treasureHunt.next(treasureHunt);
  }
}
