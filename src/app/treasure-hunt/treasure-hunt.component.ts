import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from '../assessment/assessment.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../settings/settings.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Directory } from '../shared/models/directory';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHunt } from '../shared/models/treasure-hunt';

@Component({
  selector: 'app-treasure-hunt',
  templateUrl: './treasure-hunt.component.html',
  styleUrls: ['./treasure-hunt.component.css']
})
export class TreasureHuntComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;
  settings: Settings;

  mainTabSub: Subscription;
  mainTab: string;
  subTab: string;
  subTabSub: Subscription;
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  modalOpenSub: Subscription;
  isModalOpen: boolean = false;
  treasureHuntSub: Subscription;
  nextDisabled: boolean;
  constructor(
    private assessmentService: AssessmentService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private settingsService: SettingsService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private treasureHuntService: TreasureHuntService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        if (!this.assessment.treasureHunt) {
          this.assessment.treasureHunt = {
            name: 'Treasure Hunt',
            setupDone: false,
            operatingHours: {
              weeksPerYear: 52,
              daysPerWeek: 7,
              hoursPerYear: 8736
            }
          }
        }
        if (!this.assessment.treasureHunt.operatingHours) {
          this.assessment.treasureHunt.operatingHours = {
            weeksPerYear: 52,
            daysPerWeek: 7,
            hoursPerYear: 8736
          }
        }

        this.getSettings();
        let tmpTab = this.assessmentService.getTab();
        if (tmpTab) {
          this.treasureHuntService.mainTab.next(tmpTab);
        }

        this.treasureHuntService.treasureHunt.next(this.assessment.treasureHunt);
      })
    })

    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
      this.getCanContinue();
    });

    this.subTabSub = this.treasureHuntService.subTab.subscribe(val => {
      this.subTab = val;
      this.getCanContinue();
    });
    this.modalOpenSub = this.treasureHuntService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      if (val) {
        this.saveTreasureHunt(val);
      }
      this.getCanContinue();
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.subTabSub.unsubscribe();
    this.treasureHuntService.mainTab.next('system-setup');
    this.treasureHuntService.subTab.next('settings');
    this.modalOpenSub.unsubscribe();
    this.treasureHuntService.treasureHunt.next(undefined);
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.disclaimerToast();
      this.getContainerHeight();
    }, 100);
  }


  getSettings() {
    //get assessment settings
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
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

  saveTreasureHunt(treasureHunt: TreasureHunt) {
    this.assessment.treasureHunt = treasureHunt;
    this.assessment.treasureHunt.setupDone = this.checkSetupDone();
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.treasureHuntService.getResults.next(true);
      })
    })
  }

  checkSetupDone() {
    if (this.assessment.treasureHunt.operatingHours && this.assessment.treasureHunt.currentEnergyUsage) {
      return true;
    } else {
      return false;
    }
  }

  getCanContinue() {
    if (this.subTab == 'settings') {
      this.nextDisabled = false;
    } else if (this.subTab == 'operation-costs') {
      if (this.assessment.treasureHunt.setupDone) {
        this.nextDisabled = false;
      } else {
        this.nextDisabled = true;
      }
    }
  }

  back() {
    if (this.mainTab == 'system-setup') {
      if (this.subTab == 'operation-costs') {
        this.treasureHuntService.subTab.next('settings');
      }
    } else if (this.mainTab == 'find-treasure') {
      this.treasureHuntService.mainTab.next('system-setup');
    }
  }

  continue() {
    if (this.mainTab == 'system-setup') {
      if (this.subTab == 'settings') {
        this.treasureHuntService.subTab.next('operation-costs');
      } else if (this.subTab == 'operation-costs') {
        this.treasureHuntService.mainTab.next('find-treasure');
      }
    } else if (this.mainTab == 'find-treasure') {
      this.treasureHuntService.mainTab.next('treasure-chest');
    }
  }

  disclaimerToast() {
    this.toastData.title = 'Disclaimer';
    this.toastData.body = 'Please keep in mind that this application is still in beta. Let us know if you have any suggestions for improving our app.';
    this.showToast = true;
    this.cd.detectChanges();
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    };
    this.cd.detectChanges();
  }
}
