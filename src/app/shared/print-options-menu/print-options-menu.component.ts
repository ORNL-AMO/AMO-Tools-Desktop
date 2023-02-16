import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
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
import { CompressedAirReportRollupService } from '../../report-rollup/compressed-air-report-rollup.service';

@Component({
  selector: 'app-print-options-menu',
  templateUrl: './print-options-menu.component.html',
  styleUrls: ['./print-options-menu.component.css']
})
export class PrintOptionsMenuComponent implements OnInit {

  @ViewChild('printMenuModal', { static: false }) public printMenuModal: ModalDirective;

  settings: Settings;
  printOptions: PrintOptions;
  printOptionsSub: Subscription;
  showRollupReportOptions: boolean = false;
  showPsatReportOptions: boolean = false;
  showFsatReportOptions: boolean = false;
  showPhastReportOptions: boolean = false;
  showSsmtReportOptions: boolean = false;
  showTHReportOptions: boolean = false;
  showWasteWaterOptions: boolean = false;
  showCompressedAirOptions: boolean = false;
  isPowerSankeyPrintViewReadySub: Subscription;
  printProcessTimeout;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private windowRefService: WindowRefService, private treasureHuntReportRollupService: TreasureHuntReportRollupService,
    private psatReportRollupService: PsatReportRollupService, private phastReportRollupService: PhastReportRollupService, private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService, private wasteWaterReportRollupService: WasteWaterReportRollupService,
    private compressedAirReportRollupService: CompressedAirReportRollupService) { }

  ngOnInit() {
    this.printOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.printOptions = val;
    });

    this.isPowerSankeyPrintViewReadySub = this.printOptionsMenuService.isPowerSankeyPrintViewReady.subscribe(isReady => {
      if (this.printOptionsMenuService.showPrintView.getValue() === true && isReady) {
        this.print();
      }
    });

    this.setContext();
    this.printOptions = this.printOptionsMenuService.setPrintOptionsFromSettings();
  }

  ngAfterViewInit() {
    this.showPrintModal();
  }

  ngOnDestroy() {
    this.printOptionsSub.unsubscribe();
    this.isPowerSankeyPrintViewReadySub.unsubscribe();
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
    } else if (printContext == 'compressedAir') {
      this.showCompressedAirOptions = true;
    } else if (printContext == 'reportRollup') {
      this.showRollupReportOptions = true;
      this.showPsatReportOptions = (this.psatReportRollupService.psatAssessments.getValue().length != 0);
      this.showFsatReportOptions = (this.fsatReportRollupService.fsatAssessments.getValue().length != 0);
      this.showPhastReportOptions = (this.phastReportRollupService.phastAssessments.getValue().length != 0);
      this.showSsmtReportOptions = (this.ssmtReportRollupService.ssmtAssessments.getValue().length != 0);
      this.showTHReportOptions = (this.treasureHuntReportRollupService.treasureHuntAssessments.getValue().length != 0);
      this.showWasteWaterOptions = (this.wasteWaterReportRollupService.wasteWaterAssessments.getValue().length != 0);
      this.showCompressedAirOptions = (this.compressedAirReportRollupService.compressedAirAssessments.getValue().length != 0)

    }
  }

  togglePrint(option: string) {
    this.printOptionsMenuService.toggleSection(option, this.printOptions);
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

  setPrintView() {
    this.printMenuModal.hide();
    this.printMenuModal.onHidden.subscribe(() => {
      this.printOptionsMenuService.showPrintView.next(true);
      // wait for sankey data dependency via subscription, or cancel
      // if multiple dependencies come up, use forkJoin to wait for all observables
      this.printProcessTimeout = setTimeout(() => {
        this.hidePrintView();
      }, 45000)
      
    });
  }

  print() {
    clearTimeout(this.printProcessTimeout);
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      this.hidePrintView()
    }, 200);
  }

  hidePrintView() {
    this.printOptionsMenuService.showPrintView.next(false);
    this.printOptionsMenuService.showPrintMenu.next(false);
  }

}
