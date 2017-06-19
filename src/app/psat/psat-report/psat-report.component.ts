import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Directory } from '../../shared/models/directory';
import { WindowRefService } from '../../indexedDb/window-ref.service';

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
  @Input()
  emitPrint: boolean;
  @Input()
  inPsat: boolean;

  assessmentDirectories: Directory[];
  isFirstChange: boolean = true;

  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private windowRefService: WindowRefService) { }

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
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if(changes.emitPrint){
        console.log('clicked');
      }
    } else {
      this.isFirstChange = false;
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

  getDirectoryList(id: number) {
    if (id && id != 1) {
      this.indexedDbService.getDirectory(id).then(
        results => {
          this.assessmentDirectories.push(results);
          if (results.parentDirectoryId != 1) {
            this.getDirectoryList(results.parentDirectoryId);
          }
        }
      )
    }
  }

  print() {
    let win = this.windowRefService.nativeWindow;
    let doc = this.windowRefService.getDoc();
    win.print();
  }

}
