import { Injectable } from '@angular/core';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { MotorDriveOutputs } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { EnergyUsage, MotorDriveInputsTreasureHunt, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';

@Injectable()
export class MotorDriveTreasureHuntService {

  constructor(private motorDriveService: MotorDriveService, private convertUnitsService: ConvertUnitsService) { }

  
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

  getMotorDriveCard(drive: MotorDriveInputsTreasureHunt, opportunitySummary: OpportunitySummary, index: number, currentEnergyUsage: EnergyUsage, settings: Settings): OpportunityCardData {
    let cardData: OpportunityCardData = {
      implementationCost: opportunitySummary.totalCost,
      paybackPeriod: opportunitySummary.payback,
      selected: drive.selected,
      opportunityType: 'motor-drive',
      opportunityIndex: index,
      annualCostSavings: opportunitySummary.costSavings,
      annualEnergySavings: [{
        savings: opportunitySummary.totalEnergySavings,
        energyUnit: 'kWh',
        label: 'Electricity'
      }],
      utilityType: ['Electricity'],
      percentSavings: [{
        percent: (opportunitySummary.costSavings / currentEnergyUsage.electricityCosts) * 100,
        label: 'Electricity',
        baselineCost: opportunitySummary.baselineCost,
        modificationCost: opportunitySummary.modificationCost,
      }],
      motorDrive: drive,
      name: opportunitySummary.opportunityName,
      opportunitySheet: drive.opportunitySheet,
      iconString: 'assets/images/calculator-icons/motor-icons/motor-drive.png',
      teamName: drive.opportunitySheet? drive.opportunitySheet.owner : undefined
    }
    return cardData;
  }

  convertMotorDrives(motorDrives: Array<MotorDriveInputsTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<MotorDriveInputsTreasureHunt> {
    motorDrives.forEach(drive => {
      //imperial: hp, metric: kW
      drive.motorDriveInputs.motorPower = this.convertUnitsService.convertPowerValue(drive.motorDriveInputs.motorPower, oldSettings, newSettings);
    });
    return motorDrives;
  }


}