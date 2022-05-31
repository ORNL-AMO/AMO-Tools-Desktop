import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, EndUse } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  endUses: BehaviorSubject<Array<EndUse>>;
  constructor(private formBuilder: FormBuilder) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
    this.endUses = new BehaviorSubject<Array<EndUse>>(undefined);
  }

  getEndUseInformationForm(name: string, description: string) {
    let form: FormGroup = this.formBuilder.group({
      name: [name, Validators.required],
      description: [description]
    });
    return form;
  }

  updateEndUseInformation(endUse: EndUse) {
    // let endUse: EndUse = this.selectedEndUse.getValue();
    endUse.modifiedDate = new Date();
    // endUse.endUseName = name;
    // endUse.endUseDescription = description;
    this.selectedEndUse.next(endUse)
  }

  getNewEndUse(): EndUse {
    return {
      endUseId: Math.random().toString(36).substr(2, 9),
      endUseName: 'New End Use',
      modifiedDate: new Date(),
      endUseDescription: undefined,
      dayType: undefined,
      dayTypeLeakRate: undefined,
      location: undefined,
      averageAirflow: undefined,
      averageCapacity: undefined,
      regulated: false,
      requiredPressure: undefined,
      excessPressure: undefined,
      measuredPressure: undefined,
    }
  }

  addToAssessment(compressedAirAssessment: CompressedAirAssessment, newEndUse?: EndUse) {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse();
    }
    newEndUse.modifiedDate = new Date();
    compressedAirAssessment.endUses.push(newEndUse);
    return {
      newEndUse: newEndUse,
      compressedAirAssessment: compressedAirAssessment
    }
  }

  
  getEndUseFormFromObj(endUse: EndUse): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      endUseName: [endUse.endUseName],
      endUseDescription: [endUse.endUseDescription],
      dayType: [endUse.dayType],
      dayTypeLeakRate: [endUse.dayTypeLeakRate],
      location: [endUse.location],
      averageAirflow: [endUse.averageAirflow],
      averageCapacity: [endUse.averageCapacity],
      regulated: [endUse.regulated],
      requiredPressure: [endUse.requiredPressure],
      excessPressure: [endUse.excessPressure],
      measuredPressure: [endUse.measuredPressure],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getEndUseFromFrom(form: FormGroup): EndUse {
    let selectedEndUse: EndUse = this.selectedEndUse.getValue();

    return {
      endUseId: selectedEndUse.endUseId,
      modifiedDate: selectedEndUse.modifiedDate,
      endUseName: form.controls.endUseName.value,
      endUseDescription: form.controls.endUseDescription.value,
      dayType: form.controls.dayType.value,
      dayTypeLeakRate: form.controls.dayTypeLeakRate.value,
      location: form.controls.location.value,
      averageAirflow: form.controls.averageAirflow.value,
      averageCapacity: form.controls.averageCapacity.value,
      regulated: form.controls.regulated.value,
      requiredPressure: form.controls.requiredPressure.value,
      excessPressure: form.controls.excessPressure.value,
      measuredPressure: form.controls.measuredPressure.value,
    }
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

}
