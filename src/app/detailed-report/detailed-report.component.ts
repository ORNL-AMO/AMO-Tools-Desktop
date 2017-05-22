import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';
import { WindowRefService } from '../indexedDb/window-ref.service';

@Component({
  selector: 'app-detailed-report',
  templateUrl: './detailed-report.component.html',
  styleUrls: ['./detailed-report.component.css']
})
export class DetailedReportComponent implements OnInit {
  @Input()
  assessments: Array<Assessment>;
  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();

  numAssessments: number;
  reportAssessments: Array<Assessment>;
  psats: Array<PSAT>;
  numPsats: number;
  pumpSavingsPotential: number;

  gatheringData: any;
  assessmentsGathered: boolean;
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    //used to hold assessments with outputs
    this.reportAssessments = new Array<Assessment>();
    this.psats = new Array<PSAT>();
    // let tmpArr = this.assessments.filter(assessment => { return assessment.psat != undefined });
    //   this.numPsats = tmpArr.length;
    //   //used to make sure all assessments proccessed (gotten outputs)
    //   this.assessments.forEach(assessment => {
    //     if (assessment.psat) {
    //       this.getAssessmentSettingsThenResults(assessment);
    //     }
    //   });
    //   this.assessmentsGathered = true;

  }

  ngOnChanges() {
    // console.log('change');
    if (this.gatheringData) {
      clearTimeout(this.gatheringData);
    }

    this.gatheringData = setTimeout(() => {
      let tmpArr = this.assessments.filter(assessment => { return assessment.psat != undefined });
      this.numPsats = tmpArr.length;
      //used to make sure all assessments proccessed (gotten outputs)
      this.assessments.forEach(assessment => {
        if (assessment.psat) {
          this.getAssessmentSettingsThenResults(assessment);
        }
      });
      this.assessmentsGathered = true;
      console.log('done');
    }, 1000)
  }

  getAssessmentSettingsThenResults(assessment: Assessment) {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(assessment.id).then(
      results => {
        if (results.length != 0) {
          assessment.psat = this.getResults(assessment.psat, results[0]);
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
    psat.outputs = this.psatService.results(psat.inputs, settings);
    if (psat.modifications) {
      psat.modifications.forEach(modification => {
        modification.psat.outputs = this.psatService.results(modification.psat.inputs, settings);
      })
    }
    return psat;
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }



  calcPsatSums() {
    this.pumpSavingsPotential = _.sumBy(this.psats, 'outputs.existing.annual_savings_potential')
  }

  selectAssessment(num: number) {
    //console.log(num);
    //debugger
    let doc = this.windowRefService.getDoc();
    let content = doc.getElementById(num);
    content.scrollIntoView();
  }
}
