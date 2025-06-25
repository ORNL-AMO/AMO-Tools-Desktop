import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Modification, ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';
import { SecurityAndPrivacyService } from '../shared/security-and-privacy/security-and-privacy.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../shared/email-measur-data/email-measur-data.service';
import { ProcessCoolingMainTabString, ProcessCoolingService, ProcessCoolingSetupTabString } from './process-cooling.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { EGridService } from '../shared/helper-services/e-grid.service';
import { Settings } from '../shared/models/settings';
import { ChillerInventoryService } from './chiller-inventory/chiller-inventory.service';

@Component({
  selector: 'app-process-cooling',
  standalone: false,
  templateUrl: './process-cooling.component.html',
  styleUrl: './process-cooling.component.css'
})
export class ProcessCoolingComponent {
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
  setupTab: ProcessCoolingSetupTabString;
  setupTabSub: Subscription;

  processCoolingSub: Subscription;
  disableNext: boolean = false;

  isModalOpen: boolean;
  modalOpenSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private assessmentDbService: AssessmentDbService, 
    private cd: ChangeDetectorRef, 
    private settingsDbService: SettingsDbService, 
    private processCoolingService: ProcessCoolingService,
    private egridService: EGridService,
    // private defaultChillerDbService: DefaultChillerDbService, 
    private inventoryService: ChillerInventoryService,
    private assessmentService: AssessmentService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-process-cooling-assessment', undefined);
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']));
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.processCoolingService.settings.next(settings);
        // this.defaultChillerDbService.getAllCompressors(this.settings);
      }
      this.processCoolingService.updateProcessCooling(this.assessment.processCooling, false);

      if (!this.inventoryService.selectedChiller.getValue()) {
        this.inventoryService.setDefaultSelectedChiller(this.assessment.processCooling.inventory);
      }
    });

    this.processCoolingSub = this.processCoolingService.processCooling.subscribe(val => {
      if (val && this.assessment) {
        this.save(val);
        this.setDisableNext();
      }
    });

    let tmpTab: ProcessCoolingMainTabString = this.assessmentService.getStartingTab() as ProcessCoolingMainTabString;
    if (tmpTab) {
      this.processCoolingService.mainTab.next(tmpTab);
    }

    this.mainTabSub = this.processCoolingService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.setContainerHeight();
    });

    this.setupTabSub = this.processCoolingService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setDisableNext();
      this.setContainerHeight();
    });

    this.modalOpenSub = this.processCoolingService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    // this.assessmentTabSub = this.processCoolingService.assessmentTab.subscribe(val => {
    //   this.assessmentTab = val;
    // });

    this.showExportModalSub = this.processCoolingService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {    
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
    this.processCoolingSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.processCoolingService.mainTab.next('baseline');
    this.processCoolingService.setupTab.next('assessment-settings');
    // this.inventoryService.selectedChiller.next(undefined);
    this.processCoolingService.processCooling.next(undefined);
    this.inventoryService.selectedChiller.next(undefined); 
  }

  ngAfterViewInit() {
    setTimeout(() => {
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
      // this.assessment.processCooling = this.convertCompressedAirService.convertCompressedAir(this.assessment.processCooling, oldSettings, this.settings);
    }
    // this.defaultChillerDbService.getAllCompressors(this.settings);
    this.processCoolingService.settings.next(this.settings);
  }

  setDisableNext() {
    let processCooling: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    let hasValidInventory: boolean = true;
    let hasValidSystemInformation: boolean = true

    if (this.setupTab == 'system-information' && !hasValidSystemInformation) {
      this.disableNext = true;
    } else if (this.setupTab != 'assessment-settings' && this.setupTab != 'system-information') {
      this.disableNext = true;
    } else {
      this.disableNext = false;
    }
  }

  next() {
    if (this.setupTab == 'assessment-settings') {
      this.processCoolingService.setupTab.next('system-information');
    } else if (this.setupTab == 'system-information') {
      this.processCoolingService.setupTab.next('inventory');
    } else if (this.setupTab == 'inventory') {
      this.processCoolingService.mainTab.next('assessment');
    }
  }

  back() {
    if (this.setupTab == 'system-information') {
      this.processCoolingService.setupTab.next('assessment-settings');
    } else if (this.setupTab == 'inventory') {
      this.processCoolingService.setupTab.next('system-information');
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

  async save(processCooling: ProcessCoolingAssessment) {
    this.assessment.processCooling = processCooling;
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
      this.processCoolingService.mainTab.next('baseline');
      this.processCoolingService.setupTab.next('assessment-settings');
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
    // this.assessment.processCooling = this.convertCompressedAirService.convertCompressedAir(this.assessment.processCooling, this.oldSettings, currentSettings);
    this.assessment.processCooling.existingDataUnits = currentSettings.unitsOfMeasure;
    this.save(this.assessment.processCooling);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableCompressedAirTutorial) {
      this.showWelcomeScreen = true;
      this.processCoolingService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableProcessCoolingTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.processCoolingService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean){
    this.processCoolingService.showExportModal.next(input);
  }
}
