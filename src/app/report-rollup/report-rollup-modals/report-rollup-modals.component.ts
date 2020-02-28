import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { ReportRollupService } from '../report-rollup.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-report-rollup-modals',
  templateUrl: './report-rollup-modals.component.html',
  styleUrls: ['./report-rollup-modals.component.css']
})
export class ReportRollupModalsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('assessmentRollupModal', { static: false }) public assessmentRollupModal: ModalDirective;
  showPrintMenu: boolean = false;
  rollupPrintOptions: PrintOptions;
  rollupPrintOptionsSub: Subscription;
  showPsatReportOptions: boolean;
  showFsatReportOptions: boolean;
  showSsmtReportOptions: boolean;
  showPhastReportOptions: boolean;
  showTHReportOptions: boolean;
  showPrintOptionsModalSub: Subscription;
  showSummaryModalSub: Subscription;
  assessmentModalType: string;
  assessmentModalLabel: string;
  selectedCalculators: Array<Calculator>;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private windowRefService: WindowRefService, private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    this.rollupPrintOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.rollupPrintOptions = val;
    });

    this.showPrintOptionsModalSub = this.printOptionsMenuService.showPrintOptionsModal.subscribe(val => {
      if (val == true) {
        this.showPrintModal();
      }
    });

    this.showSummaryModalSub = this.reportRollupService.showSummaryModal.subscribe(val => {
      this.assessmentModalType = val;
      this.setAssessmentModalLabel();
      this.setSelectedCalculators();
      if (this.assessmentModalType != undefined) {
        this.showAssessmentRollupModal();
      }
    });
  }

  ngOnDestroy() {
    this.rollupPrintOptionsSub.unsubscribe();
    this.showPrintOptionsModalSub.unsubscribe();
    this.showSummaryModalSub.unsubscribe();
  }

  showAssessmentRollupModal() {
    this.assessmentRollupModal.show();
  }

  hideAssessmentRollupModal() {
    this.assessmentRollupModal.hide();
  }

  setAssessmentModalLabel() {
    if (this.assessmentModalType == 'psat') {
      this.assessmentModalLabel = 'Pump Assessment Rollup';
    } else if (this.assessmentModalType == 'fsat') {
      this.assessmentModalLabel = 'Fan Assessment Rollup';
    } else if (this.assessmentModalType == 'phast') {
      this.assessmentModalLabel = 'Process Heating Rollup';
    } else if (this.assessmentModalType == 'ssmt') {
      this.assessmentModalLabel = 'Steam Assessment Rollup';
    } else if (this.assessmentModalType == 'unitsModal') {
      this.assessmentModalLabel = 'Report Units';
    }
  }

  setSelectedCalculators() {
    if (this.assessmentModalType == 'psat' || this.assessmentModalType == 'phast' || this.assessmentModalType == 'fsat') {
      let calcType: string;
      if (this.assessmentModalType == 'psat') {
        calcType = 'pump';
      } else if (this.assessmentModalType == 'fsat') {
        calcType = 'fan';
      } else if (this.assessmentModalType == 'phast') {
        calcType = 'furnace';
      }
      let selectedCalcItems: Array<Calculator> = this.reportRollupService.selectedCalcs.getValue();
      this.selectedCalculators = selectedCalcItems.filter(item => { return item.type == calcType });
    } else {
      this.selectedCalculators = [];
    }
  }

  showPrintModal() {
    this.showPsatReportOptions = this.reportRollupService.numPsats != 0;
    this.showFsatReportOptions = this.reportRollupService.numFsats != 0;
    this.showSsmtReportOptions = this.reportRollupService.numSsmt != 0;
    this.showPhastReportOptions = this.reportRollupService.numPhasts != 0;
    this.showTHReportOptions = this.reportRollupService.numTreasureHunt != 0;
    this.showPrintMenu = true;
  }

  closePrintModal() {
    this.showPrintMenu = false;
    this.printOptionsMenuService.showPrintOptionsModal.next(false);
  }

  togglePrint(section: string): void {
    this.printOptionsMenuService.toggleSection(section);
  }

  setPrintViewThenPrint() {
    this.printOptionsMenuService.showPrintView.next(true);
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
      this.printOptionsMenuService.showPrintView.next(false);
    }, 5000);
  }
}
