import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  containerHeight: number;

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
        console.log(this.assessment);
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
  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.content) {
      let contentHeight = this.content.nativeElement.clientHeight;
      let headerHeight = this.header.nativeElement.clientHeight;
      let footerHeight = 0;
      if (this.footer) {
        footerHeight = this.footer.nativeElement.clientHeight;
      }
      this.containerHeight = contentHeight - headerHeight - footerHeight;
    }
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
