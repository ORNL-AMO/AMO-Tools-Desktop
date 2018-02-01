import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../models/assessment';
import { PSAT } from '../models/psat';
import * as _ from 'lodash';
import { PsatService } from '../../psat/psat.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../models/settings';
import { ImportExportService } from './import-export.service';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {
  @Input()
  selectedItems: Array<any>;
  @Output('closeExportModal')
  closeExportModal = new EventEmitter<boolean>();
  @Input()
  import: boolean;
  @Input()
  export: boolean;
  @Output('importData')
  importData = new EventEmitter<any>();


  exportData: Array<any>;
  isDataGathered: boolean;
  gatheringData: any;
  fileReference: any;
  validFile: boolean;
  gatheringSettings: any;
  constructor(private indexedDbService: IndexedDbService, private importExportService: ImportExportService) { }

  ngOnInit() {
    if (this.export) {
      this.exportData = new Array();
    }
  }

  ngOnChanges() {
    if (this.export) {
      if (this.gatheringData) {
        clearTimeout(this.gatheringData);
      }
      this.gatheringData = setTimeout(() => {
        if (this.gatheringSettings) {
          clearTimeout(this.gatheringSettings);
        }
        //used to make sure all assessments proccessed (gotten outputs)
        this.selectedItems.forEach(item => {
          this.getAssessmentSettings(item);
        });
        this.gatheringSettings = setTimeout(() => {
          this.isDataGathered = true;
        }, 500)
      }, 500)
    }
  }



  getAssessmentSettings(item: any) {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(item.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.exportData.push({ assessment: item.assessment, settings: results[0], directory: item.directory });
        } else {
          //no assessment settings, find dir settings being usd
          this.getParentDirSettingsThenResults(item.assessment.directoryId, item);
        }
      }
    )
  }

  getParentDirSettingsThenResults(parentDirectoryId: number, item: any) {
    //get parent directory
    this.indexedDbService.getDirectory(parentDirectoryId).then(
      results => {
        let parentDirectory = results;
        //get parent directory settings
        this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
          results => {
            if (results.length != 0) {
              this.exportData.push({ assessment: item.assessment, settings: results[0], directory: item.directory });
            } else {
              //no settings try again with parents parent directory
              this.getParentDirSettingsThenResults(parentDirectory.parentDirectoryId, item)
            }
          })
      }
    )
  }

  buildExportJSON() {
    this.importExportService.downloadData(this.exportData);
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
