import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PrintOptionsMenuService } from './print-options-menu.service';
import { PrintOptions } from '../models/printing';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { ReportRollupService } from '../../report-rollup/report-rollup.service';
@Component({
  selector: 'app-print-options-menu',
  templateUrl: './print-options-menu.component.html',
  styleUrls: ['./print-options-menu.component.css']
})
export class PrintOptionsMenuComponent implements OnInit {

  @ViewChild('printMenuModal', { static: false }) public printMenuModal: ModalDirective;

  printOptions: PrintOptions;
  printOptionsSub: Subscription;
  showRollupReportOptions: boolean = false;
  showPsatReportOptions: boolean = false;
  showFsatReportOptions: boolean = false;
  showPhastReportOptions: boolean = false;
  showSsmtReportOptions: boolean = false;
  showTHReportOptions: boolean = false;

  constructor(private printOptionsMenuService: PrintOptionsMenuService, private windowRefService: WindowRefService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.setContext();
    this.printOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.printOptions = val;
    });
  }

  ngAfterViewInit() {
    this.showPrintModal();
  }

  ngOnDestroy() {
    this.printOptionsSub.unsubscribe();
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
    } else if (printContext == 'reportRollup') {
      this.showRollupReportOptions = true;
      this.showPsatReportOptions = (this.reportRollupService.numPsats != 0);
      this.showFsatReportOptions = (this.reportRollupService.numFsats != 0);
      this.showPhastReportOptions = (this.reportRollupService.numPhasts != 0);
      this.showSsmtReportOptions = (this.reportRollupService.numSsmt != 0);
      this.showTHReportOptions = (this.reportRollupService.numTreasureHunt != 0);
    }
  }

  togglePrint(option: string) {
    this.printOptionsMenuService.toggleSection(option);
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
      // if (this.reportRollupService.numSsmt > 0) {
      //   tmpPrintBuildTime += (500 * this.reportRollupService.numSsmt);
      // }
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
}
