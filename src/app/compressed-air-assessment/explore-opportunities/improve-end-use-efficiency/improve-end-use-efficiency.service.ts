import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EndUseEfficiencyItem, EndUseEfficiencyReductionData } from '../../../shared/models/compressed-air-assessment';

@Injectable()
export class ImproveEndUseEfficiencyService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(endUseEfficiencyItem: EndUseEfficiencyItem): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [endUseEfficiencyItem.name, [Validators.required]],
      implementationCost: [endUseEfficiencyItem.implementationCost, [Validators.min(0)]],
      reductionType: [endUseEfficiencyItem.reductionType],
      airflowReduction: [endUseEfficiencyItem.airflowReduction],
      substituteAuxiliaryEquipment: [endUseEfficiencyItem.substituteAuxiliaryEquipment],
      equipmentDemand: [endUseEfficiencyItem.equipmentDemand],
      collapsed: [endUseEfficiencyItem.collapsed]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  updateObjFromForm(form: FormGroup, endUseEfficiencyItem: EndUseEfficiencyItem): EndUseEfficiencyItem {
    endUseEfficiencyItem.name = form.controls.name.value;
    endUseEfficiencyItem.implementationCost = form.controls.implementationCost.value;
    endUseEfficiencyItem.reductionType = form.controls.reductionType.value;
    endUseEfficiencyItem.airflowReduction = form.controls.airflowReduction.value;
    endUseEfficiencyItem.substituteAuxiliaryEquipment = form.controls.substituteAuxiliaryEquipment.value;
    endUseEfficiencyItem.equipmentDemand = form.controls.equipmentDemand.value;
    endUseEfficiencyItem.collapsed = form.controls.collapsed.value;
    return endUseEfficiencyItem
  }

  getDataForms(endUseEfficiencyItem: EndUseEfficiencyItem): Array<{ dayTypeName: string, form: FormGroup }> {
    let dataForms: Array<{ dayTypeName: string, form: FormGroup }> = new Array();
    endUseEfficiencyItem.reductionData.forEach((dataItem: EndUseEfficiencyReductionData, dataRowIndex: number) => {
      let form: FormGroup = this.formBuilder.group({});
      dataItem.data.forEach((d: { hourInterval: number, applyReduction: boolean, reductionAmount: number }, dataIndex: number) => {
        let name: string = "reductionData_" + dataRowIndex + '_' + dataIndex;
        let control: AbstractControl = this.getControlFromData(d, dataRowIndex, dataIndex, endUseEfficiencyItem.reductionType);
        form.addControl(name, control);
      });
      dataForms.push({ dayTypeName: dataItem.dayTypeName, form: form });
    });
    return dataForms;
  }

  getControlFromData(data: { hourInterval: number, applyReduction: boolean, reductionAmount: number }, dataRowIndex: number, dataIndex: number, reductionType: "Fixed" | "Variable"): AbstractControl {
    let control: AbstractControl;
    if (reductionType == "Variable") {
      control = this.formBuilder.control(data.reductionAmount, [Validators.min(0)]);
    } else {
      control = this.formBuilder.control(data.applyReduction);
    }
    return control;
  }



}
