import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ReportRollupService } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
@Component({
  selector: 'app-report-rollup',
  templateUrl: './report-rollup.component.html',
  styleUrls: ['./report-rollup.component.css']
})
export class ReportRollupComponent implements OnInit {

  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();
  
  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    this.checkVisibleSummary();
    this.checkActiveAssessment();
  }
  @ViewChild('reportTemplate') reportTemplate: TemplateRef<any>;

  _reportAssessments: Array<Assessment>;
  focusedAssessment: Assessment;

  assessmentsGathered: boolean = false;
  isSummaryVisible: boolean = true;
  constructor(private reportRollupService: ReportRollupService,
    private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.reportRollupService.reportAssessments.subscribe(assesments => {
      this._reportAssessments = assesments;
      this.focusedAssessment = this._reportAssessments[0];
    })
    setTimeout(() => {
      this.assessmentsGathered = true;
    }, 2000)
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

    checkVisibleSummary() {
    let doc = this.windowRefService.getDoc();
    let summaryDiv = doc.getElementById("reportSummary");
    let window = this.windowRefService.nativeWindow;
    let y = summaryDiv.offsetTop;
    let height = summaryDiv.offsetHeight;
    let maxHeight = y + height;
    this.isSummaryVisible = (y < (window.pageYOffset + window.innerHeight)) && (maxHeight >= window.pageYOffset);
  }

  checkActiveAssessment() {
    let doc = this.windowRefService.getDoc();
    let window = this.windowRefService.nativeWindow;
    let container = doc.getElementById('reportContainer');
    let scrollAmount = (window.pageYOffset !== undefined) ? window.pageYOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollTop;
    let activeSet: boolean = false;
    let isFirstElement: boolean = true;
    let firstAssessment = doc.getElementById('assessment_'+this._reportAssessments[0].id);
    if (scrollAmount < (firstAssessment.clientHeight - 200)) {
      this.focusedAssessment = this._reportAssessments[0];
    } else {
      let check = this.checkDistance(this._reportAssessments, scrollAmount);
      if (check) {
        this.focusedAssessment = check;
      }
    }
  }

  checkDistance(assessments: Assessment[], scrollAmount: number) {
    let doc = this.windowRefService.getDoc();
    let window = this.windowRefService.nativeWindow;
    let activeSet: boolean = false;
    let isFirstElement: boolean = true;
    let closestAssessment;
    assessments.forEach(assessment => {
      if (!isFirstElement) {
        if (!activeSet) {
          let assessmentDiv = doc.getElementById('assessment_'+assessment.id);
          if (assessmentDiv) {
            let distanceScrolled = Math.abs(scrollAmount - assessmentDiv.offsetTop);
            let fromBottom = Math.abs(scrollAmount - (assessmentDiv.offsetTop + assessmentDiv.clientHeight));
            if (distanceScrolled > 0 && distanceScrolled < 200 || fromBottom > 0 && fromBottom < 200) {
              closestAssessment = assessment;
            }
          }
        }
      } else {
        isFirstElement = false;
      }
    })
    return closestAssessment;
  }

}
