import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUse, EndUseDayTypeSetup } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { EndUsesFormService, EndUseWarnings, UpdatedEndUseData } from './end-uses-form.service';
import * as _ from 'lodash';
import { Settings } from '../../../../shared/models/settings';
import { DayTypeSetupService } from './day-type-setup-form/day-type-setup.service';

@Component({
  selector: 'app-end-uses-form',
  standalone: false,
  templateUrl: './end-uses-form.component.html',
  styleUrl: './end-uses-form.component.css'
})
export class EndUsesFormComponent {
hasEndUses: boolean;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  selectedEndUseSubscription: Subscription;
  settings: Settings;
  dayTypeEndUses: Array<DayTypeEndUse>;
  endUseDayTypeSetup: EndUseDayTypeSetup;
  compressedAirAssessment: CompressedAirAssessment
  selectedDayType: CompressedAirDayType;
  dayTypeSetupServiceSubscription: Subscription;
  warnings: EndUseWarnings = {requiredPressure: undefined};

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeSetupService: DayTypeSetupService, private endUsesFormService: EndUsesFormService) { }

  ngOnInit(): void {
    this.initializeDefaultData();
    this.selectedEndUseSubscription = this.endUsesFormService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        this.hasEndUses = true;
        this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        if (this.isFormChange == false) {
          this.warnings = this.endUsesFormService.checkEndUseWarnings(selectedEndUse);
          this.form = this.endUsesFormService.getEndUseFormFromObj(selectedEndUse, this.compressedAirAssessment.endUseData.endUses);
          this.setDayTypeEndUseData(selectedEndUse);
        } else {
          this.isFormChange = false;
        }
      } else {
        this.hasEndUses = false;
      }
    });
    this.dayTypeSetupServiceSubscription = this.dayTypeSetupService.endUseDayTypeSetup.subscribe(endUseDayTypeSetup => {
      if (this.hasEndUses && endUseDayTypeSetup) {
        this.endUseDayTypeSetup = endUseDayTypeSetup;
        this.changeSelectedDayTypeEndUse(this.endUseDayTypeSetup.selectedDayTypeId);
      }  
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
    this.dayTypeSetupServiceSubscription.unsubscribe();
  }

  setEndUseName() {
    this.form = this.endUsesFormService.setEndUseNameValidators(this.form, this.compressedAirAssessment.endUseData.endUses)
    this.save();
  }

  save(endUse?: EndUse) {
    if (!endUse) {
      endUse = this.endUsesFormService.getEndUseFromFrom(this.form);
      endUse.dayTypeEndUses = this.dayTypeEndUses;
    }
    if (!this.endUseDayTypeSetup) {
      this.endUseDayTypeSetup = this.compressedAirAssessment.endUseData.endUseDayTypeSetup;
    }
    this.isFormChange = true;
    this.compressedAirAssessment.endUseData.endUseDayTypeSetup = this.endUseDayTypeSetup;
    this.warnings = this.endUsesFormService.checkEndUseWarnings(endUse);
    let updated: UpdatedEndUseData = this.endUsesFormService.updateCompressedAirEndUse(endUse, this.compressedAirAssessment, this.settings);
    this.compressedAirAssessment = updated.compressedAirAssessment;
    this.compressedAirAssessmentService.compressedAirAssessment.next(updated.compressedAirAssessment);
    this.endUsesFormService.selectedEndUse.next(updated.endUse);
  }

  updateDayTypeEndUsePressure() {
    this.save();
    let selectedDayTypeEndUse = this.endUsesFormService.selectedDayTypeEndUse.getValue();
    this.endUsesFormService.selectedDayTypeEndUse.next(selectedDayTypeEndUse);
  }

  setDayTypeEndUseData(selectedEndUse: EndUse) {
    this.dayTypeEndUses = selectedEndUse.dayTypeEndUses;
    if (this.endUseDayTypeSetup && this.endUseDayTypeSetup.selectedDayTypeId) {
      this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(option => option.dayTypeId === this.endUseDayTypeSetup.selectedDayTypeId);
    } else {
      this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    }

    let dayTypeEndUse = selectedEndUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId === this.selectedDayType.dayTypeId);
    if (!dayTypeEndUse) {
      dayTypeEndUse = this.endUsesFormService.getDefaultDayTypeEndUse(this.selectedDayType.dayTypeId);
      selectedEndUse.dayTypeEndUses.push(dayTypeEndUse);
      this.save(selectedEndUse);
    }
    this.endUsesFormService.selectedDayTypeEndUse.next(dayTypeEndUse);
  }

  initializeDefaultData() {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.endUseDayTypeSetup = this.dayTypeSetupService.endUseDayTypeSetup.getValue();
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.hasEndUses = this.compressedAirAssessment.endUseData.endUses && this.compressedAirAssessment.endUseData.endUses.length !== 0;
    if (this.hasEndUses) {
      let selectedEndUse: EndUse = this.endUsesFormService.selectedEndUse.getValue();
      if (selectedEndUse) {
        let endUseExists: EndUse = this.compressedAirAssessment.endUseData.endUses.find(endUse => { return endUse.endUseId == selectedEndUse.endUseId });
        if (!endUseExists) {
          this.setLastUsedEndUse();
        }
      } else {
        this.setLastUsedEndUse();
      }
    }
  }

  changeSelectedDayTypeEndUse(selectedDayTypeId: string) {
    let selectedDayTypeEndUse = this.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId === selectedDayTypeId);
    if (!selectedDayTypeEndUse) {
      let currentEndUse: EndUse = this.endUsesFormService.selectedEndUse.getValue();
      let newDayTypeEndUse: DayTypeEndUse = this.endUsesFormService.getDefaultDayTypeEndUse(selectedDayTypeId); 
      selectedDayTypeEndUse = newDayTypeEndUse;
      currentEndUse.dayTypeEndUses.push(newDayTypeEndUse);
    }
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(option => option.dayTypeId === selectedDayTypeEndUse.dayTypeId);

    this.endUsesFormService.selectedDayTypeEndUse.next(selectedDayTypeEndUse);
    this.save();
  }

  setLastUsedEndUse() {
    let lastItemModified: EndUse = _.maxBy(this.compressedAirAssessment.endUseData.endUses, 'modifiedDate');
    this.endUsesFormService.selectedEndUse.next(lastItemModified);
  }

  addEndUse() {
    if (!this.compressedAirAssessment.endUseData.endUseDayTypeSetup) {
      this.compressedAirAssessment.endUseData.endUseDayTypeSetup = this.dayTypeSetupService.endUseDayTypeSetup.getValue();
      this.endUseDayTypeSetup = this.compressedAirAssessment.endUseData.endUseDayTypeSetup;
    }
    let newEndUse: UpdatedEndUseData = this.endUsesFormService.addToAssessment(this.compressedAirAssessment, this.settings);
    this.compressedAirAssessment = newEndUse.compressedAirAssessment;
    this.compressedAirAssessmentService.updateCompressedAir(newEndUse.compressedAirAssessment, true);
    this.endUsesFormService.selectedEndUse.next(newEndUse.endUse);
    this.hasEndUses = true;
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
