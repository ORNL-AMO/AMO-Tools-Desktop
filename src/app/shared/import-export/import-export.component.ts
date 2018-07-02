import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../models/assessment';
import { PSAT } from '../models/psat';
import * as _ from 'lodash';
import { PsatService } from '../../psat/psat.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../models/settings';
import { ImportExportService } from './import-export.service';
import { ImportDataObjects } from '../../dashboard/dashboard.component';
import { ImportExportData, ImportExportAssessment } from './importExportModel';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {
  @Input()
  exportData: ImportExportData;
  @Output('closeExportModal')
  closeExportModal = new EventEmitter<boolean>();
  @Input()
  import: boolean;
  @Input()
  export: boolean;
  @Output('importData')
  importData = new EventEmitter<any>();

  // exportData: Array<ImportDataObjects>;
  isDataGathered: boolean;
  gatheringData: any;
  fileReference: any;
  validFile: boolean;
  gatheringSettings: any;
  noDirAssessmentItems: Array<ImportExportAssessment>;
  showCalcs: boolean = false;
  showDirs: boolean = false;
  canExport: boolean = false;
  name: string = null;
  constructor(private indexedDbService: IndexedDbService, private importExportService: ImportExportService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.noDirAssessmentItems = new Array();
    if (this.export) {
      this.noDirAssessmentItems = JSON.parse(JSON.stringify(this.exportData.assessments));
      if (this.exportData.calculators) {
        if (this.exportData.calculators.length != 0) {
          if (this.exportData.calculators[0].preAssessments) {
            this.showCalcs = true;
          }
        }
      }
      if(this.exportData.directories){
        if(this.exportData.directories.length != 0){
          this.showDirs = true;
        }
      }
      this.test();
    }
  }

  test(){
    this.canExport = this.importExportService.test(this.exportData);
  }

  getDirAssessments(id: number) {
    if (this.noDirAssessmentItems) {
      _.remove(this.noDirAssessmentItems, (assessment) => { return assessment.assessment.directoryId == id });
      // this.cd.detectChanges();
    }
    let assessments = _.filter(this.exportData.assessments, (assessmentItem) => { return assessmentItem.assessment.directoryId == id });
    return assessments;
  }

  buildExportJSON() {
    this.importExportService.downloadData(this.exportData, this.name);
    this.closeExportModal.emit(true);
  }

  cancel() {
    this.closeExportModal.emit(true);
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length != 0) {
        let regex = /.json$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event;
          this.validFile = true;
        } else {
          this.validFile = false;
        }
      }
    }
  }

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference.target.files[0]);
    fr.onloadend = (e) => {
      let importJson = JSON.parse(fr.result);
      this.importData.emit(importJson);
    }
  }
}
