import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RollupPrintService {

  rollupPrintOptions: BehaviorSubject<RollupPrintOptions>;
  showPrintView: BehaviorSubject<boolean>;
  showPrintOptionsModal: BehaviorSubject<boolean>;
  constructor() {
    let initPrintOptions: RollupPrintOptions = this.setAll(true);
    this.rollupPrintOptions = new BehaviorSubject<RollupPrintOptions>(initPrintOptions);
    this.showPrintView = new BehaviorSubject<boolean>(false);
    this.showPrintOptionsModal = new BehaviorSubject<boolean>(false);
  }


  toggleSection(section: string): void {
    let currentPrintOptions: RollupPrintOptions = this.rollupPrintOptions.getValue();
    switch (section) {
      case "selectAll": {
        currentPrintOptions.selectAll = !currentPrintOptions.selectAll;
        currentPrintOptions = this.setAll(currentPrintOptions.selectAll);
        break;
      }
      case "psatRollup": {
        currentPrintOptions.printPsatRollup = !currentPrintOptions.printPsatRollup;
        break;
      }
      case "phastRollup": {
        currentPrintOptions.printPhastRollup = !currentPrintOptions.printPhastRollup;
        break;
      }
      case "fsatRollup": {
        currentPrintOptions.printFsatRollup = !currentPrintOptions.printFsatRollup;
        break;
      }
      // case "treasureHuntRollup": {
      //   this.printTreasureHuntRollup = !this.printTreasureHuntRollup;
      //   break;
      // }
      case "ssmtRollup": {
        currentPrintOptions.printSsmtRollup = !currentPrintOptions.printSsmtRollup;
        break;
      }
      case "reportGraphs": {
        currentPrintOptions.printReportGraphs = !currentPrintOptions.printReportGraphs;
        break;
      }
      case "reportSankey": {
        currentPrintOptions.printReportSankey = !currentPrintOptions.printReportSankey;
        break;
      }
      case "results": {
        currentPrintOptions.printResults = !currentPrintOptions.printResults;
        break;
      }
      case "inputData": {
        currentPrintOptions.printInputData = !currentPrintOptions.printInputData;
        break;
      }
      case "energyUsed": {
        currentPrintOptions.printEnergyUsed = !currentPrintOptions.printEnergyUsed;
        break;
      }
      case "executiveSummary": {
        currentPrintOptions.printExecutiveSummary = !currentPrintOptions.printExecutiveSummary;
        break;
      }
      case "energySummary": {
        currentPrintOptions.printEnergySummary = !currentPrintOptions.printEnergySummary;
        break;
      }
      case "lossesSummary": {
        currentPrintOptions.printLossesSummary = !currentPrintOptions.printLossesSummary;
        break;
      }
      case "opportunityPayback": {
        currentPrintOptions.printReportOpportunityPayback = !currentPrintOptions.printReportOpportunityPayback;
      }
      case "opportunitySummary": {
        currentPrintOptions.printReportOpportunitySummary = !currentPrintOptions.printReportOpportunitySummary;
      }
      default: {
        break;
      }
    }
    this.rollupPrintOptions.next(currentPrintOptions);
  }

  setAll(bool: boolean): RollupPrintOptions {
    return {
      printPsatRollup: bool,
      printPhastRollup: bool,
      printFsatRollup: bool,
      // this.printTreasureHuntRollup: boolean;
      // this.printSsmtRollup: boolean;
      printReportGraphs: bool,
      printReportSankey: bool,
      printResults: bool,
      printInputData: bool,
      printExecutiveSummary: bool,
      printEnergyUsed: bool,
      printEnergySummary: bool,
      printLossesSummary: bool,
      printReportOpportunityPayback: bool,
      printReportOpportunitySummary: bool,
      printSsmtRollup: bool,
      selectAll: bool
    }
  }
}


export interface RollupPrintOptions {
  printPsatRollup: boolean;
  printPhastRollup: boolean;
  printFsatRollup: boolean;
  // this.printTreasureHuntRollup: boolean;
  // this.printSsmtRollup: boolean;
  printReportGraphs: boolean;
  printReportSankey: boolean;
  printResults: boolean;
  printInputData: boolean;
  printExecutiveSummary: boolean;
  printEnergyUsed: boolean;
  printEnergySummary: boolean;
  printLossesSummary: boolean;
  printReportOpportunityPayback: boolean;
  printReportOpportunitySummary: boolean;
  printSsmtRollup: boolean;
  selectAll: boolean;
}
