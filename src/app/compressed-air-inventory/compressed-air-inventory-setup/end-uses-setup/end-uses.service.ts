import { Injectable } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirInventorySystem, EndUse } from '../../compressed-air-inventory';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog/compressed-air-catalog.service';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  constructor(private formBuilder: UntypedFormBuilder,
    private convertUnitsService: ConvertUnitsService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirCatalogService: CompressedAirCatalogService) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
  }

  isEndUseValid(endUse: EndUse, system: CompressedAirInventorySystem): boolean {
    let allEndUseFieldsValid: boolean = true;
    let isValidEndUse: boolean = this.getEndUseFormFromObj(endUse, system.endUses).valid;
    if (isValidEndUse) {
      if (endUse.averageMeasuredPressure && endUse.averageRequiredPressure) {
        if (system.knownTotalAirflow <= endUse.averageAirflow) {
          allEndUseFieldsValid = false;
        }
      }
    } else {
      allEndUseFieldsValid = false;
    }
    return allEndUseFieldsValid;
  }

  getNewEndUse(): EndUse {
    return {
      endUseId: Math.random().toString(36).substr(2, 9),
      endUseName: 'New End Use',
      modifiedDate: new Date(),
      endUseDescription: undefined,
      averageRequiredPressure: undefined,
      averageAirflow: undefined,
      averagePercentCapacity: undefined,
      regulated: false,
      averageMeasuredPressure: undefined,
      averageExcessPressure: undefined,
    }
  }

  getEndUseFormFromObj(endUse: EndUse, endUses: Array<EndUse>): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      endUseName: [endUse.endUseName, [Validators.required]],
      endUseDescription: [endUse.endUseDescription],
      location: [endUse.location],
      endUseId: [endUse.endUseId],
      averageRequiredPressure: [endUse.averageRequiredPressure, [Validators.required, Validators.min(0)]],
      averageAirflow: [endUse.averageAirflow, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      averagePercentCapacity: [endUse.averagePercentCapacity],
      regulated: [endUse.regulated],
      averageMeasuredPressure: [endUse.averageMeasuredPressure, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      averageExcessPressure: [endUse.averageExcessPressure],

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
      averageRequiredPressure: form.controls.averageRequiredPressure.value,
      location: form.controls.location.value,
      endUseDescription: form.controls.endUseDescription.value,
      averageAirflow: form.controls.averageAirflow.value,
      averagePercentCapacity: form.controls.averagePercentCapacity.value,
      regulated: form.controls.regulated.value,
      averageMeasuredPressure: form.controls.averageMeasuredPressure.value,
      averageExcessPressure: form.controls.averageExcessPressure.value,
    }
  }

  checkEndUseWarnings(endUse: EndUse): EndUseWarnings {
    return {
      averageRequiredPressure: this.checkRequiredPressure(endUse),
      averageMeasuredPressure: this.checkMeasuredPressure(endUse)
    }
  }


  checkRequiredPressure(endUse: EndUse): string {
    if (endUse.averageRequiredPressure !== undefined && endUse.averageRequiredPressure === 0) {
      return `Required Pressure should be greater than 0`;
    } else {
      return undefined;
    }
  }

  checkMeasuredPressure(endUse: EndUse): string {
    if (endUse.averageMeasuredPressure && endUse.averageMeasuredPressure <= endUse.averageRequiredPressure) {
      return `Measured Pressure should be greater than Required Pressure (${endUse.averageRequiredPressure})`;
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

  addToInventory(compressedAirInventoryData: CompressedAirInventoryData, selectedEndUses: Array<EndUse>, newEndUse?: EndUse): UpdatedEndUseData {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse();
    }
    newEndUse.modifiedDate = new Date();
    if (!selectedEndUses) {

      selectedEndUses = []
    }
    let selectedSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    let systemIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedSystemId });
    compressedAirInventoryData.systems[systemIndex].endUses.push(newEndUse);
    return {
      endUse: newEndUse,
      compressedAirInventoryData: compressedAirInventoryData
    }
  }

  updateCompressedAirEndUse(updatedEndUse: EndUse, compressedAirInventoryData: CompressedAirInventoryData, settings: Settings): UpdatedEndUseData {
    updatedEndUse.modifiedDate = new Date();

    let selectedSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    let systemIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedSystemId });

    let endUseIndex: number = compressedAirInventoryData.systems[systemIndex].endUses.findIndex(item => { return item.endUseId == updatedEndUse.endUseId });
    compressedAirInventoryData.systems[systemIndex].endUses[endUseIndex] = updatedEndUse;
    return { endUse: updatedEndUse, compressedAirInventoryData: compressedAirInventoryData };
  }

  getEndUseResults(endUse: EndUse, compressedAirInventoryData: CompressedAirInventoryData): EndUseResults {
    let selectedSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    let systemIndex: number = compressedAirInventoryData.systems.findIndex(system => { return system.id == selectedSystemId });

    let endUses: Array<EndUse> = this.compressedAirInventoryService.compressedAirInventoryData.getValue().systems[systemIndex].endUses;

    let selectedSystem: CompressedAirInventorySystem;
    if (selectedSystemId) {
      selectedSystem = compressedAirInventoryData.systems.find(system => { return system.id == selectedSystemId });
    }

    // end use airflow / Average system flow for day type
    let dayTypeEndUseResult: EndUseResults = {
      averagePercentCapacity: undefined,
      averageExcessPressure: undefined,
    }
    let sumEndUsesAirflow: number = 0;
    endUses.forEach(use => {
      sumEndUsesAirflow += use.averageAirflow;
    });
    if (sumEndUsesAirflow) {
      let averagePercentCapacity = this.convertUnitsService.roundVal((endUse.averageAirflow / selectedSystem.knownTotalAirflow) * 100, 2);
      let excessPressure = endUse.averageMeasuredPressure - endUse.averageRequiredPressure;
      dayTypeEndUseResult.averagePercentCapacity = averagePercentCapacity;
      dayTypeEndUseResult.averageExcessPressure = excessPressure;
    }
    return dayTypeEndUseResult;
  }

  getEndUseEnergyData(system: CompressedAirInventorySystem): EndUseEnergy {
    let endUseEnergyData = new Array<EndUseEnergyData>();
    let hasInvalidEndUse: boolean = true;
    if (system.endUses) {
      hasInvalidEndUse = system.endUses.some((endUse: EndUse) => {
        let isValidEndUse: boolean = this.getEndUseFormFromObj(endUse, system.endUses).valid;
        if (isValidEndUse) {
          let endUseResult: EndUseResults = this.getSingleEndUseResults(system, endUse);
          endUseEnergyData.push({
            averageAirflowPercent: endUseResult.averagePercentCapacity,
            averageAirFlow: endUse.averageAirflow,
            endUseName: endUse.endUseName,
            endUseId: endUse.endUseId,
            color: undefined
          });
        } else {
          return true;
        }
      });

      let dayTypeLeakRate: number = system.averageLeakRate;
      if (dayTypeLeakRate) {
        let leakRatePercent: number = (dayTypeLeakRate / system.knownTotalAirflow) * 100;
        endUseEnergyData.unshift({
          averageAirflowPercent: leakRatePercent,
          averageAirFlow: dayTypeLeakRate,
          endUseName: 'Day Type Leak Rate',
          endUseId: 'dayTypeLeakRate',
          color: 'rgb(255, 0, 0)'
        });
      }
    }

    return { hasValidEndUses: !hasInvalidEndUse, endUseEnergyData: endUseEnergyData };
  }

  getSingleEndUseResults(system: CompressedAirInventorySystem, endUse: EndUse): EndUseResults {
    // end use airflow / Average system flow for day type
    let endUseResult: EndUseResults = {
      averagePercentCapacity: undefined,
      averageExcessPressure: undefined,
    }
    let dayTypeAverageAirflow: number = system.knownTotalAirflow;
    if (dayTypeAverageAirflow) {
      let averagePercentCapacity = this.convertUnitsService.roundVal((endUse.averageAirflow / dayTypeAverageAirflow) * 100, 2);
      let excessPressure = endUse.averageMeasuredPressure - endUse.averageRequiredPressure;
      endUseResult.averagePercentCapacity = averagePercentCapacity
      endUseResult.averageExcessPressure = excessPressure
    }
    return endUseResult;
  }



}

export interface EndUseWarnings {
  averageRequiredPressure: string,
  averageMeasuredPressure: string,
  duplicateNameWarning?: string
}

export interface UpdatedEndUseData {
  endUse: EndUse,
  compressedAirInventoryData: CompressedAirInventoryData
}

export interface EndUseResults {
  averagePercentCapacity: number
  averageExcessPressure: number,
}

export interface EndUseEnergyData {
  averageAirFlow: number,
  averageAirflowPercent: number,
  endUseName: string,
  endUseId: string,
  color: string
}

export interface EndUseEnergy {
  hasValidEndUses: boolean,
  endUseEnergyData: Array<EndUseEnergyData>
}
