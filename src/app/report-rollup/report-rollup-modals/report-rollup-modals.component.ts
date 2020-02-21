import { Component, OnInit } from '@angular/core';
import { RollupPrintService, RollupPrintOptions } from '../rollup-print.service';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-report-rollup-modals',
  templateUrl: './report-rollup-modals.component.html',
  styleUrls: ['./report-rollup-modals.component.css']
})
export class ReportRollupModalsComponent implements OnInit {

  showPrintMenu: boolean = false;
  rollupPrintOptions: RollupPrintOptions;
  rollupPrintOptionsSub: Subscription;
  showPsatReportOptions: boolean;
  showFsatReportOptions: boolean;
  showSsmtReportOptions: boolean;
  showPhastReportOptions: boolean;
  showTHReportOptions: boolean;
  showPrintOptionsModalSub: Subscription;
  constructor(private rollupPrintService: RollupPrintService, private windowRefService: WindowRefService, private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    this.rollupPrintOptionsSub = this.rollupPrintService.rollupPrintOptions.subscribe(val => {
      this.rollupPrintOptions = val;
    });

    this.showPrintOptionsModalSub = this.rollupPrintService.showPrintOptionsModal.subscribe(val => {
      console.log(this.showPrintMenu);
      console.log(val);
      if (val == true) {
        this.showPrintModal();
      }
    });
  }

  ngOnDestroy(){
    this.rollupPrintOptionsSub.unsubscribe();
    this.showPrintOptionsModalSub.unsubscribe();
  }

  showPrintModal() {
    this.showPsatReportOptions = this.reportRollupService.numPsats != 0;
    this.showFsatReportOptions = this.reportRollupService.numFsats != 0;
    this.showSsmtReportOptions = this.reportRollupService.numSsmt != 0;
    this.showPhastReportOptions = this.reportRollupService.numPhasts != 0;
    this.showTHReportOptions = this.reportRollupService.numTreasureHunt != 0;
    this.showPrintMenu = true;
    console.log(this.showPrintMenu);
  }

  closePrintModal() {
    this.showPrintMenu = false;
    this.rollupPrintService.showPrintOptionsModal.next(false);
  }

  togglePrint(section: string): void {
    this.rollupPrintService.toggleSection(section);
  }

  setPrintViewThenPrint() {
    this.rollupPrintService.showPrintView.next(true);
    let tmpPrintBuildTime = 100;
    if (this.reportRollupService.numSsmt > 0) {
      tmpPrintBuildTime += (500 * this.reportRollupService.numSsmt);
    }
    setTimeout(() => {
      this.print();
    }, tmpPrintBuildTime);
  }

  print() {
    this.showPrintMenu = false;
    //set timeout for delay to print call. May want to do this differently later but for now should work
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      //after printing hide content again
      this.rollupPrintService.showPrintView.next(false);
    }, 5000);
  }
}
