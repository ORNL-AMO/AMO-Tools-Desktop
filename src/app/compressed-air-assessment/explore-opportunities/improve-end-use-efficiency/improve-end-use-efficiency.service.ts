import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CompressedAirDayType, EndUseEfficiencyItem, EndUseEfficiencyReductionData, ProfileSummaryTotal, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { BaselineResults } from '../../compressed-air-assessment-results.service';

@Injectable()
export class ImproveEndUseEfficiencyService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getFormFromObj(endUseEfficiencyItem: EndUseEfficiencyItem, baselineResults: BaselineResults): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      name: [endUseEfficiencyItem.name, [Validators.required]],
      implementationCost: [endUseEfficiencyItem.implementationCost, [Validators.min(0)]],
      reductionType: [endUseEfficiencyItem.reductionType],
      airflowReduction: [endUseEfficiencyItem.airflowReduction],
      substituteAuxiliaryEquipment: [endUseEfficiencyItem.substituteAuxiliaryEquipment],
      equipmentDemand: [endUseEfficiencyItem.equipmentDemand],
      collapsed: [endUseEfficiencyItem.collapsed]
    });
    form = this.setFormValidators(form, baselineResults);
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  setFormValidators(form: UntypedFormGroup, baselineResults: BaselineResults): UntypedFormGroup{
    if(form.controls.reductionType.value == 'Fixed'){
      form.controls.airflowReduction.setValidators([Validators.required, Validators.min(0), Validators.max(baselineResults.total.maxAirFlow)])
      form.controls.airflowReduction.updateValueAndValidity();
    }else if(form.controls.reductionType.value == 'Variable'){
      form.controls.airflowReduction.setValidators([]);
      form.controls.airflowReduction.updateValueAndValidity();
    }
    if(form.controls.substituteAuxiliaryEquipment.value == true){
      form.controls.equipmentDemand.setValidators([Validators.required, Validators.min(0)]);
      form.controls.equipmentDemand.updateValueAndValidity();
    }else{
      form.controls.equipmentDemand.setValidators([]);
      form.controls.equipmentDemand.updateValueAndValidity();
    }
    return form;
  }


  updateObjFromForm(form: UntypedFormGroup, endUseEfficiencyItem: EndUseEfficiencyItem): EndUseEfficiencyItem {
    endUseEfficiencyItem.name = form.controls.name.value;
    endUseEfficiencyItem.implementationCost = form.controls.implementationCost.value;
    endUseEfficiencyItem.reductionType = form.controls.reductionType.value;
    endUseEfficiencyItem.airflowReduction = form.controls.airflowReduction.value;
    endUseEfficiencyItem.substituteAuxiliaryEquipment = form.controls.substituteAuxiliaryEquipment.value;
    endUseEfficiencyItem.equipmentDemand = form.controls.equipmentDemand.value;
    endUseEfficiencyItem.collapsed = form.controls.collapsed.value;
    return endUseEfficiencyItem
  }

  getDataForms(endUseEfficiencyItem: EndUseEfficiencyItem, baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>,): Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }> {
    let dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }> = new Array();
    endUseEfficiencyItem.reductionData.forEach((dataItem: EndUseEfficiencyReductionData, dataRowIndex: number) => {
      let dayTypeSummaryTotal: Array<ProfileSummaryTotal> = baselineProfileSummaries.find(summary => { return summary.dayType.dayTypeId == dataItem.dayTypeId }).profileSummaryTotals;
      let form: UntypedFormGroup = this.formBuilder.group({});
      dataItem.data.forEach((d: { hourInterval: number, applyReduction: boolean, reductionAmount: number }, dataIndex: number) => {
        let name: string = "reductionData_" + dataRowIndex + '_' + d.hourInterval;
        let control: AbstractControl = this.getControlFromData(d, dayTypeSummaryTotal, endUseEfficiencyItem.reductionType);
        form.addControl(name, control);
      });
      dataForms.push({ dayTypeName: dataItem.dayTypeName, dayTypeId: dataItem.dayTypeId, form: form });
    });
    return dataForms;
  }

  getControlFromData(data: { hourInterval: number, applyReduction: boolean, reductionAmount: number }, profileSummaryTotal: Array<ProfileSummaryTotal>, reductionType: "Fixed" | "Variable"): AbstractControl {
    let control: AbstractControl;
    if (reductionType == "Variable") {
      let intervalTotal: ProfileSummaryTotal = profileSummaryTotal.find(total => { return total.timeInterval == data.hourInterval });
      control = this.formBuilder.control(data.reductionAmount, [Validators.min(0), Validators.max(intervalTotal.airflow)]);
    } else {
      control = this.formBuilder.control(data.applyReduction);
    }
    return control;
  }


  updateDataFromForm(dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }>, endUseEfficiencyItem: EndUseEfficiencyItem, systemProfileSetup: SystemProfileSetup): EndUseEfficiencyItem {
    dataForms.forEach(dataForm => {
      let endUseIndex: number = endUseEfficiencyItem.reductionData.findIndex(data => { return data.dayTypeId == dataForm.dayTypeId });
      let keyIndex: number = 0;
      for (let key in dataForm.form.controls) {
        let dataIndex: number = endUseEfficiencyItem.reductionData[endUseIndex].data.findIndex(d => { return d.hourInterval == keyIndex });
        if (endUseEfficiencyItem.reductionType == 'Variable') {
          if (isNaN(dataForm.form.controls[key].value) || !dataForm.form.controls[key].value) {
            endUseEfficiencyItem.reductionData[endUseIndex].data[dataIndex].reductionAmount = 0;
          } else {
            endUseEfficiencyItem.reductionData[endUseIndex].data[dataIndex].reductionAmount = dataForm.form.controls[key].value;
          }
        } else {
          endUseEfficiencyItem.reductionData[endUseIndex].data[dataIndex].applyReduction = dataForm.form.controls[key].value;
        }
        keyIndex = keyIndex + systemProfileSetup.dataInterval;
      }
    });
    return endUseEfficiencyItem;
  }

}
