import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, DayTypeEndUse, EndUse } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { BaselineResult, BaselineResults } from '../../../../calculations/caCalculationModels';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { EndUseResults, EndUsesFormService, UpdatedEndUseData } from '../end-uses-form.service';
import { DayTypeEndUseWarnings, DayTypeUseFormService } from './day-type-use-form.service';
import { CompressedAirAssessmentBaselineResults } from '../../../../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../../../../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../../../shared/assessment-co2-savings/assessment-co2-savings.service';

@Component({
  selector: 'app-day-type-use-form',
  templateUrl: './day-type-use-form.component.html',
  styleUrls: ['./day-type-use-form.component.css'],
  standalone: false
})
export class DayTypeUseFormComponent implements OnInit {
  settings: Settings;
  selectedDayTypeEndUseSubscription: Subscription;
  warnings: DayTypeEndUseWarnings = { measuredPressure: undefined };
  compressedAirAssessment: CompressedAirAssessment;

  dayTypeEndUseResult: EndUseResults;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeUseFormService: DayTypeUseFormService,
    private endUsesFormService: EndUsesFormService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedDayTypeEndUseSubscription = this.endUsesFormService.selectedDayTypeEndUse.subscribe(selectedDayTypeEndUse => {
      let selectedEndUse: EndUse = this.endUsesFormService.selectedEndUse.getValue()
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
    let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
    let baselineResults: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
    let daytypeBaselineResults: BaselineResult = baselineResults.dayTypeResults.find(dayType => dayType.dayTypeId === selectedDayTypeEndUse.dayTypeId);
    let selectedEndUse: EndUse = this.endUsesFormService.selectedEndUse.getValue();
    this.dayTypeEndUseResult = this.endUsesFormService.getSingleDayTypeEndUseResults(selectedDayTypeEndUse, daytypeBaselineResults, selectedEndUse);
  }

  save() {
    let updatedDayTypeEndUse: DayTypeEndUse = this.dayTypeUseFormService.getDayTypeUse(this.form);
    let selectedEndUse: EndUse = this.endUsesFormService.selectedEndUse.getValue();
    this.warnings = this.dayTypeUseFormService.checkDayTypeEndUseWarnings(updatedDayTypeEndUse, selectedEndUse);
    let updated: UpdatedEndUseData = this.endUsesFormService.updateCompressedAirEndUse(selectedEndUse, this.compressedAirAssessment, this.settings, updatedDayTypeEndUse);
    this.compressedAirAssessment = updated.compressedAirAssessment;
    this.compressedAirAssessmentService.compressedAirAssessment.next(updated.compressedAirAssessment);
    this.setResults(updatedDayTypeEndUse);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }


}
