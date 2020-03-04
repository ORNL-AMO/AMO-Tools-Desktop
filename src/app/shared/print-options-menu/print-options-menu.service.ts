import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrintOptions } from '../models/printing';

@Injectable()
export class PrintOptionsMenuService {

  printOptions: BehaviorSubject<PrintOptions>;
  showPrintView: BehaviorSubject<boolean>;
  showPrintOptionsModal: BehaviorSubject<boolean>;
  printContext: BehaviorSubject<string>;
  showPrintMenu: BehaviorSubject<boolean>;
  constructor() {
    let initPrintOptions: PrintOptions = this.setAll(true);
    this.printOptions = new BehaviorSubject<PrintOptions>(initPrintOptions);
    this.showPrintView = new BehaviorSubject<boolean>(false);
    this.showPrintOptionsModal = new BehaviorSubject<boolean>(false);
    this.printContext = new BehaviorSubject<string>(undefined);
    this.showPrintMenu = new BehaviorSubject<boolean>(false);
  }


  toggleSection(section: string): void {
    let currentPrintOptions: PrintOptions = this.printOptions.getValue();
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
    this.printOptions.next(currentPrintOptions);
  }

  setAll(bool: boolean): PrintOptions {
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
