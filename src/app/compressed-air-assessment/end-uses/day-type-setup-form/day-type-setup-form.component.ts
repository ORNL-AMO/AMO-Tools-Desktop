import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUseDayTypeSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { DayTypeSetupService } from './day-type-setup.service';

@Component({
  selector: 'app-day-type-setup-form',
  templateUrl: './day-type-setup-form.component.html',
  styleUrls: ['./day-type-setup-form.component.css']
})
export class DayTypeSetupFormComponent implements OnInit {
  settings: Settings;
  form: FormGroup;
  compressedAirAssessment: CompressedAirAssessment;
  isFormChange: boolean = false;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessmentSubscription: Subscription;
  endUseDayTypeSetup: EndUseDayTypeSetup;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, 
    private dayTypeSetupFormService: DayTypeSetupService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue()
    this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;

    this.endUseDayTypeSetup = this.compressedAirAssessment.endUseData.endUseDayTypeSetup;
    if (!this.endUseDayTypeSetup.selectedDayTypeId && this.endUseDayTypeSetup.dayTypeLeakRates.length === 0) {
      this.endUseDayTypeSetup.selectedDayTypeId = this.dayTypeOptions[0].dayTypeId;
      this.endUseDayTypeSetup.dayTypeLeakRates.push({
        dayTypeId: this.dayTypeOptions[0].dayTypeId, 
        dayTypeLeakRate: 0
      });
    }
    this.dayTypeSetupFormService.endUseDayTypeSetup.next(this.endUseDayTypeSetup);
    this.form = this.dayTypeSetupFormService.getDayTypeSetupFormFromObj(this.endUseDayTypeSetup);
  }
  
  setSelectedDayTypeLeakRate() {
    let hasExistingDayTypeLeakRate: boolean = false;
    this.endUseDayTypeSetup.dayTypeLeakRates.map(dayTypeLeakRate => {
      if (dayTypeLeakRate.dayTypeId === this.form.controls.selectedDayTypeId.value) {
          this.form.controls.dayTypeLeakRate.patchValue(dayTypeLeakRate.dayTypeLeakRate);
          hasExistingDayTypeLeakRate = true
      } 
    });

    if (!hasExistingDayTypeLeakRate) {
      this.endUseDayTypeSetup.dayTypeLeakRates.push({dayTypeId: this.form.controls.selectedDayTypeId.value, dayTypeLeakRate: undefined});
      this.form.controls.dayTypeLeakRate.patchValue(undefined);
    }
    this.save();
  }
  
  save() {
    let updatedDayTypeSetup: EndUseDayTypeSetup = this.dayTypeSetupFormService.getDayTypeSetupFromForm(this.form, this.endUseDayTypeSetup);
    this.dayTypeSetupFormService.endUseDayTypeSetup.next(updatedDayTypeSetup);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  

}
