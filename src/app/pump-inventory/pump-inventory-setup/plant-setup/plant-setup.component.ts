import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Settings } from '../../../shared/models/settings';
import { PumpInventoryData } from '../../pump-inventory';
import { PumpInventoryService } from '../../pump-inventory.service';
import * as _ from 'lodash';
import { ConvertPumpInventoryService } from '../../convert-pump-inventory.service';
import { IntegrationStateService } from '../../../shared/assessment-integration/integration-state.service';
import { IntegrationState } from '../../../shared/assessment-integration/integrations';


@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrls: ['./plant-setup.component.css']
})
export class PlantSetupComponent implements OnInit {


  settingsForm: FormGroup;
  settings: Settings;

  co2SavingsData: Co2SavingsData;
  pumpInventoryData: PumpInventoryData;
  pumpInventoryDataSub: Subscription;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  oldSettings: Settings;
  assessmentIntegrationState: IntegrationState;

  constructor(private settingsDbService: SettingsDbService, private settingsService: SettingsService,
    private convertPumpInventoryService: ConvertPumpInventoryService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private integrationStateService: IntegrationStateService,
    private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    
    this.settings = this.pumpInventoryService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(inventoryData => {
      this.pumpInventoryData = inventoryData;
      this.setConnectedItemInfo();
    });
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.pumpInventoryData.existingDataUnits && this.pumpInventoryData.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
    this.setCo2SavingsData();
  }

  ngOnDestroy() {
    this.pumpInventoryDataSub.unsubscribe();
  }

  setConnectedItemInfo() {
    if (this.pumpInventoryData.hasConnectedInventoryItems && this.pumpInventoryData.hasConnectedPsat) {
        this.assessmentIntegrationState = {
          assessmentIntegrationStatus: 'three-way-connected'
        }
    } else if (this.pumpInventoryData.hasConnectedInventoryItems) {
      this.integrationStateService.integrationState.next({status: 'connected-to-inventory'});

    } else if (this.pumpInventoryData.hasConnectedPsat) {
      this.assessmentIntegrationState = {
        assessmentIntegrationStatus: 'connected-to-assessment'
      }
    } else {
      this.assessmentIntegrationState = {
        assessmentIntegrationStatus: undefined
      }
      
    }
  }

  async save() {
    let currentSettings: Settings = this.pumpInventoryService.settings.getValue();
    let id: number = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let inventoryId: number = currentSettings.inventoryId;

    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    
    if (this.settings.unitsOfMeasure != currentSettings.unitsOfMeasure) {
      let pumpInventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
      pumpInventoryData.existingDataUnits = currentSettings.unitsOfMeasure;
      this.pumpInventoryService.pumpInventoryData.next(pumpInventoryData);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.inventoryId = inventoryId;
    this.pumpInventoryService.settings.next(this.settings);
    
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
  }

  updateData(showSuccess?: boolean) {
    if(showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    
    
    pumpInventoryData = this.convertPumpInventoryService.convertInventoryData(pumpInventoryData, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    pumpInventoryData.existingDataUnits = newSettings.unitsOfMeasure;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryData);
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedField.next(str);
  }

  getExistingDataSettings(): Settings {
    
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.pumpInventoryData.existingDataUnits});
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
    this.pumpInventoryData.co2SavingsData = co2SavingsData;
    this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryData);
  }

  setCo2SavingsData() {
    if (this.pumpInventoryData.co2SavingsData) {
      this.co2SavingsData = this.pumpInventoryData.co2SavingsData;
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }

}
