import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { SettingsService } from '../settings/settings.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Directory } from '../shared/models/directory';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {

  @ViewChild('fsat203Modal') public fsat203Modal: ModalDirective;



  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  containerHeight: number;

  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  settings: Settings;
  isAssessmentSettings: boolean;
  constructor(private activatedRoute: ActivatedRoute, 
    private indexedDbService: IndexedDbService, 
    private fsatService: FsatService, 
    private settingsService: SettingsService,    
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService) {}

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
      console.log(this.stepTab);
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  saveSettings() {
    //TODO:implement saving settings
  }


  getSettings(update?: boolean) {
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
      this.isAssessmentSettings = true;
    } else {
      //if no settings found for assessment, check directory settings
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
  }

  getParentDirectorySettings(parentId: number) {
    let dirSettings: Settings = this.settingsDbService.getByDirectoryId(parentId);
    if (dirSettings) {
      let settingsForm = this.settingsService.getFormFromSettings(dirSettings);
      let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
      tmpSettings.createdDate = new Date();
      tmpSettings.modifiedDate = new Date();
      tmpSettings.assessmentId = this.assessment.id;
      //create settings for assessment
      this.indexedDbService.addSettings(tmpSettings).then(
        results => {
          this.settingsDbService.setAll().then(() => {
           // this.addToast('Settings Saved');
            this.getSettings();
          })
        })
    }
    else {
      //if no settings for directory check parent directory
      let tmpDir: Directory = this.directoryDbService.getById(parentId);
      this.getParentDirectorySettings(tmpDir.parentDirectoryId);
    }
  }
  
  show203Modal() {
    this.fsat203Modal.show();
  }

  hide203Modal() {
    this.fsat203Modal.hide();
  }

}
