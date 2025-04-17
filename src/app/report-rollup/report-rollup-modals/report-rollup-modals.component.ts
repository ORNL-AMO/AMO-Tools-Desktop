import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportRollupService } from '../report-rollup.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Calculator } from '../../shared/models/calculators';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
    selector: 'app-report-rollup-modals',
    templateUrl: './report-rollup-modals.component.html',
    styleUrls: ['./report-rollup-modals.component.css'],
    standalone: false
})
export class ReportRollupModalsComponent implements OnInit {

  @ViewChild('assessmentRollupModal', { static: false }) public assessmentRollupModal: ModalDirective;
  showPrintMenu: boolean = false;
  rollupPrintOptions: PrintOptions;
  rollupPrintOptionsSub: Subscription;
  showPsatReportOptions: boolean;
  showFsatReportOptions: boolean;
  showSsmtReportOptions: boolean;
  showPhastReportOptions: boolean;
  showTHReportOptions: boolean;
  showPrintMenuSub: Subscription;
  showSummaryModalSub: Subscription;
  assessmentModalType: string;
  assessmentModalLabel: string;
  selectedCalculators: Array<Calculator>;
  displayModalContent: boolean = false;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    this.rollupPrintOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.rollupPrintOptions = val;
    });

    this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
      this.printOptionsMenuService.printContext.next('reportRollup');
      this.showPrintMenu = val;
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
    this.showPrintMenuSub.unsubscribe();
    this.showSummaryModalSub.unsubscribe();
  }

  showAssessmentRollupModal() {
    this.assessmentRollupModal.show();
    this.assessmentRollupModal.onShown.subscribe(val => {
      this.displayModalContent = true;
    });

  }

  hideAssessmentRollupModal() {
    this.assessmentRollupModal.hide();
    this.assessmentRollupModal.onHidden.subscribe(val => {
      this.displayModalContent = false;
    });
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
    } else if (this.assessmentModalType == 'treasureHunt') {
      this.assessmentModalLabel = 'Treasure Hunt Rollup';
    } else if (this.assessmentModalType == 'waste-water') {
      this.assessmentModalLabel = 'Waste Water Rollup';
    } else if(this.assessmentModalType == 'compressed-air'){
      this.assessmentModalLabel = 'Compressed Air Rollup';
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
}
