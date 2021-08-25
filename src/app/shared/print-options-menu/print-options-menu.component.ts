import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PrintOptionsMenuService } from './print-options-menu.service';
import { PrintOptions } from '../models/printing';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { ReportRollupService } from '../../report-rollup/report-rollup.service';
import { PsatReportRollupService } from '../../report-rollup/psat-report-rollup.service';
import { PhastReportRollupService } from '../../report-rollup/phast-report-rollup.service';
import { FsatReportRollupService } from '../../report-rollup/fsat-report-rollup.service';
import { SsmtReportRollupService } from '../../report-rollup/ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from '../../report-rollup/treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from '../../report-rollup/waste-water-report-rollup.service';
import { Settings } from '../models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-print-options-menu',
  templateUrl: './print-options-menu.component.html',
  styleUrls: ['./print-options-menu.component.css']
})
export class PrintOptionsMenuComponent implements OnInit {

  @ViewChild('printMenuModal', { static: false }) public printMenuModal: ModalDirective;

  settings: Settings;
  printOptions: PrintOptions;
  showRollupReportOptions: boolean = false;
  showPsatReportOptions: boolean = false;
  showFsatReportOptions: boolean = false;
  showPhastReportOptions: boolean = false;
  showSsmtReportOptions: boolean = false;
  showTHReportOptions: boolean = false;
  showWasteWaterOptions: boolean = false;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private windowRefService: WindowRefService, private treasureHuntReportRollupService: TreasureHuntReportRollupService,
    private psatReportRollupService: PsatReportRollupService, private phastReportRollupService: PhastReportRollupService, private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService, private wasteWaterReportRollupService: WasteWaterReportRollupService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.setContext();
    this.printOptions = this.setValuesFromSettings();
  }

  ngAfterViewInit() {
    this.showPrintModal();
  }
  setContext() {
    let printContext: string = this.printOptionsMenuService.printContext.getValue();
    if (printContext == 'psat') {
      this.showPsatReportOptions = true;
    } else if (printContext == 'fsat') {
      this.showFsatReportOptions = true;
    } else if (printContext == 'ssmt') {
      this.showSsmtReportOptions = true;
    } else if (printContext == 'phast') {
      this.showPhastReportOptions = true;
    } else if (printContext == 'treasureHunt') {
      this.showTHReportOptions = true;
    } else if (printContext == 'wasteWater') {
      this.showWasteWaterOptions = true;
    } else if (printContext == 'reportRollup') {
      this.showRollupReportOptions = true;
      this.showPsatReportOptions = (this.psatReportRollupService.psatAssessments.getValue().length != 0);
      this.showFsatReportOptions = (this.fsatReportRollupService.fsatAssessments.getValue().length != 0);
      this.showPhastReportOptions = (this.phastReportRollupService.phastAssessments.getValue().length != 0);
      this.showSsmtReportOptions = (this.ssmtReportRollupService.ssmtAssessments.getValue().length != 0);
      this.showTHReportOptions = (this.treasureHuntReportRollupService.treasureHuntAssessments.getValue().length != 0);
      this.showWasteWaterOptions = (this.wasteWaterReportRollupService.wasteWaterAssessments.getValue().length != 0);
    }
  }

  showPrintModal(): void {
    this.printMenuModal.show();
  }

  closePrintModal() {
    this.printMenuModal.hide();
    this.printMenuModal.onHidden.subscribe(() => {
      this.printOptionsMenuService.showPrintMenu.next(false);
    });
  }

  setPrintViewThenPrint() {
    this.printMenuModal.hide();
    this.printMenuModal.onHidden.subscribe(() => {
      this.printOptionsMenuService.showPrintView.next(true);
      let tmpPrintBuildTime: number = 2000;
      setTimeout(() => {
        this.print();
      }, tmpPrintBuildTime);
    });
  }

  print() {
    // this.showPrintMenu = false;
    //set timeout for delay to print call. May want to do this differently later but for now should work
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      //after printing hide content again
      this.printOptionsMenuService.showPrintView.next(false);
      this.printOptionsMenuService.showPrintMenu.next(false);
    }, 200);
  }

  togglePrint(section: string) {
    let currentPrintOptions: PrintOptions = this.printOptions;
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
    this.printOptions = currentPrintOptions;
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

  setValuesFromSettings(): PrintOptions{
    return {
      printPsatRollup: this.settings.printPsatRollup,
      printPhastRollup: this.settings.printPhastRollup,
      printFsatRollup: this.settings.printFsatRollup,
      printTreasureHuntRollup: this.settings.printTreasureHuntRollup,
      printReportGraphs: this.settings.printReportGraphs,
      printReportSankey: this.settings.printReportSankey,
      printResults: this.settings.printResults,
      printInputData: this.settings.printInputData,
      printExecutiveSummary: this.settings.printExecutiveSummary,
      printEnergySummary: this.settings.printEnergySummary,
      printLossesSummary: this.settings.printLossesSummary,
      printReportOpportunityPayback: this.settings.printReportOpportunityPayback,
      printReportOpportunitySummary: this.settings.printReportOpportunitySummary,
      printSsmtRollup: this.settings.printSsmtRollup,
      printWasteWaterRollup: this.settings.printWasteWaterRollup,
      printDetailedResults: this.settings.printDetailedResults,
      printReportDiagram: this.settings.printReportDiagram,
      selectAll: this.settings.printAll
    }

  }

}
