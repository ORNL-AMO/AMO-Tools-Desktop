import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementTreasureHunt } from '../../shared/models/treasure-hunt';

@Injectable()
export class CalculatorsService {

  selectedCalc: BehaviorSubject<string>;
  itemIndex: number;
  isNewOpportunity: boolean;
  constructor(private lightingReplacementService: LightingReplacementService) {
    this.selectedCalc = new BehaviorSubject<string>('none');
  }

  addNewLighting() {
    this.isNewOpportunity = true;
    this.lightingReplacementService.baselineData = undefined;
    this.lightingReplacementService.modificationData = undefined;
    this.lightingReplacementService.baselineElectricityCost = undefined;
    this.lightingReplacementService.modificationElectricityCost = undefined;
    this.selectedCalc.next('lighting-replacement');
  }

  editLighting(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt, index: number) {
    this.isNewOpportunity = false;
    this.lightingReplacementService.baselineData = lightingReplacementTreasureHunt.baseline;
    this.lightingReplacementService.modificationData = lightingReplacementTreasureHunt.modifications;
    this.lightingReplacementService.baselineElectricityCost = lightingReplacementTreasureHunt.baselineElectricityCost;
    this.lightingReplacementService.modificationElectricityCost = lightingReplacementTreasureHunt.modificationElectricityCost;
    this.itemIndex = index;
    this.selectedCalc.next('lighting-replacement');
  }

  cancelLightingCalc(){
    this.lightingReplacementService.baselineData = undefined;
    this.lightingReplacementService.modificationData = undefined;
    this.lightingReplacementService.baselineElectricityCost = undefined;
    this.lightingReplacementService.modificationElectricityCost = undefined;
    this.itemIndex = undefined;
    this.selectedCalc.next('none');
  }
}
