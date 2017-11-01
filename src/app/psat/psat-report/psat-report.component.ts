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
  inPsat: boolean;
  @Output('exportData')
  exportData = new EventEmitter<boolean>();
  @Input()
  inRollup: boolean;
  @Output('selectModification')
  selectModification = new EventEmitter<any>();
  assessmentDirectories: Directory[];
  isFirstChange: boolean = true;
  numMods: number = 0;
  currentTab: string = 'results';
  createdDate: Date;

  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.createdDate = new Date();
    if (this.assessment.psat && this.settings && !this.psat) {
      this.psat = this.assessment.psat;
    }
    else if (this.assessment.psat && !this.settings) {
      this.psat = this.assessment.psat;
      //find settings
      this.getSettings();
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    if (this.psat.modifications) {
      this.numMods = this.psat.modifications.length;
    }else{
      this.psat.modifications = new Array();
    }
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getSettings() {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
        }
      }
    )
  }

  closeAssessment() {
    this.closeReport.emit(true);
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

  exportToCsv() {
    this.exportData.emit(true);
  }

  useModification(event: any) {
    this.selectModification.emit(event);
  }

}
