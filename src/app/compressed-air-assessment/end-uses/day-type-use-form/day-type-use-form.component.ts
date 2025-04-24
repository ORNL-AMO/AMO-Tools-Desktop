import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUse } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResult, BaselineResults } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EndUseResults, EndUsesService, UpdatedEndUseData } from '../end-uses.service';
import { DayTypeEndUseWarnings, DayTypeUseFormService } from './day-type-use-form.service';

@Component({
    selector: 'app-day-type-use-form',
    templateUrl: './day-type-use-form.component.html',
    styleUrls: ['./day-type-use-form.component.css'],
    standalone: false
})
export class DayTypeUseFormComponent implements OnInit {
  settings: Settings;
  selectedDayTypeEndUseSubscription: Subscription;
  warnings: DayTypeEndUseWarnings = {measuredPressure: undefined};
  compressedAirAssessment: CompressedAirAssessment;
  
  dayTypeEndUseResult: EndUseResults;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, 
    private dayTypeUseFormService: DayTypeUseFormService,
    private endUsesService: EndUsesService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedDayTypeEndUseSubscription = this.endUsesService.selectedDayTypeEndUse.subscribe(selectedDayTypeEndUse => {
      let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue()
      if (!selectedDayTypeEndUse) {
        selectedDayTypeEndUse = selectedEndUse.dayTypeEndUses[0];
      }
      this.warnings = this.dayTypeUseFormService.checkDayTypeEndUseWarnings(selectedDayTypeEndUse, selectedEndUse);
      this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      this.form = this.dayTypeUseFormService.getDayTypeUseForm(selectedDayTypeEndUse, this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeAverageAirflow);
      
      this.setResults(selectedDayTypeEndUse);
    });
  }

  ngOnDestroy() {
    this.selectedDayTypeEndUseSubscription.unsubscribe();
  }

  setResults(selectedDayTypeEndUse: DayTypeEndUse) {
    let baselineResults: BaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
    let daytypeBaselineResults: BaselineResult = baselineResults.dayTypeResults.find(dayType => dayType.dayTypeId === selectedDayTypeEndUse.dayTypeId);
    let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
    this.dayTypeEndUseResult = this.endUsesService.getSingleDayTypeEndUseResults(selectedDayTypeEndUse, daytypeBaselineResults, selectedEndUse);
  }

  save() {
    let updatedDayTypeEndUse: DayTypeEndUse = this.dayTypeUseFormService.getDayTypeUse(this.form);
    let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
    this.warnings = this.dayTypeUseFormService.checkDayTypeEndUseWarnings(updatedDayTypeEndUse, selectedEndUse);
    let updated: UpdatedEndUseData = this.endUsesService.updateCompressedAirEndUse(selectedEndUse, this.compressedAirAssessment, this.settings, updatedDayTypeEndUse);
    this.compressedAirAssessment = updated.compressedAirAssessment;
    this.compressedAirAssessmentService.compressedAirAssessment.next(updated.compressedAirAssessment);
    this.setResults(updatedDayTypeEndUse);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  

}
