import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { PumpProperties } from '../../../pump-inventory';

@Injectable()
export class PumpEquipmentCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromPumpEquipmentProperties(pumpEquipmentProperties: PumpProperties): FormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      pumpType: [pumpEquipmentProperties.pumpType],
      shaftOrientation: [pumpEquipmentProperties.shaftOrientation],
      shaftSealType: [pumpEquipmentProperties.shaftSealType],
      numStages: [pumpEquipmentProperties.numStages, [Validators.required, Validators.min(1)]],
      inletDiameter: [pumpEquipmentProperties.inletDiameter],
      outletDiameter: [pumpEquipmentProperties.outletDiameter],
      maxWorkingPressure: [pumpEquipmentProperties.maxWorkingPressure],
      maxAmbientTemperature: [pumpEquipmentProperties.maxAmbientTemperature],
      maxSuctionLift: [pumpEquipmentProperties.maxSuctionLift],
      displacement: [pumpEquipmentProperties.displacement],
      startingTorque: [pumpEquipmentProperties.startingTorque],
      ratedSpeed: [pumpEquipmentProperties.ratedSpeed],
      impellerDiameter: [pumpEquipmentProperties.impellerDiameter],
      minFlowSize: [pumpEquipmentProperties.minFlowSize],
      pumpSize: [pumpEquipmentProperties.pumpSize],
      designHead: [pumpEquipmentProperties.designHead],
      designFlow: [pumpEquipmentProperties.designFlow],
      designEfficiency: [pumpEquipmentProperties.designEfficiency],
     });
     for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  updatePumpEquipmentPropertiesFromForm(form: FormGroup, pumpEquipmentProperties: PumpProperties): PumpProperties {
    pumpEquipmentProperties.pumpType = form.controls.pumpType.value; 
    pumpEquipmentProperties.shaftOrientation = form.controls.shaftOrientation.value; 
    pumpEquipmentProperties.shaftSealType = form.controls.shaftSealType.value; 
    pumpEquipmentProperties.numStages = form.controls.numStages.value;
    pumpEquipmentProperties.inletDiameter = form.controls.inletDiameter.value; 
    pumpEquipmentProperties.outletDiameter = form.controls.outletDiameter.value;
    pumpEquipmentProperties.maxWorkingPressure = form.controls.maxWorkingPressure.value;
    pumpEquipmentProperties.maxAmbientTemperature = form.controls.maxAmbientTemperature.value; 
    pumpEquipmentProperties.maxSuctionLift = form.controls.maxSuctionLift.value; 
    pumpEquipmentProperties.displacement = form.controls.displacement.value; 
    pumpEquipmentProperties.startingTorque = form.controls.startingTorque.value;
    pumpEquipmentProperties.ratedSpeed = form.controls.ratedSpeed.value; 
    pumpEquipmentProperties.impellerDiameter = form.controls.impellerDiameter.value; 
    pumpEquipmentProperties.minFlowSize = form.controls.minFlowSize.value; 
    pumpEquipmentProperties.pumpSize = form.controls.pumpSize.value; 
    pumpEquipmentProperties.designHead = form.controls.designHead.value;
    pumpEquipmentProperties.designFlow = form.controls.designFlow.value;
    pumpEquipmentProperties.designEfficiency = form.controls.designEfficiency.value;

    return pumpEquipmentProperties;
  }
}
