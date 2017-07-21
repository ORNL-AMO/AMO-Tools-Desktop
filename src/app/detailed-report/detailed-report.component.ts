import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-detailed-report',
  templateUrl: './detailed-report.component.html',
  styleUrls: ['./detailed-report.component.css']
})
export class DetailedReportComponent implements OnInit {
  @Input()
  selectedItems: Array<any>;
  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();

  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    this.checkVisibleSummary();
    this.checkActiveAssessment();
  }

  @ViewChild('printModal') public printModal: ModalDirective;

  assessments: Array<Assessment>;

  numAssessments: number;
  reportAssessments: Array<Assessment>;
  psats: Array<PSAT>;
  numPsats: number;
  pumpSavingsPotential: number;
  energySavingsPotential: number;
  gatheringData: any;
  gatheringData2: any;
  assessmentsGathered: boolean;
  exportReports: any;
  isSummaryVisible: boolean = true;
  focusedAssessment: Assessment;
  createdDate: any;
  reportNotes: string;
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private windowRefService: WindowRefService, private jsonToCsvService: JsonToCsvService) { }

  ngOnInit() {
    //used to hold assessments with outputs
    this.reportAssessments = new Array<Assessment>();
    this.psats = new Array<PSAT>();
    this.exportReports = new Array();
    this.createdDate = moment().format('MMMM Do, YYYY');
  }

  ngOnChanges() {
    this.assessments = new Array();
    if (this.gatheringData) {
      clearTimeout(this.gatheringData);
    }

    this.gatheringData = setTimeout(() => {
      this.selectedItems.forEach(item => {
        this.assessments.push(item.assessment);
      })
      let tmpArr = this.assessments.filter(assessment => { return assessment.psat != undefined });
      this.numPsats = tmpArr.length;
      //used to make sure all assessments proccessed (gotten outputs)
      this.assessments.forEach(assessment => {
        if (assessment.psat) {
          this.getAssessmentSettingsThenResults(assessment);
        }
      });
      this.gatheringData2 = setTimeout(() => {
        this.focusedAssessment = this.reportAssessments[0];
        this.assessmentsGathered = true;
      }, 1000);
    }, 500)
  }

  showPrintModal() {
    this.printModal.show();
  }

  hidePrintModal() {
    this.printModal.hide();
  }


  getAssessmentSettingsThenResults(assessment: Assessment) {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(assessment.id).then(
      results => {
        if (results.length != 0) {
          assessment.psat = this.getResults(assessment.psat, results[0]);
          this.exportReports.push({ assessment: assessment, settings: results[0] });
          this.reportAssessments.push(assessment);
          this.psats.push(assessment.psat);
          if (this.psats.length == this.numPsats) {
            this.calcPsatSums();
          }
        } else {
          //no assessment settings, find dir settings being usd
          this.getParentDirSettingsThenResults(assessment.directoryId, assessment);
        }
      }
    )
  }

  getParentDirSettingsThenResults(parentDirectoryId: number, assessment: Assessment) {
    //get parent directory
    this.indexedDbService.getDirectory(parentDirectoryId).then(
      results => {
        let parentDirectory = results;
        //get parent directory settings
        this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
          results => {
            if (results.length != 0) {
              assessment.psat = this.getResults(assessment.psat, results[0]);
              this.exportReports.push({ assessment: assessment, settings: results[0] });
              this.reportAssessments.push(assessment);
              this.psats.push(assessment.psat);
              if (this.psats.length == this.numPsats) {
                this.calcPsatSums();
              }
            } else {
              //no settings try again with parents parent directory
              this.getParentDirSettingsThenResults(parentDirectory.parentDirectoryId, assessment)
            }
          })
      }
    )
  }

  getResults(psat: PSAT, settings: Settings) {
    if (psat.inputs.optimize_calculation) {
      psat.outputs = this.psatService.resultsOptimal(psat.inputs, settings);
    } else {
      psat.outputs = this.psatService.resultsExisting(psat.inputs, settings);
    }
    if (psat.modifications) {
      psat.modifications.forEach(modification => {
        if (modification.psat.inputs.optimize_calculation) {
          modification.psat.outputs = this.psatService.resultsOptimal(modification.psat.inputs, settings);
        } else {
          modification.psat.outputs = this.psatService.resultsExisting(modification.psat.inputs, settings);
        }
      })
    }
    return psat;
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }

  calcPsatSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    this.psats.forEach(psat => {
      if (psat.modifications) {
        let minCost = _.minBy(psat.modifications, (mod) => { return mod.psat.outputs.annual_cost })
        let diffCost = psat.outputs.annual_cost - minCost.psat.outputs.annual_cost;
        sumSavings += diffCost;

        let minEnergy = _.minBy(psat.modifications, (mod) => { return mod.psat.outputs.annual_energy })
        let diffEnergy = psat.outputs.annual_energy - minEnergy.psat.outputs.annual_energy;
        sumEnergy += diffEnergy;
      }
    })
    this.pumpSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergy;
  }

  selectAssessment(assessment: Assessment) {
    let doc = this.windowRefService.getDoc();
    let content = doc.getElementById(assessment.id);
    this.focusedAssessment = assessment;
    content.scrollIntoView();
  }

  exportToCsv() {
    let tmpDataArr = new Array();
    this.exportReports.forEach(report => {
      let tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, report.assessment.psat);
      tmpDataArr.push(tmpData);
      if (report.assessment.psat.modifications) {
        report.assessment.psat.modifications.forEach(mod => {
          tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, mod.psat);
          tmpDataArr.push(tmpData);
        })
      }
    })
    this.jsonToCsvService.downloadData(tmpDataArr, 'psatRollup');
  }

  print() {
    this.hidePrintModal();
    this.printModal.onHidden.subscribe(() => {
      let win = this.windowRefService.nativeWindow;
      let doc = this.windowRefService.getDoc();
      win.print();
    });
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
    let firstAssessment = doc.getElementById(this.reportAssessments[0].id);
    if (scrollAmount < (firstAssessment.clientHeight - 200)) {
      this.focusedAssessment = this.reportAssessments[0];
    } else {
      let check = this.checkDistance(this.reportAssessments, scrollAmount);
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
          let assessmentDiv = doc.getElementById(assessment.id);
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
