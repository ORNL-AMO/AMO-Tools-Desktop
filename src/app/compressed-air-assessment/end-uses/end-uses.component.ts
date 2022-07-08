import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUse } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { EndUsesService, UpdatedEndUseData } from './end-uses.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-end-uses',
  templateUrl: './end-uses.component.html',
  styleUrls: ['./end-uses.component.css']
})
export class EndUsesComponent implements OnInit {
  hasEndUses: boolean;
  form: FormGroup;
  isFormChange: boolean = false;
  selectedEndUseSubscription: Subscription;
  settings: Settings;
  dayTypeEndUses: Array<DayTypeEndUse>;

  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private endUsesService: EndUsesService) { }

  ngOnInit(): void {
    this.initializeEndUses();
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedEndUseSubscription = this.endUsesService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        this.hasEndUses = true;
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;
        if (this.isFormChange == false) {
          this.form = this.endUsesService.getEndUseFormFromObj(selectedEndUse);
          this.setDayTypeEndUseData(selectedEndUse);
        } else {
          this.isFormChange = false;
        }
      } else {
        this.hasEndUses = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
  }

  save(endUse?: EndUse) {
    if (!endUse) {
      endUse = this.endUsesService.getEndUseFromFrom(this.form);
      endUse.dayTypeEndUses = this.dayTypeEndUses;
    }
    this.isFormChange = true;
    let compressedAirAssessment =  this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let updated: UpdatedEndUseData = this.endUsesService.updateCompressedAirEndUse(endUse, compressedAirAssessment);
    this.compressedAirAssessmentService.compressedAirAssessment.next(updated.compressedAirAssessment);
    this.endUsesService.selectedEndUse.next(updated.endUse);
  }

  setDayTypeEndUseData(selectedEndUse: EndUse) {
    this.dayTypeEndUses = selectedEndUse.dayTypeEndUses;
    this.selectedDayType = this.dayTypeOptions.find(option => option.dayTypeId === selectedEndUse.selectedDayTypeId);
    let dayTypeEndUse = selectedEndUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId === this.form.controls.selectedDayTypeId.value);
    if (!dayTypeEndUse) {
      selectedEndUse.dayTypeEndUses.push(this.endUsesService.getDefaultDayTypeEndUse(this.form.controls.selectedDayTypeId.value));
      this.save(selectedEndUse);
    }
    this.endUsesService.selectedDayTypeEndUse.next(dayTypeEndUse);
  }

  initializeEndUses() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.hasEndUses = compressedAirAssessment.endUses.length !== 0;
    if (this.hasEndUses) {
      let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
      if (selectedEndUse) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let endUseExists: EndUse = compressedAirAssessment.endUses.find(endUse => { return endUse.endUseId == selectedEndUse.endUseId });
        if (!endUseExists) {
          this.setLastUsedEndUse(compressedAirAssessment);
        }
      } else {
        this.setLastUsedEndUse(compressedAirAssessment);
      }
    }
  }

  changeSelectedDayTypeEndUse() {
    let selectedDayTypeEndUse = this.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId === this.form.controls.selectedDayTypeId.value);
    if (!selectedDayTypeEndUse) {
      let currentEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
      let newDayTypeEndUse: DayTypeEndUse = this.endUsesService.getDefaultDayTypeEndUse(this.form.controls.selectedDayTypeId.value); 
      currentEndUse.dayTypeEndUses.push(newDayTypeEndUse);
      this.save(currentEndUse);
      selectedDayTypeEndUse = newDayTypeEndUse;
    }
    this.selectedDayType = this.dayTypeOptions.find(option => option.dayTypeId === selectedDayTypeEndUse.dayTypeId);
    this.endUsesService.selectedDayTypeEndUse.next(selectedDayTypeEndUse);
    this.save();
  }

  setLastUsedEndUse(compressedAirAssessment: CompressedAirAssessment) {
    let lastItemModified: EndUse = _.maxBy(compressedAirAssessment.endUses, 'modifiedDate');
    this.endUsesService.selectedEndUse.next(lastItemModified);
  }

  addEndUse() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let newEndUse: UpdatedEndUseData = this.endUsesService.addToAssessment(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(newEndUse.compressedAirAssessment, true);
    this.endUsesService.selectedEndUse.next(newEndUse.endUse);
    this.hasEndUses = true;
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
