import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PrintOptions } from '../models/printing';
import { Settings } from '../models/settings';

@Injectable()
export class PrintOptionsMenuService {

  settings: Settings;
  printOptions: BehaviorSubject<PrintOptions>;
  showPrintView: BehaviorSubject<boolean>;
  printContext: BehaviorSubject<string>;
  showPrintMenu: BehaviorSubject<boolean>;
  constructor(private settingsDbService: SettingsDbService) {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let initPrintOptions: PrintOptions = this.setAllFromSettings(this.settings);
    this.printOptions = new BehaviorSubject<PrintOptions>(initPrintOptions);
    this.showPrintView = new BehaviorSubject<boolean>(false);
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
      case "treasureHuntRollup": {
        currentPrintOptions.printTreasureHuntRollup = !currentPrintOptions.printTreasureHuntRollup;
        break;
      }
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
        break;
      }
      case "opportunitySummary": {
        currentPrintOptions.printReportOpportunitySummary = !currentPrintOptions.printReportOpportunitySummary;
        break;
      }
      case "printWasteWaterRollup": {
        currentPrintOptions.printWasteWaterRollup = !currentPrintOptions.printWasteWaterRollup;
        break;
      }
      case "detailedResults": {
        currentPrintOptions.printDetailedResults = !currentPrintOptions.printDetailedResults;
        break;
      }
      case "reportDiagram": {
        currentPrintOptions.printReportDiagram = !currentPrintOptions.printReportDiagram;
        break;
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

  setAllFromSettings(settings: Settings): PrintOptions {
    return {
      printPsatRollup: settings.printPsatRollup,
      printPhastRollup: settings.printPhastRollup,
      printFsatRollup: settings.printFsatRollup,
      printTreasureHuntRollup: settings.printTreasureHuntRollup,
      printReportGraphs: settings.printReportGraphs,
      printReportSankey: settings.printReportSankey,
      printResults: settings.printResults,
      printInputData: settings.printInputData,
      printExecutiveSummary: settings.printExecutiveSummary,
      printEnergySummary: settings.printEnergySummary,
      printLossesSummary: settings.printLossesSummary,
      printReportOpportunityPayback: settings.printReportOpportunityPayback,
      printReportOpportunitySummary: settings.printReportOpportunitySummary,
      printSsmtRollup: settings.printSsmtRollup,
      printWasteWaterRollup: settings.printWasteWaterRollup,
      printDetailedResults: settings.printDetailedResults,
      printReportDiagram: settings.printReportDiagram,
      selectAll: settings.printAll
    }
  }
}
