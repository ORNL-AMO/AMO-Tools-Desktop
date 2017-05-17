import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';
import * as _ from 'lodash';
import { PsatService } from '../psat/psat.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';

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
  constructor(private indexedDbService: IndexedDbService, private psatService: PsatService) { }

  ngOnInit() {
    //used to hold assessments with outputs
    this.reportAssessments = new Array<Assessment>();
    let tmpPsatArray = this.assessments.filter(assessment => { return assessment.psat != undefined })
    let tmpArray = tmpPsatArray.filter(assessment => { return assessment.psat.setupDone == true });
    //used to make sure all assessments proccessed (gotten outputs)
    this.numAssessments = tmpArray.length;
    this.assessments.forEach(assessment => {
      if (assessment.psat) {
        this.getAssessmentSettingsThenResults(assessment);
      }
    })
  }

  getAssessmentSettingsThenResults(assessment: Assessment) {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(assessment.id).then(
      results => {
        if (results.length != 0) {
          assessment.psat = this.getResults(assessment.psat, results[0]);
          this.reportAssessments.push(assessment);
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

}
