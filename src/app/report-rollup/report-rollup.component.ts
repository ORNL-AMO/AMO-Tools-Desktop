import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ReportRollupService, PhastResultsData, ReportItem } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Settings } from '../shared/models/settings';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AssessmentService } from '../assessment/assessment.service';
import { setTimeout } from 'timers';
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
  focusedAssessment: Assessment;

  assessmentsGathered: boolean = false;
  isSummaryVisible: boolean = true;
  createdDate: Date;
  settings: Settings;
  @ViewChild('psatRollupModal') public psatRollupModal: ModalDirective;
  @ViewChild('unitModal') public unitModal: ModalDirective;
  @ViewChild('rollupModal') public rollupModal: ModalDirective;

  numPhasts: number = 0;
  sidebarHeight: number = 0;
  constructor(private reportRollupService: ReportRollupService,
    private windowRefService: WindowRefService, private indexedDbService: IndexedDbService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    setTimeout(() => {
      this.assessmentsGathered = true;
    }, 2000);

    setTimeout(() => {
      this.setSidebarHeight();
    }, 2500);

    this.indexedDbService.getDirectorySettings(1).then(results => {
      this.settings = this.reportRollupService.checkSettings(results[0]);;
    })
    this.createdDate = new Date();
    this.reportRollupService.reportAssessments.subscribe(items => {
      if (items) {
        if (items.length != 0) {
          this._reportAssessments = items;
          this.focusedAssessment = this._reportAssessments[0].assessment;
        }
      }
    })
    this.assessmentService.showFeedback.next(false);
    let count = 1;
    this.reportRollupService.phastAssessments.subscribe(val => {
        this.numPhasts = val.length;
        if (val.length != 0) {
          this.reportRollupService.initPhastResultsArr(val);
          count++;
        }
    })
    this.reportRollupService.allPhastResults.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initPhastCompare(val);
      }
    })
    this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.getPhastResultsFromSelected(val);
      }
    })
  }

  // ngAfterViewInit(){
  //   this.setSidebarHeight();
  // }

  ngOnDestroy() {
    this.assessmentService.showFeedback.next(true);
    this.reportRollupService.initSummary();
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

  print() {
    let win = this.windowRefService.nativeWindow;
    let doc = this.windowRefService.getDoc();
    win.print();
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }

  setSidebarHeight(){
    let doc = this.windowRefService.getDoc();
    let window = this.windowRefService.nativeWindow;
    let wndHeight = window.innerHeight;
    let header = doc.getElementById('reportHeader');
    let headerHeight = header.clientHeight;
    let sidebar = doc.getElementById('sidebar');
    this.sidebarHeight = wndHeight - headerHeight;
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
