import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ReportRollupService, PhastResultsData, ReportItem } from './report-rollup.service';
import { PhastReportService } from '../phast/phast-report/phast-report.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Settings } from '../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { AssessmentService } from '../assessment/assessment.service';
import { setTimeout } from 'timers';
import { Calculator } from '../shared/models/calculators';
import { SettingsService } from '../settings/settings.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-report-rollup',
  templateUrl: './report-rollup.component.html',
  styleUrls: ['./report-rollup.component.css']
})
export class ReportRollupComponent implements OnInit {

  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();

  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    // this.checkVisibleSummary();
    this.checkActiveAssessment();
  }
  @ViewChild('reportTemplate') reportTemplate: TemplateRef<any>;
  _reportAssessments: Array<ReportItem>;
  _phastAssessments: Array<ReportItem>;
  _psatAssessments: Array<ReportItem>;
  focusedAssessment: Assessment;
  //debug
  selectedCalcs: Array<Calculator>;
  directoryIds: Array<number>;
  bannerHeight: number;
  assessmentsGathered: boolean = true;
  isSummaryVisible: boolean = true;
  createdDate: Date;
  settings: Settings;
  @ViewChild('psatRollupModal') public psatRollupModal: ModalDirective;
  @ViewChild('unitModal') public unitModal: ModalDirective;
  @ViewChild('rollupModal') public rollupModal: ModalDirective;

  numPhasts: number = 0;
  numPsats: number = 0;
  sidebarHeight: number = 0;
  printView: boolean = false;
  reportAssessmentsSub: Subscription;
  phastAssessmentsSub: Subscription;
  allPhastSub: Subscription;
  selectedPhastSub: Subscription;
  psatAssessmentSub: Subscription;
  selectedCalcsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService, private phastReportService: PhastReportService,
    private windowRefService: WindowRefService, private settingsService: SettingsService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this._phastAssessments = new Array<ReportItem>();
    this._psatAssessments = new Array<ReportItem>();
    this.selectedCalcs = new Array<Calculator>();
    this.directoryIds = new Array<number>();

    // setTimeout(() => {
    //   this.assessmentsGathered = true;
    // }, 2000);

    // setTimeout(() => {
      // this.setSidebarHeight();
    // }, 2500);

    this.settings = this.settingsService.globalSettings;
    this.checkSettings();

    this.createdDate = new Date();
    this.reportAssessmentsSub = this.reportRollupService.reportAssessments.subscribe(items => {
      if (items) {
        if (items.length != 0) {
          this._reportAssessments = items;
          this.focusedAssessment = this._reportAssessments[this._reportAssessments.length -1].assessment;
        }
      }
    });
    this.assessmentService.showFeedback.next(false);
    this.allPhastSub = this.reportRollupService.allPhastResults.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initPhastCompare(val);
      }
    });
    this.selectedPhastSub = this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.getPhastResultsFromSelected(val);
      }
    });
    this.psatAssessmentSub = this.reportRollupService.psatAssessments.subscribe(items => {
      if (items) {
        if (items.length != 0) {
          this._psatAssessments = items;
          this.numPsats = this._psatAssessments.length;
        }
      }
    });
    this.phastAssessmentsSub = this.reportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        if (items.length != 0) {
          this.reportRollupService.initPhastResultsArr(items);
          this._phastAssessments = items;
          this.numPhasts = this._phastAssessments.length;
        }
      }
    });
    //gets calculators for pre assessment rollup
    this.selectedCalcsSub = this.reportRollupService.selectedCalcs.subscribe(items => {
      if (items) {
        if (items.length != 0) {
          this.selectedCalcs = items;
          for (let i = 0; i < this.selectedCalcs.length; i++) {
            this.directoryIds.push(this.selectedCalcs[i].directoryId);
          }
        }
      }
    });
  }

  ngAfterViewInit(){
    setTimeout(()=> {
      this.setSidebarHeight();
    },500)
  }

  ngOnDestroy() {
    this.assessmentService.showFeedback.next(true);
    this.reportRollupService.initSummary();
    if (this.reportAssessmentsSub) this.reportAssessmentsSub.unsubscribe();
    if (this.phastAssessmentsSub) this.phastAssessmentsSub.unsubscribe();
    if (this.allPhastSub) this.allPhastSub.unsubscribe();
    if (this.selectedPhastSub) this.selectedPhastSub.unsubscribe();
    if (this.psatAssessmentSub) this.psatAssessmentSub.unsubscribe();
    if (this.selectedCalcsSub) this.selectedCalcsSub.unsubscribe();
  }

  checkSettings() {
    if (!this.settings.phastRollupElectricityUnit) {
      this.settings.phastRollupElectricityUnit = 'kWh';
    }
    if (!this.settings.phastRollupFuelUnit) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.settings.phastRollupFuelUnit = 'GJ';
      } else {
        this.settings.phastRollupFuelUnit = 'MMBtu';
      }
    }
    if (!this.settings.phastRollupSteamUnit) {
      if (this.settings.unitsOfMeasure == 'Metric') {
        this.settings.phastRollupSteamUnit = 'GJ';
      } else {
        this.settings.phastRollupSteamUnit = 'MMBtu';
      }
    }
  }

  exportToCsv() {
    // let tmpDataArr = new Array();
    // this.exportReports.forEach(report => {
    //   let tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, report.assessment.psat);
    //   tmpDataArr.push(tmpData);
    //   if (report.assessment.psat.modifications) {
    //     report.assessment.psat.modifications.forEach(mod => {
    //       tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, mod.psat);
    //       tmpDataArr.push(tmpData);
    //     })
    //   }
    // })
    // this.jsonToCsvService.downloadData(tmpDataArr, 'psatRollup');
  }

  setPrintViewThenPrint() {

    this.printView = true;
    setTimeout(() => {
      this.print();
    }, 100);
  }

  print() {
    // let win = this.windowRefService.nativeWindow;
    // let doc = this.windowRefService.getDoc();
    // win.print();
    //this.printView = true;
    this.phastReportService.showPrint.next(true);


    //eventually add logic for modal or something to say "building print view"

    //set timeout for delay to print call. May want to do this differently later but for now should work
    //10000000 is excessive, put it at whatever you want
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      let doc = this.windowRefService.getDoc();
      win.print();
      //after printing hide content again
      this.phastReportService.showPrint.next(false);
      this.printView = false;
    }, 5000);
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }

  setSidebarHeight() {
    let doc = this.windowRefService.getDoc();
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    let header = doc.getElementById('reportHeader');
    this.bannerHeight = header.clientHeight;
    this.sidebarHeight = wndHeight - this.bannerHeight;
  }

  checkActiveAssessment() {
    let doc = this.windowRefService.getDoc();
    let window = this.windowRefService.nativeWindow;
    let container = doc.getElementById('reportHeader');
    let scrollAmount = (window.pageYOffset !== undefined) ? window.pageYOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollTop;
    if (container && scrollAmount) {
      this._reportAssessments.forEach(item => {
        let element = doc.getElementById('assessment_' + item.assessment.id);
        let diff = Math.abs(Math.abs(container.clientHeight - element.offsetTop) - scrollAmount);
        if (diff > 0 && diff < 50) {
          this.focusedAssessment = item.assessment;
        }
      })
    }
  }

  selectAssessment(item: ReportItem) {
    let doc = this.windowRefService.getDoc();
    let element = doc.getElementById('assessment_' + item.assessment.id);
    let container = doc.getElementById('reportHeader');
    this.focusedAssessment = item.assessment;
    element.scrollIntoView({ behavior: 'smooth' });
    let window = this.windowRefService.nativeWindow;
    let scrlAmnt = 0 - (container.clientHeight + 25);
    window.scrollBy(0, scrlAmnt)
  }

  showModal() {
    this.rollupModal.show();
  }

  hideModal() {
    this.rollupModal.hide();
  }

  showUnitModal() {
    this.unitModal.show();
  }

  hideUnitModal() {
    this.unitModal.hide();
  }

  showPsatModal() {
    this.psatRollupModal.show();
  }

  hidePsatModal() {
    this.psatRollupModal.hide();
  }
}