import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Assessment } from "../../shared/models/assessment";
import { Settings } from "../../shared/models/settings";
import { UntypedFormGroup } from "@angular/forms";
import { SettingsService } from "../../settings/settings.service";
import { WaterAssessmentService } from "../water-assessment.service";
import { SettingsDbService } from "../../indexedDb/settings-db.service";
import { WasteWaterTreatment, WaterAssessment, WaterSystemBasics, WaterTreatment } from "../../shared/models/water-assessment";
import { firstValueFrom } from "rxjs";
import { SystemBasicsService } from "./system-basics.service";
import * as _ from 'lodash';
import { WaterTreatmentService } from "../water-treatment/water-treatment.service";
import { WasteWasteWaterTreatmentService } from "../waste-water-treatment/waste-water-treatment.service";

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();
  
  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  systemBasicsForm: UntypedFormGroup;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;

  isCollapsed: Record<SystemBasicsGroupString, boolean> = {
    waterTreatment: false,
    wasteWaterTreatment: false,
  };

  constructor(private settingsService: SettingsService,
    private waterAssessmentService: WaterAssessmentService,
    private settingsDbService: SettingsDbService,
    private systemBasicsService: SystemBasicsService,
  ) { }


  ngOnInit() {
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.systemBasicsForm = this.systemBasicsService.getFormFromObj(waterAssessment.systemBasics);
    let settings: Settings = this.waterAssessmentService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.assessment.water.existingDataUnits && this.assessment.water.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(this.assessment.water);
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  saveSystemBasics() {
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let systemBasics: WaterSystemBasics = this.systemBasicsService.getObjFromForm(this.systemBasicsForm);
    waterAssessment.systemBasics = systemBasics;
    this.waterAssessmentService.updateWaterAssessment(waterAssessment);
  }

  async saveSettings() {
    let currentSettings: Settings = this.waterAssessmentService.settings.getValue();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      waterAssessment.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.waterAssessmentService.updateWaterAssessment(waterAssessment);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    newSettings.id = id;
    newSettings.createdDate = createdDate;
    newSettings.assessmentId = assessmentId;
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.waterAssessmentService.settings.next(newSettings);
  }

  updateData(showSuccess?: boolean) {
    if(showSuccess) {
      this.initSuccessMessage();
    }
    // let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    // let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    // // waterAssessment = this.convertWaterService.convertWater(waterAssessment, this.oldSettings, newSettings);
    // this.showUpdateDataReminder = false;
    // waterAssessment.existingDataUnits = newSettings.unitsOfMeasure;
    // this.waterAssessmentService.updateWater(waterAssessment, true);
    // this.oldSettings = newSettings;
  }

  toggleCollapse(group: SystemBasicsGroupString) {
    this.isCollapsed[group] = !this.isCollapsed[group];
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  getExistingDataSettings(waterAssessment: WaterAssessment): Settings {
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: waterAssessment.existingDataUnits});
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
}


type SystemBasicsGroupString = 'waterTreatment' | 'wasteWaterTreatment';
