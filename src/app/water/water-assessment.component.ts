import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { Assessment } from '../shared/models/assessment';
import { WaterAssessmentService } from './water-assessment.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { WaterAssessment } from '../shared/models/water-assessment';

@Component({
  selector: 'app-water-assessment',
  templateUrl: './water-assessment.component.html',
  styleUrl: './water-assessment.component.css'
})
export class WaterAssessmentComponent {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContainerHeight();
  }

  assessment: Assessment;
  settings: Settings;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  mainTab: string;
  mainTabSub: Subscription;
  setupTab: string;
  setupTabSub: Subscription;
  waterAssessmentSub: Subscription;
  disableNext: boolean = false;
  showModificationListSub: Subscription;
  showModificationList: boolean = false;
  showAddModificationSub: Subscription;
  showAddModification: boolean = false;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private convertWaterAssessmentService: ConvertWaterAssessmentService, 
    private assessmentDbService: AssessmentDbService, 
    private cd: ChangeDetectorRef, 
    private settingsDbService: SettingsDbService, 
    private waterAssessmentService: WaterAssessmentService,
    // private exploreOpportunitiesService: ExploreOpportunitiesService, 
    private assessmentService: AssessmentService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-water-assessment', undefined);
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']));
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.waterAssessmentService.settings.next(settings);
      }
      this.waterAssessmentService.updateWaterAssessment(this.assessment.water, false);
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(val => {
      if (val && this.assessment) {
        this.save(val);
        this.setDisableNext();
      }
    })

    let startingTab: string = this.assessmentService.getStartingTab();
    if (startingTab) {
      this.waterAssessmentService.mainTab.next(startingTab);
    }

    this.mainTabSub = this.waterAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.setContainerHeight();
    });

    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setDisableNext();
      this.setContainerHeight();
    });

    this.showAddModificationSub = this.waterAssessmentService.showAddModificationModal.subscribe(val => {
      this.showAddModification = val;
      this.cd.detectChanges();
    });


    this.showModificationListSub = this.waterAssessmentService.showModificationListModal.subscribe(val => {
      this.showModificationList = val;
      this.cd.detectChanges();
    });

    this.modalOpenSub = this.waterAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.assessmentTabSub = this.waterAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });

    this.showExportModalSub = this.waterAssessmentService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {    
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.showAddModificationSub.unsubscribe();
    this.showModificationListSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.waterAssessmentService.mainTab.next('system-setup');
    this.waterAssessmentService.setupTab.next('system-basics');
    // this.endUseService.endUses.next(undefined);
    // this.exploreOpportunitiesService.modificationResults.next(undefined);
    // this.exploreOpportunitiesService.selectedDayType.next(undefined);
    this.waterAssessmentService.waterAssessment.next(undefined);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.disclaimerToast();
      this.setContainerHeight();
    }, 100);
  }

 async addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    
    if (this.settings.unitsOfMeasure == 'Metric') {
      let oldSettings: Settings = JSON.parse(JSON.stringify(this.settings));
      oldSettings.unitsOfMeasure = 'Imperial';
      this.assessment.water = this.convertWaterAssessmentService.convertWaterAssessment(this.assessment.water, oldSettings, this.settings);
    }
    this.waterAssessmentService.settings.next(this.settings);
  }

  setDisableNext() {
    // let compressedAirAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    // let hasValidCompressors: boolean = this.inventoryService.hasValidCompressors(compressedAirAssessment);
    // let hasValidSystemInformation: boolean = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings).valid;
    // let hasValidDayTypes: boolean = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
    // if (this.setupTab == 'system-information' && !hasValidSystemInformation) {
    //   this.disableNext = true;
    // } else if (this.setupTab == 'day-types' && !hasValidDayTypes) {
    //   this.disableNext = true;
    // } else if (hasValidCompressors == false && this.setupTab != 'system-basics' && this.setupTab != 'system-information') {
    //   this.disableNext = true;
    // } else if (this.setupTab == 'system-profile') {
    //   let hasValidSystemProfile: boolean = this.waterAssessmentService.hasValidProfileSummaryData(compressedAirAssessment).isValid;
    //   if (hasValidSystemProfile) {
    //     this.disableNext = false;
    //   } else {
    //     this.disableNext = true;
    //   }
    // } else {
    //   this.disableNext = false;
    // }
  }

  next() {
    if (this.setupTab == 'system-basics') {
      this.waterAssessmentService.setupTab.next('intake-source');
    } else if (this.setupTab == 'intake-source') {
      this.waterAssessmentService.setupTab.next('process-use');
    } else if (this.setupTab == 'process-use') {
      this.waterAssessmentService.setupTab.next('discharge-outlet');
    } else if (this.setupTab == 'discharge-outlet') {
      this.waterAssessmentService.mainTab.next('assessment');
    } 
  }

  back() {
    if (this.setupTab == 'discharge-outlet') {
      this.waterAssessmentService.setupTab.next('process-use');
    } else if (this.setupTab == 'process-use') {
      this.waterAssessmentService.setupTab.next('intake-source');
    } else if (this.setupTab == 'intake-source') {
      this.waterAssessmentService.setupTab.next('system-basics');
    } 
  }

  setContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.offsetHeight;
        let headerHeight = this.header.nativeElement.offsetHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.offsetHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }, 100);
    }
  }

  async save(waterAssessment: WaterAssessment) {
    this.assessment.water = waterAssessment;
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.waterAssessmentService.mainTab.next('system-setup');
      this.waterAssessmentService.setupTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    let currentSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.assessment.water = this.convertWaterAssessmentService.convertWaterAssessment(this.assessment.water, this.oldSettings, currentSettings);
    this.assessment.water.existingDataUnits = currentSettings.unitsOfMeasure;
    this.save(this.assessment.water);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableWaterTutorial) {
      this.showWelcomeScreen = true;
      this.waterAssessmentService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableWaterTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean){
    this.waterAssessmentService.showExportModal.next(input);
  }
}
