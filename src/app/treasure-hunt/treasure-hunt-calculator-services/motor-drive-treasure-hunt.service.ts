import { Injectable } from '@angular/core';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { MotorDriveOutputs } from '../../shared/models/calculators';
import { MotorDriveInputsTreasureHunt, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';

@Injectable()
export class MotorDriveTreasureHuntService {

  constructor(private motorDriveService: MotorDriveService) { }

  
  initNewCalculator() {
    this.resetCalculatorInputs();
  }

  setCalculatorInputFromOpportunity(motorDrive: MotorDriveInputsTreasureHunt) {
    this.motorDriveService.motorDriveData = motorDrive.motorDriveInputs;
  }

  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.motorDrives.splice(index, 1);
    return treasureHunt;
  }

  saveTreasureHuntOpportunity(motorDrive: MotorDriveInputsTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.motorDrives) {
      treasureHunt.motorDrives = new Array();
    }
    treasureHunt.motorDrives.push(motorDrive);
    return treasureHunt;
  }

  resetCalculatorInputs() {
    this.motorDriveService.motorDriveData = undefined;
  }


  getTreasureHuntOpportunityResults(motorDrive: MotorDriveInputsTreasureHunt): TreasureHuntOpportunityResults {
    let results: MotorDriveOutputs = this.motorDriveService.getResults(motorDrive.motorDriveInputs);
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
      costSavings: results.annualCostSavings,
      energySavings: results.annualEnergySavings,
      baselineCost: results.baselineResult.energyCost,
      modificationCost: results.modificationResult.energyCost,
      utilityType: 'Electricity',
    }

    return treasureHuntOpportunityResults;
  }

}