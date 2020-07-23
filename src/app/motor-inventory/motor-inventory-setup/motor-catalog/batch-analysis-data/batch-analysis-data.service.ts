import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BatchAnalysisData } from '../../../motor-inventory';

@Injectable()
export class BatchAnalysisDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromBatchAnalysisData(batchAnalysisData: BatchAnalysisData): FormGroup {
    return this.formBuilder.group({
      modifiedCost: [batchAnalysisData.modifiedCost],
      modifiedPower: [batchAnalysisData.modifiedPower],
      modifiedEfficiency: [batchAnalysisData.modifiedEfficiency],
      modifiedPercentLoad: [batchAnalysisData.modifiedPercentLoad],
      rewindCost: [batchAnalysisData.rewindCost],
      rewindEfficiencyLoss: [batchAnalysisData.rewindEfficiencyLoss]
    });
  }

  updateBatchAnalysisDataFromForm(form: FormGroup, batchAnalysisData: BatchAnalysisData): BatchAnalysisData {
    batchAnalysisData.modifiedCost = form.controls.modifiedCost.value
    batchAnalysisData.modifiedPower = form.controls.modifiedPower.value
    batchAnalysisData.modifiedEfficiency = form.controls.modifiedEfficiency.value
    batchAnalysisData.modifiedPercentLoad = form.controls.modifiedPercentLoad.value
    batchAnalysisData.rewindCost = form.controls.rewindCost.value
    batchAnalysisData.rewindEfficiencyLoss = form.controls.rewindEfficiencyLoss.value
    return batchAnalysisData;
  }
}
