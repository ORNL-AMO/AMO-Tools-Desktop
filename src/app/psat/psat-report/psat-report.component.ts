import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('closeReport')
  closeReport = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (this.psat && this.settings) {
      this.getResults(this.psat, this.settings);
    }
    else if (this.assessment.psat && this.settings) {
      this.psat = this.assessment.psat;
      this.getResults(this.psat, this.settings);
    }
    else if (this.assessment.psat && !this.settings) {
      this.psat = this.assessment.psat;
      //find settings
      this.getAssessmentSettingsThenResults();
      console.log('get settings');
    }
  }

  getAssessmentSettingsThenResults() {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          if (!this.psat.outputs) {
            this.psat = this.getResults(this.psat, this.settings);
          }
        } else {
          //no assessment settings, find dir settings being usd
          this.getParentDirSettingsThenResults(this.assessment.directoryId);
        }
      }
    )
  }

  getParentDirSettingsThenResults(parentDirectoryId: number) {
    //get parent directory
    this.indexedDbService.getDirectory(parentDirectoryId).then(
      results => {
        let parentDirectory = results;
        //get parent directory settings
        this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
          resultSettings => {
            if (resultSettings.length != 0) {
              this.settings = resultSettings[0];
              if (!this.psat.outputs) {
                this.psat = this.getResults(this.psat, this.settings);
              }
            } else {
              //no settings try again with parents parent directory
              this.getParentDirSettingsThenResults(parentDirectory.parentDirectoryId)
            }
          })
      }
    )
  }

  closeAssessment() {
    this.closeReport.emit(true);
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

}
