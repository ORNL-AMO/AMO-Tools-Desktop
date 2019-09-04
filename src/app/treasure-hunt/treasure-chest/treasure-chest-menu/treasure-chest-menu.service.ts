import { Injectable } from '@angular/core';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureHunt, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, LightingReplacementTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
@Injectable()
export class TreasureChestMenuService {

  constructor(private treasureHuntService: TreasureHuntService) { }

  selectAllOpportunities(treasureHunt: TreasureHunt) {
    this.setAllArraySelected(treasureHunt.lightingReplacements);
    this.setAllArraySelected(treasureHunt.opportunitySheets);
    this.setAllArraySelected(treasureHunt.replaceExistingMotors);
    this.setAllArraySelected(treasureHunt.motorDrives);
    this.setAllArraySelected(treasureHunt.naturalGasReductions);
    this.setAllArraySelected(treasureHunt.electricityReductions);
    this.setAllArraySelected(treasureHunt.compressedAirReductions);
    this.setAllArraySelected(treasureHunt.compressedAirPressureReductions);
    this.setAllArraySelected(treasureHunt.waterReductions);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }

  setAllArraySelected(data: Array<LightingReplacementTreasureHunt | OpportunitySheet | ReplaceExistingMotorTreasureHunt | MotorDriveInputsTreasureHunt
    | NaturalGasReductionTreasureHunt | ElectricityReductionTreasureHunt | CompressedAirReductionTreasureHunt | CompressedAirPressureReductionTreasureHunt | WaterReductionTreasureHunt>) {
    if (data) {
      data.forEach(val => { val.selected = true });
    }
  }
}
