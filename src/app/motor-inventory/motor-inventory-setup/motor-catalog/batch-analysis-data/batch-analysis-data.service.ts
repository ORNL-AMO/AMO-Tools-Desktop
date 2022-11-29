import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BatchAnalysisData } from '../../../motor-inventory';

@Injectable()
export class BatchAnalysisDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromBatchAnalysisData(batchAnalysisData: BatchAnalysisData): UntypedFormGroup {
    return this.formBuilder.group({
      modifiedCost: [batchAnalysisData.modifiedCost, [Validators.min(0)]],
      modifiedPower: [batchAnalysisData.modifiedPower, [Validators.min(0)]],
      modifiedEfficiency: [batchAnalysisData.modifiedEfficiency, [Validators.min(0), Validators.max(100)]],
      modifiedPercentLoad: [batchAnalysisData.modifiedPercentLoad, [Validators.min(0), Validators.max(100)]],
      rewindCost: [batchAnalysisData.rewindCost, [Validators.min(0)]],
      rewindEfficiencyLoss: [batchAnalysisData.rewindEfficiencyLoss, [Validators.min(0)]]
    });
  }

  updateBatchAnalysisDataFromForm(form: UntypedFormGroup, batchAnalysisData: BatchAnalysisData): BatchAnalysisData {
    batchAnalysisData.modifiedCost = form.controls.modifiedCost.value
    batchAnalysisData.modifiedPower = form.controls.modifiedPower.value
    batchAnalysisData.modifiedEfficiency = form.controls.modifiedEfficiency.value
    batchAnalysisData.modifiedPercentLoad = form.controls.modifiedPercentLoad.value
    batchAnalysisData.rewindCost = form.controls.rewindCost.value
    batchAnalysisData.rewindEfficiencyLoss = form.controls.rewindEfficiencyLoss.value
    return batchAnalysisData;
  }
}
