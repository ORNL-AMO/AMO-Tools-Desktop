import { Component, OnInit, Input, Output, ViewChild, EventEmitter, TemplateRef, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WindowRefService } from '../../indexedDb/window-ref.service';

@Component({
  selector: 'app-print-options-menu',
  templateUrl: './print-options-menu.component.html',
  styleUrls: ['./print-options-menu.component.css']
})
export class PrintOptionsMenuComponent implements OnInit {
  @Input()
  showRollupReportOptions: boolean;
  @Input()
  showPsatReportOptions: boolean;
  @Input()
  showFsatReportOptions: boolean;
  @Input()
  showPhastReportOptions: boolean;
  @Input()
  showSsmtReportOptions: boolean;
  @Input()
  showTHReportOptions: boolean;
  @Input()
  selectAll: boolean;
  @Input()
  printReportGraphs: boolean;
  @Input()
  printReportSankey: boolean;
  @Input()
  printResults: boolean;
  @Input()
  printInputData: boolean;
  @Input()
  printPsatRollup: boolean;
  @Input()
  printFsatRollup: boolean;
  @Input()
  printPhastRollup: boolean;
  @Input()
  printSsmtRollup: boolean;

  @Input()
  printEnergySummary: boolean;
  @Input()
  printLossesSummary: boolean;
  @Input()
  printReportDiagram: boolean;

  //---- phast-specific options --------
  @Input()
  printEnergyUsed: boolean;
  //---- end phast-specific options ----

  //phast and treasure hunt
  @Input()
  printExecutiveSummary: boolean;

  //---- treasure hunt specific options ----
  @Input()
  printReportOpportunitySummary: boolean;
  @Input()
  printReportOpportunityPayback: boolean;
  //---- end treasure hunt specific options ---

  @Output('emitTogglePrint')
  emitTogglePrint = new EventEmitter<string>();
  @Output('emitClosePrintMenu')
  emitClosePrintMenu = new EventEmitter<boolean>();
  @Output('emitPrint')
  emitPrint = new EventEmitter<void>();

  @ViewChild('printMenuModal') public printMenuModal: ModalDirective;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showPrintModal();
  }

  togglePrint(option: string) {
    this.emitTogglePrint.emit(option);
  }

  showPrintModal(): void {
    this.printMenuModal.show();
  }

  closePrintModal(reset: boolean): void {
    this.printMenuModal.hide();
    this.emitClosePrintMenu.emit(reset);
  }

  print(): void {
    this.emitPrint.emit();
    this.closePrintModal(false);
  }
}
