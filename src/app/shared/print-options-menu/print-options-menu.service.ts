import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PrintOptions } from '../models/printing';
import { Settings } from '../models/settings';

@Injectable()
export class PrintOptionsMenuService {
  printOptions: BehaviorSubject<PrintOptions>;
  showPrintView: BehaviorSubject<boolean>;
  printContext: BehaviorSubject<string>;
  showPrintMenu: BehaviorSubject<boolean>;
  isPowerSankeyPrintViewReady: BehaviorSubject<boolean>;
  constructor(private settingsDbService: SettingsDbService) {
    let initPrintOptions: PrintOptions = this.setPrintOptionsFromSettings();
    this.printOptions = new BehaviorSubject<PrintOptions>(initPrintOptions);
    this.showPrintView = new BehaviorSubject<boolean>(false);
    this.printContext = new BehaviorSubject<string>(undefined);
    this.showPrintMenu = new BehaviorSubject<boolean>(false);
    this.isPowerSankeyPrintViewReady = new BehaviorSubject<boolean>(false);
  }

  setPrintOptionsFromSettings() {
    let globalSettings = this.settingsDbService.globalSettings;
    
    let printOptions: PrintOptions = this.setValuesFromSettings(globalSettings);
    return printOptions;
  }

  toggleSection(section: string, currentPrintOptions: PrintOptions) {
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
      case "compressedAirRollup": {
        currentPrintOptions.printCompressedAirRollup = !currentPrintOptions.printCompressedAirRollup;
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
      case "printWaterSystemCostReport": {
        currentPrintOptions.printWaterSystemCostReport = !currentPrintOptions.printWaterSystemCostReport;
        break;
      }
      case "printWaterSystemSummary": {
        currentPrintOptions.printWaterSystemSummary = !currentPrintOptions.printWaterSystemSummary;
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
      case "systemProfiles": {
        currentPrintOptions.printSystemProfiles = !currentPrintOptions.printSystemProfiles;
        break;
      }
      case "performanceProfiles": {
        currentPrintOptions.printPerformanceProfiles = !currentPrintOptions.printPerformanceProfiles;
        break;
      }
      default: {
        break;
      }
    }

    this.printOptions.next(currentPrintOptions);
  }

  setValuesFromSettings(settings: Settings): PrintOptions {
    
    // printpsatrollup
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
      printWaterSystemSummary: settings.printWaterSystemSummary,
      printWaterSystemCostReport: settings.printWaterSystemCostReport,
      printEnergySummary: settings.printEnergySummary,
      printLossesSummary: settings.printLossesSummary,
      printReportOpportunityPayback: settings.printReportOpportunityPayback,
      printReportOpportunitySummary: settings.printReportOpportunitySummary,
      printSsmtRollup: settings.printSsmtRollup,
      printWasteWaterRollup: settings.printWasteWaterRollup,
      printDetailedResults: settings.printDetailedResults,
      printReportDiagram: settings.printReportDiagram,
      selectAll: settings.printAll,
      printCompressedAirRollup: settings.printCompressedAirRollup,
      printSystemProfiles: settings.printSystemProfiles,
      printPerformanceProfiles: settings.printPerformanceProfiles
    }
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
      printWaterSystemCostReport: bool,
      printWaterSystemSummary: bool,
      printEnergySummary: bool,
      printLossesSummary: bool,
      printReportOpportunityPayback: bool,
      printReportOpportunitySummary: bool,
      printSsmtRollup: bool,
      printWasteWaterRollup: bool,
      printDetailedResults: bool,
      printReportDiagram: bool,
      selectAll: bool,
      printCompressedAirRollup: bool,
      printSystemProfiles: bool,
      printPerformanceProfiles: bool
    }
  }
 
}
