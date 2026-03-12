import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
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

  compressedAirAssessment: CompressedAirAssessment;
  assessment: Assessment;
  settings: Settings;
  compressedAirAsseementSub: Subscription;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  showWelcomeScreen: boolean = false;
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  initializingAssessment: boolean = true;
  connectedInventoryDataSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private endUseDayTypeSetupService: DayTypeSetupService,
    private convertCompressedAirService: ConvertCompressedAirService, private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private endUseFormService: EndUsesFormService,
    private genericCompressorDbService: GenericCompressorDbService, private inventoryService: InventoryService,
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private analyticsService: AnalyticsService,
    private integrationStateService: IntegrationStateService,
    private compressedAirDataManagementService: CompressedAirDataManagementService,
    private compressedAirAssessmentIntegrationService: CompressedAirAssessmentIntegrationService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-compressed-air-assessment', undefined);
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

      //set connected inventory data 
      let fromConnectedItem = this.activatedRoute.snapshot.queryParamMap.get('fromConnectedItem');
      if (!fromConnectedItem) {
        this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.assessment.compressedAirAssessment, this.settings);
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
      }
    })

    this.modalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });


    this.showExportModalSub = this.compressedAirAssessmentService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
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

  //initialize settings for assessment
  async addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    //if settings are metric convert default assessment to metric
    //default assessment is created in imperial
    if (this.settings.unitsOfMeasure == 'Metric') {
      let oldSettings: Settings = JSON.parse(JSON.stringify(this.settings));
      oldSettings.unitsOfMeasure = 'Imperial';
      this.assessment.compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(this.assessment.compressedAirAssessment, oldSettings, this.settings);
    }
    this.genericCompressorDbService.getAllCompressors(this.settings);
    this.compressedAirAssessmentService.settings.next(this.settings);
  }

  async save(compressedAirAssessment: CompressedAirAssessment) {
    this.assessment.compressedAirAssessment = compressedAirAssessment;
    this.compressedAirAssessmentIntegrationService.setCompressedAirAssessmentConnectedInventoryData(this.assessment.compressedAirAssessment, this.settings);
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

  closeExportModal(input: boolean) {
    this.compressedAirAssessmentService.showExportModal.next(input);
  }
}
