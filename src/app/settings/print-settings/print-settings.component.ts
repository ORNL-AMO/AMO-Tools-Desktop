import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';
import { Settings } from '../../shared/models/settings';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.css']
})
export class PrintSettingsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('savePrintSettings')
  savePrintSettings = new EventEmitter<boolean>();

  selectAllOptions: boolean = true;

  printOptions: PrintOptions;
  printOptionsSub: Subscription;

  constructor(private printOptionsMenuService: PrintOptionsMenuService) { }

  ngOnInit() {
    this.checkSelectAll();
    // this.printOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
    //   this.printOptions = val;
    // });
  }

  // ngOnDestroy() {
  //   this.printOptionsSub.unsubscribe();
  // }

  // togglePrint(option: string) {
  //   //this.printPsatRollup = !this.printPsatRollup;
  //   this.printOptionsMenuService.toggleSection(option);
  // }

  checkSelectAll(){
    this.selectAllOptions = (
      this.settings.printPsatRollup &&
      this.settings.printPhastRollup &&
      this.settings.printFsatRollup &&
      this.settings.printTreasureHuntRollup &&
      this.settings.printReportGraphs &&
      this.settings.printReportSankey &&
      this.settings.printResults &&
      this.settings.printInputData &&
      this.settings.printExecutiveSummary &&
      this.settings.printEnergySummary &&
      this.settings.printLossesSummary &&
      this.settings.printReportOpportunityPayback &&
      this.settings.printReportOpportunitySummary &&
      this.settings.printSsmtRollup &&
      this.settings.printWasteWaterRollup &&
      this.settings.printDetailedResults &&
      this.settings.printReportDiagram &&
      this.settings.selectAll
    );
  }

  toggleSelectAll() {
    this.selectAllOptions = !this.selectAllOptions;
    this.settings.printPsatRollup = this.selectAllOptions;
    this.settings.printPhastRollup = this.selectAllOptions;
    this.settings.printFsatRollup = this.selectAllOptions;
    this.settings.printTreasureHuntRollup = this.selectAllOptions;
    this.settings.printReportGraphs = this.selectAllOptions;
    this.settings.printReportSankey = this.selectAllOptions;
    this.settings.printResults = this.selectAllOptions;
    this.settings.printInputData = this.selectAllOptions;
    this.settings.printExecutiveSummary = this.selectAllOptions;
    this.settings.printEnergySummary = this.selectAllOptions;
    this.settings.printLossesSummary = this.selectAllOptions;
    this.settings.printReportOpportunityPayback = this.selectAllOptions;
    this.settings.printReportOpportunitySummary = this.selectAllOptions;
    this.settings.printSsmtRollup = this.selectAllOptions;
    this.settings.printWasteWaterRollup = this.selectAllOptions;
    this.settings.printDetailedResults = this.selectAllOptions;
    this.settings.printReportDiagram = this.selectAllOptions;
    this.settings.selectAll = this.selectAllOptions;
    this.savePrintSettings.emit(true);
  }

  togglePrintPsatRollup() {
    this.settings.printPsatRollup = !this.settings.printPsatRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintPhastRollup() {
    this.settings.printPhastRollup = !this.settings.printPhastRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintFsatRollup() {
    this.settings.printFsatRollup = !this.settings.printFsatRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintTreasureHuntRollup() {
    this.settings.printTreasureHuntRollup = !this.settings.printTreasureHuntRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintReportGraphs() {
    this.settings.printReportGraphs = !this.settings.printReportGraphs;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintReportSankey() {
    this.settings.printReportSankey = !this.settings.printReportSankey;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintResults() {
    this.settings.printResults = !this.settings.printResults;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);    
  }

  togglePrintInputData() {
    this.settings.printInputData = !this.settings.printInputData;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintExecutiveSummary() {
    this.settings.printExecutiveSummary = !this.settings.printExecutiveSummary;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintEnergySummary() {
    this.settings.printEnergySummary = !this.settings.printEnergySummary;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintLossesSummary() {
    this.settings.printLossesSummary = !this.settings.printLossesSummary;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintReportOpportunityPayback() {
    this.settings.printReportOpportunityPayback = !this.settings.printReportOpportunityPayback;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintReportOpportunitySummary() {
    this.settings.printReportOpportunitySummary = !this.settings.printReportOpportunitySummary;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintSsmtRollup() {
    this.settings.printSsmtRollup = !this.settings.printSsmtRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintWasteWaterRollup() {
    this.settings.printWasteWaterRollup = !this.settings.printWasteWaterRollup;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintDetailedResults() {
    this.settings.printDetailedResults = !this.settings.printDetailedResults;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

  togglePrintReportDiagram() {
    this.settings.printReportDiagram = !this.settings.printReportDiagram;
    this.checkSelectAll();
    this.savePrintSettings.emit(true);
  }

}
