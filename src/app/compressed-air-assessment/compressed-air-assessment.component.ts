import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
 
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { EGridService } from '../shared/helper-services/e-grid.service';
import { Assessment } from '../shared/models/assessment';
import { CompressedAirAssessment } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { ConvertCompressedAirService } from './convert-compressed-air.service';
import { InventoryService } from './baseline-tab-content/inventory-setup/inventory/inventory.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { EndUsesFormService } from './baseline-tab-content/end-uses-setup/end-uses-form/end-uses-form.service';
import { DayTypeSetupService } from './baseline-tab-content/end-uses-setup/end-uses-form/day-type-setup-form/day-type-setup.service';
import { ExploreOpportunitiesService } from './assessment-tab-content/explore-opportunities/explore-opportunities.service';
import { IntegrationStateService } from '../shared/connected-inventory/integration-state.service';
import { CompressedAirAssessmentIntegrationService } from '../shared/connected-inventory/compressed-air-assessment-integration.service';
import { CompressedAirDataManagementService } from './compressed-air-data-management.service';
import { GenericCompressorDbService } from '../shared/generic-compressor-db.service';

@Component({
    selector: 'app-compressed-air-assessment',
    templateUrl: './compressed-air-assessment.component.html',
    styleUrls: ['./compressed-air-assessment.component.css'],
    standalone: false
})
export class CompressedAirAssessmentComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContainerHeight();
  }

  compressedAirAssessment: CompressedAirAssessment;
  assessment: Assessment;
  settings: Settings;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  compressedAirAsseementSub: Subscription;
  disableNext: boolean = false;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  showWelcomeScreen: boolean = false;
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  initializingAssessment: boolean = true;
  connectedInventoryDataSub: Subscription;  
  hasConnectedMotorItem: boolean;
  constructor(private activatedRoute: ActivatedRoute,
    private endUseDayTypeSetupService: DayTypeSetupService,
    private convertCompressedAirService: ConvertCompressedAirService, private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private egridService: EGridService,
    private endUseFormService: EndUsesFormService,
    private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService,
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private analyticsService: AnalyticsService,
    private integrationStateService: IntegrationStateService,
    private compressedAirDataManagementService: CompressedAirDataManagementService,
    private compressedAirAssessmentIntegrationService: CompressedAirAssessmentIntegrationService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-compressed-air-assessment', undefined);
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.initializingAssessment = true;
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']));
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.compressedAirAssessmentService.settings.next(settings);
        this.genericCompressorDbService.getAllCompressors(this.settings);
      }

      let fromConnectedItem = this.activatedRoute.snapshot.queryParamMap.get('fromConnectedItem');
      if (fromConnectedItem) {
        this.redirectFromConnectedInventory();
      } else {
        this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.assessment, this.settings);
      }

      let connectedInventory = this.activatedRoute.snapshot.queryParamMap.get('connectedInventory');
      if (connectedInventory) {
        this.save(this.assessment.compressedAirAssessment);
      }

      this.compressedAirAssessmentService.updateCompressedAir(this.assessment.compressedAirAssessment, true);
      this.initializingAssessment = false;
    });

    this.compressedAirAsseementSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val && this.assessment) {
        this.compressedAirAssessment = val;
        this.save(val);
        // this.setDisableNext();
      }
    })
    
    //TODO: see when to fire checkConnectedInventoryDiffers
    // this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
    //   this.setupTab = val;
    //   if (this.assessment.compressedAirAssessment.connectedItem && this.assessment.compressedAirAssessment.connectedItem.inventoryType === 'compressed-air') {
    //     this.compressedAirAssessmentIntegrationService.checkConnectedInventoryDiffers(this.assessment);
    //   }
    //   this.setDisableNext();
    //   this.setContainerHeight();
    // });

    
    this.modalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });


    this.showExportModalSub = this.compressedAirAssessmentService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.hasConnectedMotorItem = this.compressedAirAssessment.connectedItem && this.compressedAirAssessment.connectedItem.inventoryType === 'motor';
      if (connectedInventoryData.shouldRestoreConnectedValues) {
        const selectedCompressor = this.inventoryService.selectedCompressor.getValue();
        this.compressedAirAssessmentIntegrationService.restoreConnectedAssessmentValues(selectedCompressor, connectedInventoryData, this.compressedAirAssessment);
        // * update compressor related properties, isValid, hasValidCompressors, etc.
        this.compressedAirDataManagementService.updateAssessmentFromDependentCompressorItem(selectedCompressor, true, true);
        this.save(this.compressedAirAssessment);
      }
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {    
    this.compressedAirAsseementSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.inventoryService.selectedCompressor.next(undefined);
    this.inventoryService.tabSelect.next('inventory');
    // this.endUseService.endUses.next(undefined);
    this.endUseFormService.selectedEndUse.next(undefined);
    this.endUseFormService.selectedDayTypeEndUse.next(undefined);
    this.endUseDayTypeSetupService.endUseDayTypeSetup.next(undefined)
    this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.next(undefined);
    this.compressedAirAssessmentService.compressedAirAssessmentBaselineResults.next(undefined);
    this.exploreOpportunitiesService.selectedDayType.next(undefined);
    this.compressedAirAssessmentService.compressedAirAssessment.next(undefined);
    this.connectedInventoryDataSub.unsubscribe();
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
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
      this.assessment.compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(this.assessment.compressedAirAssessment, oldSettings, this.settings);
    }
    this.genericCompressorDbService.getAllCompressors(this.settings);
    this.compressedAirAssessmentService.settings.next(this.settings);
  }

  redirectFromConnectedInventory() {
    //TODO: user router..
    // this.compressedAirAssessmentService.mainTab.next('baseline');
    // this.compressedAirAssessmentService.setupTab.next('system-information');
  }

  // setDisableNext() {
  //   let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
  //   let hasValidCompressors: boolean = this.inventoryService.hasValidCompressors(compressedAirAssessment);
  //   let hasValidSystemInformation: boolean = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings).valid;
  //   let hasValidDayTypes: boolean = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
  //   if (this.setupTab == 'system-information' && !hasValidSystemInformation) {
  //     this.disableNext = true;
  //   } else if (this.setupTab == 'day-types' && !hasValidDayTypes) {
  //     this.disableNext = true;
  //   } else if (hasValidCompressors == false && this.setupTab != 'system-basics' && this.setupTab != 'system-information') {
  //     this.disableNext = true;
  //   } else if (this.setupTab == 'system-profile') {
  //     let hasValidSystemProfile: boolean = this.compressedAirAssessmentService.hasValidProfileSummaryData(compressedAirAssessment).isValid;
  //     if (hasValidSystemProfile) {
  //       this.disableNext = false;
  //     } else {
  //       this.disableNext = true;
  //     }
  //   } else {
  //     this.disableNext = false;
  //   }
  // }


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

  saveCompressedAirAssessment(getNewCompressedAirAssessment: CompressedAirAssessment) {
    this.compressedAirAssessment = getNewCompressedAirAssessment;
    this.save(this.compressedAirAssessment);
  }

  async save(compressedAirAssessment: CompressedAirAssessment) {
    this.assessment.compressedAirAssessment = compressedAirAssessment;    
    this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.assessment, this.settings);
    this.hasConnectedMotorItem = compressedAirAssessment.connectedItem && compressedAirAssessment.connectedItem.inventoryType === 'motor';
    if (this.assessment.compressedAirAssessment.connectedItem && this.assessment.compressedAirAssessment.connectedItem.inventoryType === 'compressed-air') {
      this.compressedAirAssessmentIntegrationService.checkConnectedInventoryDiffers(this.assessment);
    }
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableCompressedAirTutorial) {
      this.showWelcomeScreen = true;
      this.compressedAirAssessmentService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableCompressedAirTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.compressedAirAssessmentService.modalOpen.next(false);
  }

  closeExportModal(input: boolean){
    this.compressedAirAssessmentService.showExportModal.next(input);
  }

  saveAndUpdateSettings() {
    // this.getSettings();
    // this.save();
  }
}
