import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { FormGroup } from '@angular/forms';
import { MotorInventoryService } from '../../motor-inventory.service';
 
import { Co2SavingsData } from '../../../calculator/utilities/co2-savings/co2-savings.service';
import { MotorInventoryData } from '../../motor-inventory';
import { firstValueFrom, Subscription } from 'rxjs';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';

@Component({
  selector: 'app-plant-setup',
  templateUrl: './plant-setup.component.html',
  styleUrls: ['./plant-setup.component.css']
})
export class PlantSetupComponent implements OnInit {

  settingsForm: FormGroup;
  settings: Settings;

  co2SavingsData: Co2SavingsData;
  motorInventoryData: MotorInventoryData;
  motorInventoryDataSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, private settingsService: SettingsService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private motorInventoryService: MotorInventoryService,  ) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(inventoryData => {
      this.motorInventoryData = inventoryData;
    });
    this.setCo2SavingsData();
  }

  ngOnDestroy() {
    this.motorInventoryDataSub.unsubscribe();
  }

  focusField(field: string) {
    this.motorInventoryService.focusedField.next(field);
  }

  async save() {
    let id: number = this.settings.id;
    let createdDate = this.settings.createdDate;
    let inventoryId: number = this.settings.inventoryId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.inventoryId = inventoryId;
    this.motorInventoryService.settings.next(this.settings);
    //TODO: check for changes and add conversion logic
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings))
    this.settingsDbService.setAll(updatedSettings);
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
