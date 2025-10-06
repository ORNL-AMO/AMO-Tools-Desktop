import { Component, inject } from '@angular/core';
import { Modification, FanSpeedType, TowerType, ChillerInventoryItem, CompressorChillerTypeEnum } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';

@Component({
  selector: 'app-assessment-results',
  standalone: false,
  templateUrl: './assessment-results.component.html',
  styleUrl: './assessment-results.component.css'
})
export class AssessmentResultsComponent {
  // private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  // modification: Modification;
  // settings = this.processCoolingAssessmentService.settingsSignal();

  constructor() {
    // Initialize with dummy data
    // this.modification = {
    //   name: 'Sample Process Cooling Modification',
    //   id: 'mod-001',
    //   isValid: true,
    //   increaseChilledWaterTemp: {
    //     useOpportunity: true,
    //     implementationCost: 15000,
    //     chilledWaterSupplyTemp: 46
    //   },
    //   decreaseCondenserWaterTemp: {
    //     useOpportunity: true,
    //     implementationCost: 8000,
    //     condenserWaterTemp: 75
    //   },
    //   useSlidingCondenserWaterTemp: {
    //     useOpportunity: false,
    //     implementationCost: 12000,
    //     followingTempDifferential: 10,
    //     isConstantCondenserWaterTemp: false
    //   },
    //   applyVariableSpeedControls: {
    //     useOpportunity: true,
    //     implementationCost: 25000,
    //     fanSpeedType: FanSpeedType.Variable
    //   },
    //   replaceChillers: {
    //     useOpportunity: false,
    //     implementationCost: 150000,
    //     currentChillerId: 'chiller-baseline-001',
    //     newChiller: this.createDummyChiller()
    //   },
    //   upgradeCoolingTowerFans: {
    //     useOpportunity: true,
    //     implementationCost: 35000,
    //     numberOfFans: TowerType.TwoCellTwoSpeed
    //   },
    //   useFreeCooling: {
    //     useOpportunity: false,
    //     implementationCost: 45000,
    //     usesFreeCooling: true,
    //     isHEXRequired: true,
    //     HEXApproachTemp: 8
    //   },
    //   replaceRefrigerant: {
    //     useOpportunity: false,
    //     implementationCost: 20000,
    //     currentRefrigerant: 'R-134a',
    //     newRefrigerant: 'R-513A'
    //   },
    //   installVSDOnCentrifugalCompressor: {
    //     useOpportunity: true,
    //     implementationCost: 55000
    //   },
    //   notes: 'This is a sample modification with dummy data for testing and development purposes. Implementation costs are estimated values.'
    // };
  }

  // private createDummyChiller(): ChillerInventoryItem {
  //   return {
  //     itemId: 'new-chiller-001',
  //     name: 'High Efficiency Centrifugal Chiller',
  //     description: 'New high-efficiency centrifugal chiller for replacement',
  //     modifiedDate: new Date(),
  //     isValid: true,
  //     chillerType: CompressorChillerTypeEnum.CENTRIFUGAL,
  //     capacity: 500,
  //     isFullLoadEfficiencyKnown: true,
  //     fullLoadEfficiency: 0.75,
  //     age: 0,
  //     installVSD: true,
  //     useARIloadScheduleByMonthchedule: false,
  //     loadScheduleByMonth: [
  //       [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], // January
  //       [12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62], // February
  //       [14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64], // March
  //       [16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66], // April
  //       [18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68], // May
  //       [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70], // June
  //       [22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72], // July
  //       [21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71], // August
  //       [19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69], // September
  //       [17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67], // October
  //       [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65], // November
  //       [13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63]  // December
  //     ],
  //     loadScheduleAllMonths: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  //     useSameMonthlyLoading: false
  //   };
  // }
}
