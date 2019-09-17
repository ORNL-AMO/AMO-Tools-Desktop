import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ReportRollupService } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Settings } from '../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { Calculator } from '../shared/models/calculators';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { ReportItem } from './report-rollup-models';

@Component({
  selector: 'app-report-rollup',
  templateUrl: './report-rollup.component.html',
  styleUrls: ['./report-rollup.component.css']
})
export class ReportRollupComponent implements OnInit {

  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();
  @ViewChild('reportTemplate', { static: false }) reportTemplate: TemplateRef<any>;
  _reportAssessments: Array<ReportItem>;
  _phastAssessments: Array<ReportItem>;
  _psatAssessments: Array<ReportItem>;
  _fsatAssessments: Array<ReportItem>;
  _ssmtAssessments: Array<ReportItem>;
  _treasureHuntAssessments: Array<ReportItem>;
  focusedAssessment: Assessment;
  //debug
  selectedPhastCalcs: Array<Calculator>;
  selectedPsatCalcs: Array<Calculator>;
  selectedFsatCalcs: Array<Calculator>;
  directoryIds: Array<number>;
  bannerHeight: number;
  assessmentsGathered: boolean = false;
  isSummaryVisible: boolean = true;
  createdDate: Date;
  settings: Settings;
  @ViewChild('psatRollupModal', { static: false }) public psatRollupModal: ModalDirective;
  @ViewChild('unitModal', { static: false }) public unitModal: ModalDirective;
  @ViewChild('phastRollupModal', { static: false }) public phastRollupModal: ModalDirective;
  @ViewChild('fsatRollupModal', { static: false }) public fsatRollupModal: ModalDirective;
  @ViewChild('ssmtRollupModal', { static: false }) public ssmtRollupModal: ModalDirective;

  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  // @ViewChild('printMenuModal') public printMenuModal: ModalDirective;

  numPhasts: number = 0;
  numPsats: number = 0;
  numFsats: number = 0;
  numSsmt: number = 0;
  numTreasureHunt: number = 0;
  sidebarHeight: number = 0;
  printView: boolean = false;
  reportAssessmentsSub: Subscription;
  phastAssessmentsSub: Subscription;
  fsatAssessmentsSub: Subscription;
  allPhastSub: Subscription;
  selectedPhastSub: Subscription;
  psatAssessmentSub: Subscription;
  selectedCalcsSub: Subscription;
  ssmtAssessmentsSub: Subscription;
  treasureHuntAssesmentsSub: Subscription;

  showPrint: boolean = false;
  showPrintMenu: boolean = false;

  showPsatReportOptions: boolean = false;
  showFsatReportOptions: boolean = false;
  showPhastReportOptions: boolean = false;
  showSsmtReportOptions: boolean = false;
  showRollupReportOptions: boolean;
  selectAll: boolean = false;
  printReportGraphs: boolean = false;
  printReportSankey: boolean = false;
  printResults: boolean = false;
  printInputData: boolean = false;
  printPsatRollup: boolean = false;
  printPhastRollup: boolean = false;
  printFsatRollup: boolean = false;
  printEnergyUsed: boolean = false;
  printExecutiveSummary: boolean = false;
  printEnergySummary: boolean = false;
  printLossesSummary: boolean = false;

