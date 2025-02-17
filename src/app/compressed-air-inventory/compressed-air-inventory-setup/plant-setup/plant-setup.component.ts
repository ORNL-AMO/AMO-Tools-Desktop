import { Component, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { CompressedAirInventoryData, SystemInformation } from '../../compressed-air-inventory';
import { firstValueFrom, Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { IntegrationState } from '../../../shared/connected-inventory/integrations';
import { IntegrationStateService } from '../../../shared/connected-inventory/integration-state.service';
import _ from 'lodash';
import { AltitudeCorrectionService } from '../../../calculator/utilities/altitude-correction/altitude-correction.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrl: './plant-setup.component.css'
})
export class PlantSetupComponent implements OnInit {


  settingsForm: FormGroup;
  settings: Settings;

  co2SavingsData: Co2SavingsData;
  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  oldSettings: Settings;
  connectedAssessmentState: IntegrationState;
  plantSetupForm: UntypedFormGroup;

  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;
  showSystemCapacityModal: boolean = false;


  constructor(private settingsDbService: SettingsDbService,
    private settingsService: SettingsService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private integrationStateService: IntegrationStateService,
    private altitudeCorrectionService: AltitudeCorrectionService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(inventoryData => {
      this.compressedAirInventoryData = inventoryData;
      this.setConnectedItemInfo();
    });
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.compressedAirInventoryData.existingDataUnits && this.compressedAirInventoryData.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }

    this.plantSetupForm = this.compressedAirInventoryService.getFormFromObj(this.compressedAirInventoryData.systemInformation, this.settings);
    this.setCo2SavingsData();
  }

  ngOnDestroy() {
    this.compressedAirInventoryDataSub.unsubscribe();
  }

  setConnectedItemInfo() {
    if (this.compressedAirInventoryData.hasConnectedInventoryItems && this.compressedAirInventoryData.hasConnectedPsat) {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: 'three-way-connected'
      }
    } else if (this.compressedAirInventoryData.hasConnectedInventoryItems) {
      this.integrationStateService.integrationState.next({ status: 'connected-to-inventory' });

    } else if (this.compressedAirInventoryData.hasConnectedPsat) {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: 'connected-to-assessment'
      }
    } else {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: undefined
      }

    }
  }

  getExistingDataSettings(): Settings {

    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({ unitsOfMeasure: this.compressedAirInventoryData.existingDataUnits });
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }


  updateCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    this.compressedAirInventoryData.co2SavingsData = co2SavingsData;
    this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryData);
  }

  setCo2SavingsData() {
    if (this.compressedAirInventoryData.co2SavingsData) {
      this.co2SavingsData = this.compressedAirInventoryData.co2SavingsData;
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }


  async save() {
    let currentSettings: Settings = this.compressedAirInventoryService.settings.getValue();
    let id: number = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let inventoryId: number = currentSettings.inventoryId;

    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let systemInformation: SystemInformation = this.compressedAirInventoryService.updateObjFromForm(this.plantSetupForm, this.compressedAirInventoryData.systemInformation);

    if (this.settings.unitsOfMeasure != currentSettings.unitsOfMeasure) {
      let compressedAirInventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
      compressedAirInventoryData.existingDataUnits = currentSettings.unitsOfMeasure;
      compressedAirInventoryData.systemInformation = systemInformation;
      this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryData);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.inventoryId = inventoryId;
    this.compressedAirInventoryService.settings.next(this.settings);

    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
  }

  updateData(showSuccess?: boolean) {
    if (showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();


    //compressedAirInventoryData = this.convertPumpInventoryService.convertInventoryData(compressedAirInventoryData, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    compressedAirInventoryData.existingDataUnits = newSettings.unitsOfMeasure;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryData);
    this.oldSettings = newSettings;
  }

  initSuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  dismissSuccessMessage() {
    this.showSuccessMessage = false;
  }

  setAtmosphericPressure() {
    let atmosphericPressure: number = this.altitudeCorrectionService.calculatePressureGivenAltitude(this.plantSetupForm.controls.systemElevation.value, this.settings);
    atmosphericPressure = Number(atmosphericPressure.toFixed(2));
    this.plantSetupForm.controls.atmosphericPressure.patchValue(atmosphericPressure);
    this.save();
  }

  toggleAtmosphericPressureKnown() {
    this.plantSetupForm.controls.atmosphericPressureKnown.patchValue(!this.plantSetupForm.controls.atmosphericPressureKnown.value);
    this.save();
  }

  openSystemCapacityModal() {
    //TODO: CA Inventory 
    // this.showSystemCapacityModal = true;
    // this.systemCapacityModal.show();
    // this.compressedAirInventoryService.modalOpen.next(true);
  }

  closeSystemCapacityModal(totalCapacityOfCompressedAirSystem?: number) {
    //TODO: CA Inventory 
    // if (totalCapacityOfCompressedAirSystem) {
    //   this.plantSetupForm.patchValue({
    //     totalAirStorage: totalCapacityOfCompressedAirSystem
    //   });
    // }
    // this.systemCapacityModal.hide();
    // this.compressedAirInventoryService.modalOpen.next(false);
    // this.showSystemCapacityModal = false;
    // this.save();
  }


}
