import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from '../dashboard/assessment.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHunt } from '../shared/models/treasure-hunt';
import { CalculatorsService } from './calculators/calculators.service';
import { TreasureChestMenuService } from './treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from './treasure-chest/opportunity-cards/sort-cards-by.pipe';
import { SettingsService } from '../settings/settings.service';
import { ConvertInputDataService } from './convert-input-data.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { EGridService } from '../shared/helper-services/e-grid.service';

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
  oldSettings: Settings;
  showUpdateUnitsModal: boolean;

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
  selectedCalcSub: Subscription;
  selectedCalc: string;
  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private treasureHuntService: TreasureHuntService,
    private cd: ChangeDetectorRef,
    private convertInputDataService: ConvertInputDataService,
    private calculatorsService: CalculatorsService,
    private treasureChestMenuService: TreasureChestMenuService,
    private settingsService: SettingsService,
    private convertUnitsService: ConvertUnitsService,
    private egridService: EGridService
  ) { }

  ngOnInit() {
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']))
      if (this.assessment && this.assessment.type !== 'TreasureHunt') {
        this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' }});
      } else { 
        if (!this.assessment.treasureHunt) {
          this.assessment.treasureHunt = {
            name: 'Treasure Hunt',
            setupDone: false,
            operatingHours: {
              weeksPerYear: 52.14,
              daysPerWeek: 7,
              hoursPerDay: 24,
              minutesPerHour: 60,
              secondsPerMinute: 60,
              hoursPerYear: 8760
            }
          }
        }
        if (!this.assessment.treasureHunt.operatingHours) {
          this.assessment.treasureHunt.operatingHours = {
            weeksPerYear: 52.14,
            daysPerWeek: 7,
            hoursPerDay: 24,
            minutesPerHour: 60,
            secondsPerMinute: 60,
            hoursPerYear: 8760
          }
        }
        this.getSettings();
        let tmpTab = this.assessmentService.getTab();
        if (tmpTab) {
          this.treasureHuntService.mainTab.next(tmpTab);
        }
        this.treasureHuntService.treasureHunt.next(this.assessment.treasureHunt);
      }
    });

    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkTutorials();
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
    });
    this.selectedCalcSub = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
      this.getContainerHeight();
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
    this.selectedCalcSub.unsubscribe();
    let defaultData: SortCardsData = this.treasureChestMenuService.getDefaultSortByData();
    this.treasureChestMenuService.sortBy.next(defaultData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.disclaimerToast();
      this.getContainerHeight();
    }, 100);
  }


  getSettings() {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (!this.settings) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
      this.addSettings(settings);
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
    if (this.subTab == 'operation-costs') {
      this.treasureHuntService.subTab.next('settings');
    }
  }

  continue() {
    if (this.subTab == 'settings') {
      this.treasureHuntService.subTab.next('operation-costs');
    } else if (this.subTab == 'operation-costs') {
      this.treasureHuntService.mainTab.next('find-treasure');
    }
  }

  disclaimerToast() {
    if (this.settingsDbService.globalSettings.disableDisclaimer != true) {
      this.toastData.title = 'Disclaimer';
      this.toastData.body = 'Please keep in mind that this application is still in beta. Let us know if you have any suggestions for improving our app.';
      this.showToast = true;
      this.cd.detectChanges();
    }
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

  disableDisclaimer() {
    this.settingsDbService.globalSettings.disableDisclaimer = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
    this.hideToast();
  }

  checkTutorials() {
    if (this.mainTab == 'system-setup') {
      if (!this.settingsDbService.globalSettings.disableTreasureHuntSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('treasure-hunt-setup-tutorial');
      }
    } else if (this.mainTab == 'find-treasure') {
      if (!this.settingsDbService.globalSettings.disableTreasureHuntFindTreasureTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('treasure-hunt-find-treasure-tutorial');
      }
    } else if (this.mainTab == 'treasure-chest') {
      if (!this.settingsDbService.globalSettings.disableTreasureHuntTreasureChestTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('treasure-hunt-treasure-chest-tutorial');
      }
    } else if (this.mainTab == 'report') {
      if (!this.settingsDbService.globalSettings.disableTreasureHuntReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('treasure-hunt-report-tutorial');
      }
    }
  }

  addSettings(settings: Settings) {
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(settings);
    newSettings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(newSettings).then(id => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      });
    });
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.treasureHuntService.mainTab.next('system-setup');
      this.treasureHuntService.subTab.next('settings');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if(shouldUpdateData == true) {
      this.updateData();
    } else {
      this.saveTreasureHunt(this.assessment.treasureHunt);
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    this.assessment.treasureHunt = this.convertInputDataService.convertTreasureHuntInputData(this.assessment.treasureHunt, this.oldSettings, this.settings);
    let settings = this.convertUnitsService.convertSettingsUnitCosts(this.oldSettings, this.settings);
    this.addSettings(settings);
    this.assessment.treasureHunt.existingDataUnits = this.settings.unitsOfMeasure;
    this.saveTreasureHunt(this.assessment.treasureHunt);
    this.getSettings();
  }
}
