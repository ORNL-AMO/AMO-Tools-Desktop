import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AdjustCascadingSetPoints, CascadingSetPointData } from '../../../shared/models/compressed-air-assessment';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { PerformancePointsFormService } from '../../inventory/performance-points/performance-points-form.service';

@Injectable()
export class AdjustCascadingSetPointsService {

  constructor(private formBuilder: FormBuilder, private performancePointsFormService: PerformancePointsFormService) { }


  getFormFromObj(setPointData: Array<CascadingSetPointData>): Array<CompressorForm> {
    let formData: Array<{
      form: FormGroup,
      compressorId: string,
      controlType: number,
      compressorType: number,
      fullLoadDischargePressure: number,
      maxFullFlowDischargePressure: number
    }> = new Array();
    setPointData.forEach(dataPoint => {
      let form: FormGroup = this.getForm(dataPoint);
      formData.push({
        form: form,
        compressorId: dataPoint.compressorId,
        controlType: dataPoint.controlType,
        compressorType: dataPoint.compressorType,
        fullLoadDischargePressure: dataPoint.fullLoadDischargePressure,
        maxFullFlowDischargePressure: dataPoint.maxFullFlowDischargePressure
      })
    })
    return formData;
  }

  getForm(dataPoint: CascadingSetPointData): FormGroup {
    let fullFlowValidators: Array<ValidatorFn> = this.getMaxFullFlowValidators(dataPoint);
    let form: FormGroup = this.formBuilder.group({
      fullLoadDischargePressure: [dataPoint.fullLoadDischargePressure, [Validators.required, Validators.min(0)]],
      maxFullFlowDischargePressure: [dataPoint.maxFullFlowDischargePressure, fullFlowValidators]
    });

    if (dataPoint.controlType == 4 || dataPoint.controlType == 5 || dataPoint.controlType == 6) {
      form.controls.maxFullFlowDischargePressure.disable();
    }

    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getMaxFullFlowValidators(dataPoint: CascadingSetPointData): Array<ValidatorFn>{
    let fullFlowValidators: Array<ValidatorFn> = new Array();
    let showMaxfullFlow: boolean = this.performancePointsFormService.checkShowMaxFlowPerformancePoint(dataPoint.compressorType, dataPoint.controlType);
    if (showMaxfullFlow) {
      fullFlowValidators.push(Validators.required);
      if (dataPoint.controlType == 4 || dataPoint.controlType == 5 || dataPoint.controlType == 6) {
        fullFlowValidators.push(GreaterThanValidator.greaterThan(dataPoint.fullLoadDischargePressure));
      } else {
        fullFlowValidators.push(Validators.min(dataPoint.fullLoadDischargePressure));
      }
    }
    return fullFlowValidators;
  }

  updateObjFromForm(setPointData: Array<CascadingSetPointData>, formData: Array<CompressorForm>): Array<CascadingSetPointData> {
    setPointData.forEach(dataPoint => {
      let formDataPoint = formData.find(data => { return data.compressorId == dataPoint.compressorId });
      dataPoint.fullLoadDischargePressure = formDataPoint.fullLoadDischargePressure;
      dataPoint.maxFullFlowDischargePressure = formDataPoint.maxFullFlowDischargePressure;
    });
    return setPointData;
  }

  getImplementationCostForm(adjustCascadingSetPoints: AdjustCascadingSetPoints): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      implementationCost: [adjustCascadingSetPoints.implementationCost, [Validators.min(0)]],      
    });
    if(form.controls.implementationCost.value){
      form.controls.implementationCost.markAsDirty();
    }
    return form;
  }

  updateObjImplmentationCost(form: FormGroup, adjustCascadingSetPoints: AdjustCascadingSetPoints): AdjustCascadingSetPoints{
    adjustCascadingSetPoints.implementationCost = form.controls.implementationCost.value;
    return adjustCascadingSetPoints;
  }
}


export interface CompressorForm {
  form: FormGroup,
  compressorId: string,
  controlType: number,
  compressorType: number,
  fullLoadDischargePressure: number,
  maxFullFlowDischargePressure: number
}