  gatheringAssessments: boolean = true;
  sidebarCollapsed: boolean = false;
  constructor(private reportRollupService: ReportRollupService, private windowRefService: WindowRefService, private settingsDbService: SettingsDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this._phastAssessments = new Array<ReportItem>();
    this._psatAssessments = new Array<ReportItem>();
    this._fsatAssessments = new Array<ReportItem>();
    this._ssmtAssessments = new Array<ReportItem>();
    this._treasureHuntAssessments = new Array<ReportItem>();

    this.selectedPhastCalcs = new Array<Calculator>();
    this.selectedPsatCalcs = new Array<Calculator>();
    this.selectedFsatCalcs = new Array<Calculator>();
    this.directoryIds = new Array<number>();

    setTimeout(() => {
      this.gatheringAssessments = false;
    }, 1000)

    setTimeout(() => {
      this.assessmentsGathered = true;
      this.cd.detectChanges();
    }, 1500);
    setTimeout(() => {
      this.setSidebarHeight();
      this.initPrintLogic();
      this.cd.detectChanges();
    }, 1600);

    this.settings = this.settingsDbService.globalSettings;
    this.checkSettings();

    this.createdDate = new Date();
    this.reportAssessmentsSub = this.reportRollupService.reportAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this._reportAssessments = items;
          // this.focusedAssessment = this._reportAssessments[this._reportAssessments.length - 1].assessment;
        }
      }
    });
    this.allPhastSub = this.reportRollupService.allPhastResults.subscribe(val => {
      if (val.length !== 0) {
        this.reportRollupService.initPhastCompare(val);
      }
    });
    this.selectedPhastSub = this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length !== 0) {
        this.reportRollupService.getPhastResultsFromSelected(val);
      }
    });
    this.psatAssessmentSub = this.reportRollupService.psatAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this._psatAssessments = items;
          this.numPsats = this._psatAssessments.length;
          if (!this.focusedAssessment) {
            this.focusedAssessment = this._psatAssessments[0].assessment;
          }
        }
      }
    });
    this.phastAssessmentsSub = this.reportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this.reportRollupService.initPhastResultsArr(items);
          this._phastAssessments = items;
          this.numPhasts = this._phastAssessments.length;
          if (!this.focusedAssessment) {
            this.focusedAssessment = this._phastAssessments[0].assessment;
          }
        }
      }
    });

    this.fsatAssessmentsSub = this.reportRollupService.fsatAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this._fsatAssessments = items;
          this.numFsats = this._fsatAssessments.length;
          this.reportRollupService.initFsatResultsArr(items);
          if (!this.focusedAssessment) {
            this.focusedAssessment = this._fsatAssessments[0].assessment;
          }
        }
      }
    });

    this.ssmtAssessmentsSub = this.reportRollupService.ssmtAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this._ssmtAssessments = items;
          this.numSsmt = this._ssmtAssessments.length;
          this.reportRollupService.initSsmtResultsArr(items);
          if (!this.focusedAssessment) {
            this.focusedAssessment = this._ssmtAssessments[0].assessment;
          }
        }
      }
    });

    this.treasureHuntAssesmentsSub = this.reportRollupService.treasureHuntAssessments.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          this._treasureHuntAssessments = items;
          this.numTreasureHunt = this._treasureHuntAssessments.length;
          this.reportRollupService.initTreasureHuntResultsArray(this._treasureHuntAssessments);
          if (!this.focusedAssessment) {
            this.focusedAssessment = this._treasureHuntAssessments[0].assessment;
          }
        }
      }
    });

    //gets calculators for pre assessment rollup
    this.selectedCalcsSub = this.reportRollupService.selectedCalcs.subscribe(items => {
      if (items) {
        if (items.length !== 0) {
          items.forEach(item => {
            if (item.type === 'furnace') {
              this.selectedPhastCalcs.push(item);
            } else if (item.type === 'pump') {
              this.selectedPsatCalcs.push(item);
            } else if (item.type === 'fan') {
              this.selectedFsatCalcs.push(item);
            }
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.setSidebarHeight();
    // }, 500)
  }

  ngOnDestroy() {
    this.reportRollupService.initSummary();
    if (this.reportAssessmentsSub) this.reportAssessmentsSub.unsubscribe();
    if (this.phastAssessmentsSub) this.phastAssessmentsSub.unsubscribe();
    if (this.allPhastSub) this.allPhastSub.unsubscribe();
    if (this.selectedPhastSub) this.selectedPhastSub.unsubscribe();
    if (this.psatAssessmentSub) this.psatAssessmentSub.unsubscribe();
    if (this.selectedCalcsSub) this.selectedCalcsSub.unsubscribe();
    if (this.fsatAssessmentsSub) this.fsatAssessmentsSub.unsubscribe();
    if (this.ssmtAssessmentsSub) this.ssmtAssessmentsSub.unsubscribe();
    if (this.treasureHuntAssesmentsSub) this.treasureHuntAssesmentsSub.unsubscribe();
  }

  checkSettings() {
    if (!this.settings.phastRollupElectricityUnit) {
      this.settings.phastRollupElectricityUnit = 'kWh';
    }
    if (!this.settings.phastRollupFuelUnit) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.settings.phastRollupFuelUnit = 'GJ';
      } else {
        this.settings.phastRollupFuelUnit = 'MMBtu';
      }
    }
    if (!this.settings.phastRollupSteamUnit) {
      if (this.settings.unitsOfMeasure === 'Metric') {
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

  initPrintLogic() {
    this.showRollupReportOptions = true;
    // this.showPsatReportOptions = false;
    // this.showFsatReportOptions = false;
    // this.showPhastReportOptions = false;
    if (this.numPsats > 0) {
      this.showPsatReportOptions = true;
    }
    else {
      this.showPsatReportOptions = false;
    }
    if (this.numFsats > 0) {
      this.showFsatReportOptions = true;
    }
    else {
      this.showFsatReportOptions = false;
    }
    if (this.numPhasts > 0) {
      this.showPhastReportOptions = true;
    }
    if (this.numSsmt > 0) {
      this.showSsmtReportOptions = true;
    }
    else {
      this.showPhastReportOptions = false;
    }
    this.selectAll = false;
    this.printPsatRollup = false;
    this.printFsatRollup = false;
    this.printPhastRollup = false;
    // this.printSsmtRollup = false;
    this.printReportGraphs = false;
    this.printReportSankey = false;
    this.printResults = false;
    this.printInputData = false;
    this.printEnergyUsed = false;
    this.printExecutiveSummary = false;
    this.printEnergySummary = false;
    this.printLossesSummary = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "selectAll": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          this.printPsatRollup = true;
          this.printPhastRollup = true;
          this.printFsatRollup = true;
          // this.printSsmtRollup = true;
          this.printReportGraphs = true;
          this.printReportSankey = true;
          this.printResults = true;
          this.printInputData = true;
          this.printExecutiveSummary = true;
          this.printEnergyUsed = true;
          this.printEnergySummary = true;
          this.printLossesSummary = true;
        }
        else {
          this.printPsatRollup = false;
          this.printPhastRollup = false;
          this.printFsatRollup = false;
          // this.printSsmtRollup = false;
          this.printResults = false;
          this.printReportGraphs = false;
          this.printReportSankey = false;
          this.printInputData = false;
          this.printExecutiveSummary = false;
          this.printEnergyUsed = false;
          this.printEnergySummary = false;
          this.printLossesSummary = false;
        }
        break;
      }
      case "psatRollup": {
        this.printPsatRollup = !this.printPsatRollup;
        break;
      }
      case "phastRollup": {
        this.printPhastRollup = !this.printPhastRollup;
        break;
      }
      case "fsatRollup": {
        this.printFsatRollup = !this.printFsatRollup;
        break;
      }
      // case "ssmtRollup": {
      //   this.printSsmtRollup = !this.printSsmtRollup;
      //   break;
      // }
      case "reportGraphs": {
        this.printReportGraphs = !this.printReportGraphs;
        break;
      }
      case "reportSankey": {
        this.printReportSankey = !this.printReportSankey;
        break;
      }
      case "results": {
        this.printResults = !this.printResults;
        break;
      }
      case "inputData": {
        this.printInputData = !this.printInputData;
        break;
      }
      case "energyUsed": {
        this.printEnergyUsed = !this.printEnergyUsed;
        break;
      }
      case "executiveSummary": {
        this.printExecutiveSummary = !this.printExecutiveSummary;
        break;
      }
      case "energySummary": {
        this.printEnergySummary = !this.printEnergySummary;
        break;
      }
      case "lossesSummary": {
        this.printLossesSummary = !this.printLossesSummary;
        break;
      }
      default: {
        break;
      }
    }
  }

  setPrintViewThenPrint() {

    this.printView = true;
    let tmpPrintBuildTime = 100;
    if (this._ssmtAssessments.length > 0) {
      tmpPrintBuildTime += (500 * this._ssmtAssessments.length);
    }
    setTimeout(() => {
      this.print();
    }, tmpPrintBuildTime);
  }

  print() {
    this.closePrintMenu(false);
    // let win = this.windowRefService.nativeWindow;
    // let doc = this.windowRefService.getDoc();
    // win.print();
    //this.printView = true;
    // this.phastReportService.showPrint.next(true);


    //eventually add logic for modal or something to say "building print view"

    //set timeout for delay to print call. May want to do this differently later but for now should work
    //10000000 is excessive, put it at whatever you want
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      //after printing hide content again
      // this.phastReportService.showPrint.next(false);
      this.printView = false;
    }, 5000);
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }

  setFocused(assessment: Assessment) {
    this.focusedAssessment = assessment;
  }

  setSidebarHeight() {
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    this.bannerHeight = this.reportHeader.nativeElement.clientHeight;
    this.sidebarHeight = wndHeight - this.bannerHeight;
  }

  checkActiveAssessment($event) {
    let scrollAmount = $event.target.scrollTop;
    if (this.reportHeader && scrollAmount) {
      this._reportAssessments.forEach(item => {
        let doc = this.windowRefService.getDoc();
        let element = doc.getElementById('assessment_' + item.assessment.id);
        let diff = Math.abs(Math.abs(this.reportHeader.nativeElement.clientHeight - element.offsetTop) - scrollAmount);
        if (diff > 0 && diff < 50) {
          this.focusedAssessment = item.assessment;
        }
      });
    }
  }

  showPhastModal() {
    this.phastRollupModal.show();
  }

  hidePhastModal() {
    this.phastRollupModal.hide();
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

  showFsatModal() {
    this.fsatRollupModal.show();
  }

  hideFsatModal() {
    this.fsatRollupModal.hide();
  }

  showSsmtModal() {
    this.ssmtRollupModal.show();
  }

  hideSsmtModal() {
    this.ssmtRollupModal.hide();
  }

  showPrintModal(): void {
    this.showPrintMenu = true;
  }

  closePrintMenu(reset: boolean): void {
    if (reset) {
      this.initPrintLogic();
    }
    this.showPrintMenu = false;
  }

  collapseSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
