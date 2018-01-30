import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {

  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  settings: Settings;

  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService, private fsatService: FsatService, private settingsService: SettingsService) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this.getSettings();
      })
    })
    this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }


  getSettings(update?: boolean) {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          // if (update) {
          //   this.addToast('Settings Saved');
          //   if (this.saveContinue) {
          //     this.continue(this.saveContinue)
          //   }
          // }
        } else {
          //if no settings found for assessment, check directory settings
          this.getParentDirectorySettings(this.assessment.directoryId);
        }
      }
    )
  }

  getParentDirectorySettings(parentId: number) {
    this.indexedDbService.getDirectorySettings(parentId).then(
      results => {
        if (results.length != 0) {
          let settingsForm = this.settingsService.getFormFromSettings(results[0]);
          let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
          tmpSettings.createdDate = new Date();
          tmpSettings.modifiedDate = new Date();
          tmpSettings.assessmentId = this.assessment.id;
          //create settings for assessment
          this.indexedDbService.addSettings(tmpSettings).then(
            results => {
              //this.addToast('Settings Saved');
              this.getSettings();
            })
        }
        else {
          //if no settings for directory check parent directory
          this.indexedDbService.getDirectory(parentId).then(
            results => {
              this.getParentDirectorySettings(results.parentDirectoryId);
            }
          )
        }
      })
  }
}
