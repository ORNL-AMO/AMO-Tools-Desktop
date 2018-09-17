import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Subscription } from 'rxjs';
import { SsmtService } from './ssmt.service';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SettingsService } from '../settings/settings.service';
import { Directory } from '../shared/models/directory';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SSMT } from '../shared/models/ssmt';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';

@Component({
  selector: 'app-ssmt',
  templateUrl: './ssmt.component.html',
  styleUrls: ['./ssmt.component.css']
})
export class SsmtComponent implements OnInit {
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  containerHeight: number;
  assessment: Assessment;
  _ssmt: SSMT;
  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  modelTabSubscription: Subscription;
  modelTab: string;
  isAssessmentSettings: boolean;
  settings: Settings;
  constructor(
    private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private ssmtService: SsmtService,
    private settingsDbService: SettingsDbService,
    private settingsService: SettingsService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._ssmt = (JSON.parse(JSON.stringify(this.assessment.ssmt)));
        this.getSettings();
      });
    });
    this.subscribeTabs();
  }
  
  ngAfterViewInit(){
    setTimeout(() => {
      this.getContainerHeight();  
    },100)
  }

  ngOnDestory() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
  }

  subscribeTabs() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    })
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.getContainerHeight();
    })
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
      this.getContainerHeight();
    })
  }
  
  saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(this.settings).then(() => {
        this.settingsDbService.setAll().then(() => {
        });
      })
    }
  }

  getSettings() {
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

  save(){
    this.assessment.ssmt = (JSON.parse(JSON.stringify(this._ssmt)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        console.log('saved');
        // this.fsatService.updateData.next(true);
      })
    })
  }

  back() {

  }

  goToReport() {

  }

  continue() {

  }

  getCanContinue() {
    return false;
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
}
