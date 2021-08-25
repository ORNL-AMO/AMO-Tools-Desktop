import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrintOptions } from '../models/printing';

@Injectable()
export class PrintOptionsMenuService {
  printOptions: BehaviorSubject<PrintOptions>;
  showPrintView: BehaviorSubject<boolean>;
  printContext: BehaviorSubject<string>;
  showPrintMenu: BehaviorSubject<boolean>;
  constructor() {
    let initPrintOptions: PrintOptions = this.setAll(true);
    this.printOptions = new BehaviorSubject<PrintOptions>(initPrintOptions);
    this.showPrintView = new BehaviorSubject<boolean>(false);
    this.printContext = new BehaviorSubject<string>(undefined);
    this.showPrintMenu = new BehaviorSubject<boolean>(false);
  }


  setAll(bool: boolean): PrintOptions {
    return {
      printPsatRollup: bool,
      printPhastRollup: bool,
      printFsatRollup: bool,
      printTreasureHuntRollup: bool,
      printReportGraphs: bool,
      printReportSankey: bool,
      printResults: bool,
      printInputData: bool,
      printExecutiveSummary: bool,
      printEnergySummary: bool,
      printLossesSummary: bool,
      printReportOpportunityPayback: bool,
      printReportOpportunitySummary: bool,
      printSsmtRollup: bool,
      printWasteWaterRollup: bool,
      printDetailedResults: bool,
      printReportDiagram: bool,
      selectAll: bool
    }
  }
 
}
