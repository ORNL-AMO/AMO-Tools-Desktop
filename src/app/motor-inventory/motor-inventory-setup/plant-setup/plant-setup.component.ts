import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { UntypedFormGroup } from '@angular/forms';
import { MotorInventoryService } from '../../motor-inventory.service';
 
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { MotorInventoryData } from '../../motor-inventory';
import { firstValueFrom, Subscription } from 'rxjs';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ConvertMotorInventoryService } from '../../convert-motor-inventory.service';
import * as _ from 'lodash';
import { IntegrationStateService } from '../../../shared/assessment-integration/integration-state.service';


@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrls: ['./plant-setup.component.css']
})
export class PlantSetupComponent implements OnInit {

  settingsForm: UntypedFormGroup;
  settings: Settings;

  co2SavingsData: Co2SavingsData;
  motorInventoryData: MotorInventoryData;
  motorInventoryDataSub: Subscription;
  showSuccessMessage: boolean;
  oldSettings: Settings;
  showUpdateDataReminder: boolean;

  constructor(private settingsDbService: SettingsDbService, private settingsService: SettingsService, private convertMotorInventoryService: ConvertMotorInventoryService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private integrationStateService: IntegrationStateService,
    private motorInventoryService: MotorInventoryService,  ) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(inventoryData => {
      this.motorInventoryData = inventoryData;
      if (this.motorInventoryData.hasConnectedItems) {
        this.integrationStateService.integrationState.next({status: 'connected-items'});
      }
    });    
    
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.motorInventoryData.existingDataUnits && this.motorInventoryData.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
    this.setCo2SavingsData();
  }

  ngOnDestroy() {
    this.motorInventoryDataSub.unsubscribe();
  }

  updateData(showSuccess?: boolean) {
    if(showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
  
    motorInventoryData = this.convertMotorInventoryService.convertInventoryData(motorInventoryData, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    motorInventoryData.existingDataUnits = newSettings.unitsOfMeasure;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
    this.oldSettings = newSettings;
  }

  focusField(field: string) {
    this.motorInventoryService.focusedField.next(field);
  }

  async save() {
    let currentSettings: Settings = this.motorInventoryService.settings.getValue();
    let id: number = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let inventoryId: number = currentSettings.inventoryId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.settings.unitsOfMeasure != currentSettings.unitsOfMeasure) {
      let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
      motorInventoryData.existingDataUnits = currentSettings.unitsOfMeasure;
      this.motorInventoryService.motorInventoryData.next(motorInventoryData);
      this.showUpdateDataReminder = true;
    }
  
    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.inventoryId = inventoryId;
    this.motorInventoryService.settings.next(this.settings);
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings))
    this.settingsDbService.setAll(updatedSettings);
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.motorInventoryData.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
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

  updateCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    this.motorInventoryData.co2SavingsData = co2SavingsData;
    this.motorInventoryService.motorInventoryData.next(this.motorInventoryData);
  }

  setCo2SavingsData() {
    if (this.motorInventoryData.co2SavingsData) {
      this.co2SavingsData = this.motorInventoryData.co2SavingsData;
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }

}
