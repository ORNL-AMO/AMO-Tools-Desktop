import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { AssessmentService } from '../dashboard/assessment.service';
 
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { EMPTY, filter, firstValueFrom, from, Subscription, switchMap } from 'rxjs';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHunt } from '../shared/models/treasure-hunt';
import { CalculatorsService } from './calculators/calculators.service';
import { TreasureChestMenuService } from './treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from './treasure-chest/opportunity-cards/sort-cards-by.pipe';
import { ConvertInputDataService } from './convert-input-data.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';

@Component({
    selector: 'app-treasure-hunt',
    templateUrl: './treasure-hunt.component.html',
    styleUrls: ['./treasure-hunt.component.css'],
    standalone: false
})
export class TreasureHuntComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
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
  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  settingsSub: Subscription;
  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private treasureHuntService: TreasureHuntService,
    private cd: ChangeDetectorRef,
    private convertInputDataService: ConvertInputDataService,
    private calculatorsService: CalculatorsService,
    private treasureChestMenuService: TreasureChestMenuService,
    private convertUnitsService: ConvertUnitsService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-treasure-hunt-assessment');

    this.settingsSub = this.treasureHuntService.settings$.pipe(
      filter(settings => Boolean(settings))
    ).subscribe(settings => {
        this.settings = settings;
    });

    this.activatedRoute.params.pipe(
      switchMap(params => {
        this.assessment = this.assessmentDbService.findById(parseInt(params['id']));
        if (this.assessment && this.assessment.type !== 'TreasureHunt') {
          this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
          return EMPTY;
        }
        return from(this.treasureHuntService.initializeSettings(this.assessment));
      })
    ).subscribe(() => {
      let startingTab = this.assessmentService.getStartingTab();
      if (startingTab) {
        this.treasureHuntService.mainTab.next(startingTab);
      }

      if (this.assessment && !this.assessment.treasureHunt && this.settings) {
        this.assessment.treasureHunt = this.assessmentService.getDefaultTreasureHunt(this.settings);
      }
      if (this.assessment && !this.assessment.treasureHunt.currentEnergyUsage) {
        this.assessment.treasureHunt.currentEnergyUsage = this.assessmentService.getDefaultTreasureHunt(this.settings).currentEnergyUsage;
      }
      this.treasureHuntService.treasureHunt.next(this.assessment.treasureHunt);
    });

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
    });
    this.selectedCalcSub = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
      this.getContainerHeight();
    });

    this.showExportModalSub = this.treasureHuntService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.subTabSub.unsubscribe();
    this.treasureHuntService.mainTab.next('baseline');
    this.treasureHuntService.subTab.next('settings');
    this.modalOpenSub.unsubscribe();
    this.treasureHuntService.treasureHunt.next(undefined);
    this.treasureHuntSub.unsubscribe();
    this.selectedCalcSub.unsubscribe();
    let defaultData: SortCardsData = this.treasureChestMenuService.getDefaultSortByData();
    this.treasureChestMenuService.sortBy.next(defaultData); 
    this.showExportModalSub.unsubscribe();
    this.settingsSub.unsubscribe();
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
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }, 100);
    }
  }

  async saveTreasureHunt(treasureHunt: TreasureHunt) {
    this.assessment.treasureHunt = treasureHunt;
    this.assessment.treasureHunt.setupDone = this.checkSetupDone();

    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
    this.treasureHuntService.getResults.next(true);
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

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.treasureHuntService.mainTab.next('baseline');
      this.treasureHuntService.subTab.next('settings');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateUnitData: boolean) {
    if(shouldUpdateUnitData == true) {
      this.convertValuesFromSettingsChange();
    } else {
      this.saveTreasureHunt(this.assessment.treasureHunt);
    }
    this.closeUpdateUnitsModal(shouldUpdateUnitData);
  }

  async convertValuesFromSettingsChange() {
    this.assessment.treasureHunt = this.convertInputDataService.convertTreasureHuntInputData(this.assessment.treasureHunt, this.oldSettings, this.settings);
    this.convertUnitsService.convertSettingsUnitCosts(this.oldSettings, this.settings);
    this.assessment.treasureHunt.existingDataUnits = this.settings.unitsOfMeasure;

    this.treasureHuntService.setTreasureHuntSettings(this.settings);
    this.saveTreasureHunt(this.assessment.treasureHunt);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableTreasureHuntTutorial) {
      this.showWelcomeScreen = true;
      this.treasureHuntService.modalOpen.next(true);
    }
  }

 async closeWelcomeScreen() {
    await this.treasureHuntService.setTreasureHuntTutorialsDisabled();
    this.showWelcomeScreen = false;
    this.treasureHuntService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean){
    this.treasureHuntService.showExportModal.next(input);
  }
}
