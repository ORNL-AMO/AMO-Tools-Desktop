import { Injectable } from '@angular/core';
import { CompressedAirInventoryData, EndUse } from '../../compressed-air-inventory';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  constructor(private formBuilder: UntypedFormBuilder,
    private convertUnitsService: ConvertUnitsService) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
  }

  //TODO
  // isEndUseValid(endUse: EndUse, compressedAirInventoryData: CompressedAirInventoryData, settings: Settings): boolean {
  //   let allEndUseFieldsValid: boolean = true;
  //   let dayTypeBaselineResults: BaselineResults = this.getBaselineResults(compressedAirInventoryData, settings);
  //   let currentDayTypeResults: BaselineResult = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId == compressedAirInventoryData.endUseData.endUseDayTypeSetup.selectedDayTypeId);

  //   let isValidEndUse: boolean = this.getEndUseFormFromObj(endUse, compressedAirInventoryData.endUseData.endUses).valid;
  //   if (isValidEndUse) {
  //     let dayTypeEndUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId == compressedAirInventoryData.endUseData.endUseDayTypeSetup.selectedDayTypeId);
  //     if (dayTypeEndUse) {
  //       let isValidDayTypeEndUse: boolean = this.dayTypeUseFormService.getDayTypeUseForm(dayTypeEndUse, currentDayTypeResults.averageAirFlow).valid;
  //       if (!isValidDayTypeEndUse) {
  //         allEndUseFieldsValid = false;
  //       }
  //     }
  //   } else {
  //     allEndUseFieldsValid = false;
  //   }
  //   return allEndUseFieldsValid;
  // }

  getNewEndUse(): EndUse {
    return {
      endUseId: Math.random().toString(36).substr(2, 9),
      endUseName: 'New End Use',
      modifiedDate: new Date(),
      endUseDescription: undefined,
      requiredPressure: undefined,
    }
  }

  getEndUseFormFromObj(endUse: EndUse, endUses: Array<EndUse>): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      endUseName: [endUse.endUseName],
      endUseDescription: [endUse.endUseDescription],
      location: [endUse.location],
      endUseId: [endUse.endUseId],
      requiredPressure: [endUse.requiredPressure, [Validators.required, Validators.min(0)]],
    });
    form = this.setEndUseNameValidators(form, endUses);

    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  setEndUseNameValidators(form: UntypedFormGroup, endUses?: Array<EndUse>) {
    let endUseNameValidators: Array<ValidatorFn> = [Validators.required, this.duplicateNameValidator(form, endUses)];
    form.controls.endUseName.setValidators(endUseNameValidators);
    form.controls.endUseName.updateValueAndValidity();
    return form;
  }

  duplicateNameValidator(currentEndUseForm: UntypedFormGroup, endUses?: Array<EndUse>): ValidatorFn {
    return (valueControl: AbstractControl): { [key: string]: { val: string } } => {
      if (valueControl.value !== '' && valueControl.value !== null) {
        let duplicateNamedUse: EndUse = endUses.find(endUse => {
          return endUse.endUseName === currentEndUseForm.controls.endUseName.value && endUse.endUseId !== currentEndUseForm.controls.endUseId.value;
        });
        try {
          if (duplicateNamedUse === undefined) {
            return undefined;
          }
        }
        catch (e) {
          console.log(e);
          return {
            duplicateNamedUse: { val: duplicateNamedUse.endUseName }
          };
        }
        return {
          duplicateNamedUse: { val: duplicateNamedUse.endUseName }
        };
      }
      else {
        return undefined;
      }
    };
  }

  getEndUseFromFrom(form: UntypedFormGroup): EndUse {
    let selectedEndUse: EndUse = this.selectedEndUse.getValue();
    return {
      endUseId: selectedEndUse.endUseId,
      modifiedDate: selectedEndUse.modifiedDate,
      endUseName: form.controls.endUseName.value,
      requiredPressure: form.controls.requiredPressure.value,
      location: form.controls.location.value,
      endUseDescription: form.controls.endUseDescription.value,
    }
  }

  checkEndUseWarnings(endUse: EndUse): EndUseWarnings {
    return {
      requiredPressure: this.checkRequiredPressure(endUse),
    }
  }


  checkRequiredPressure(endUse: EndUse): string {
    if (endUse.requiredPressure !== undefined && endUse.requiredPressure === 0) {
      return `Required Pressure should be greater than 0`;
    } else {
      return undefined;
    }
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }

  addToInventory(compressedAirInventoryData: CompressedAirInventoryData, settings: Settings, newEndUse?: EndUse): UpdatedEndUseData {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse();
    }
    newEndUse.modifiedDate = new Date();
    if (!compressedAirInventoryData.endUses) {

      compressedAirInventoryData.endUses = []
    }
    compressedAirInventoryData.endUses.push(newEndUse);
    return {
      endUse: newEndUse,
      compressedAirInventoryData: compressedAirInventoryData
    }
  }

  updateCompressedAirEndUse(updatedEndUse: EndUse, compressedAirInventoryData: CompressedAirInventoryData, settings: Settings): UpdatedEndUseData {
    updatedEndUse.modifiedDate = new Date();    
    let endUseIndex: number = compressedAirInventoryData.endUses.findIndex(item => { return item.endUseId == updatedEndUse.endUseId });
    compressedAirInventoryData.endUses[endUseIndex] = updatedEndUse;
    return { endUse: updatedEndUse, compressedAirInventoryData: compressedAirInventoryData };
  }



}

export interface EndUseWarnings {
  requiredPressure: string,
  duplicateNameWarning?: string
}

export interface UpdatedEndUseData {
  endUse: EndUse,
  compressedAirInventoryData: CompressedAirInventoryData
}
