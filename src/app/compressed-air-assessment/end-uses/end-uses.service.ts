import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, DayTypeAirflowTotals, DayTypeEndUse, EndUse, EndUseDayTypeSetup, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { BaselineResult, BaselineResults, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { DayTypeSetupService } from './day-type-setup-form/day-type-setup.service';
import { DayTypeUseFormService } from './day-type-use-form/day-type-use-form.service';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  selectedDayTypeEndUse: BehaviorSubject<DayTypeEndUse>;
  constructor(private formBuilder: FormBuilder,
    private compressedAirResultsService: CompressedAirAssessmentResultsService,
    private dayTypeSetupService: DayTypeSetupService, 
    private dayTypeUseFormService: DayTypeUseFormService,
    private convertUnitsService: ConvertUnitsService) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
    this.selectedDayTypeEndUse = new BehaviorSubject<DayTypeEndUse>(undefined);
  }

  updateCompressedAirEndUse(updatedEndUse: EndUse, compressedAirAssessment: CompressedAirAssessment, settings: Settings, updatedDayTypeEndUse?: DayTypeEndUse): UpdatedEndUseData {
    updatedEndUse.modifiedDate = new Date();
    if (updatedDayTypeEndUse) {
      let updatedIndex: number = updatedEndUse.dayTypeEndUses.findIndex(dayTypeEndUse => dayTypeEndUse.dayTypeId == updatedDayTypeEndUse.dayTypeId);
      Object.assign(updatedEndUse.dayTypeEndUses[updatedIndex], updatedDayTypeEndUse);
    } 
    let endUseIndex: number = compressedAirAssessment.endUseData.endUses.findIndex(item => { return item.endUseId == updatedEndUse.endUseId});
    compressedAirAssessment.endUseData.endUses[endUseIndex] = updatedEndUse;
    compressedAirAssessment.endUseData.dayTypeAirFlowTotals = this.getDayTypeAirflowTotals(compressedAirAssessment, compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId, settings);
    return {endUse: updatedEndUse, compressedAirAssessment: compressedAirAssessment};
  }

  // TODO cache these somewhere - update when daytypesetup changes
  getDayTypeAirflowTotals(compressedAirAssessment: CompressedAirAssessment, selectedDayTypeId: string, settings: Settings): DayTypeAirflowTotals {
    let baselineResults: BaselineResults = this.getBaselineResults(compressedAirAssessment, settings);
    let daytypeResult: BaselineResult = baselineResults.dayTypeResults.find(dayTypeResult => dayTypeResult.dayTypeId === selectedDayTypeId);
    let totalDayTypeAverageAirflow: number = 0;
    if (daytypeResult) {
      totalDayTypeAverageAirflow = this.convertUnitsService.roundVal(daytypeResult.averageAirFlow, 1);
    }
    let totalEndUseAirflow: number = 0;
    compressedAirAssessment.endUseData.endUses.forEach((endUse: EndUse) => {
      let dayTypeEndUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId == selectedDayTypeId);
      if (dayTypeEndUse) {
        totalEndUseAirflow += dayTypeEndUse.averageAirflow;
      }
    }); 
    let endUseDayTypeSetup: EndUseDayTypeSetup = this.dayTypeSetupService.endUseDayTypeSetup.getValue();
    if (endUseDayTypeSetup) {
      let dayTypeLeakRateData = endUseDayTypeSetup.dayTypeLeakRates.find(leakRate => leakRate.dayTypeId === selectedDayTypeId);
      if (dayTypeLeakRateData) {
        totalEndUseAirflow += dayTypeLeakRateData.dayTypeLeakRate;
      }
    }

    let airflowDiff = totalDayTypeAverageAirflow - totalEndUseAirflow;
    let unaccountedAirflow: number;
    let exceededAirflow: number;
    if (airflowDiff > 0) {
      unaccountedAirflow = this.convertUnitsService.roundVal(airflowDiff, 1)
    } else if (airflowDiff < 0) {
      exceededAirflow = this.convertUnitsService.roundVal(Math.abs(airflowDiff), 1)
    }

    return {
      unaccountedAirflow: unaccountedAirflow,
      exceededAirflow: exceededAirflow,
      unaccountedAirflowPercent: this.convertUnitsService.roundVal((unaccountedAirflow / totalDayTypeAverageAirflow) * 100, 1),
      exceededAirflowPercent: this.convertUnitsService.roundVal((exceededAirflow / totalDayTypeAverageAirflow) * 100, 1),
      totalDayTypeEndUseAirflow: this.convertUnitsService.roundVal(totalEndUseAirflow, 1),
      totalDayTypeEndUseAirflowPercent: this.convertUnitsService.roundVal((totalEndUseAirflow / totalDayTypeAverageAirflow) * 100, 1),
      totalDayTypeAverageAirflow: this.convertUnitsService.roundVal(totalDayTypeAverageAirflow, 1)
    };
  }

  isEndUseValid(endUse: EndUse, compressedAirAssessment: CompressedAirAssessment, settings: Settings): boolean {
    let allEndUseFieldsValid: boolean = true;
    let dayTypeBaselineResults: BaselineResults = this.getBaselineResults(compressedAirAssessment, settings);
    let currentDayTypeResults: BaselineResult = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId == compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId);
    
    let isValidEndUse: boolean = this.getEndUseFormFromObj(endUse, compressedAirAssessment.endUseData.endUses).valid;
    if (isValidEndUse) {
      let dayTypeEndUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId == compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId);
      if (dayTypeEndUse) {
        let isValidDayTypeEndUse: boolean = this.dayTypeUseFormService.getDayTypeUseForm(dayTypeEndUse, currentDayTypeResults.averageAirFlow).valid;
        if (!isValidDayTypeEndUse) {
          allEndUseFieldsValid = false;
        }
      }
    } else {
      allEndUseFieldsValid = false;
    }
    return allEndUseFieldsValid;
  }

  getNewEndUse(compressedAirAssessment: CompressedAirAssessment): EndUse {
    return {
      endUseId: Math.random().toString(36).substr(2, 9),
      endUseName: 'New End Use',
      modifiedDate: new Date(),
      endUseDescription: undefined,
      requiredPressure: undefined,
      dayTypeEndUses: [this.getDefaultDayTypeEndUse(compressedAirAssessment.compressedAirDayTypes[0].dayTypeId)]
    }
  }

  getDefaultDayTypeEndUse(dayTypeId: string) {
    return {
      dayTypeId: dayTypeId,
      dayTypeLeakRate: 0,
      averageAirflow: undefined,
      averageCapacity: undefined,
      regulated: false,
      requiredPressure: undefined,
      excessPressure: undefined,
      measuredPressure: undefined,
    }
  }


  getBaselineResults(compressedAirAssessment: CompressedAirAssessment, settings: Settings): BaselineResults {
    let dayTypeProfileSummaries = [];
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      let profileSumary: Array<ProfileSummary> = this.compressedAirResultsService.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings)
      dayTypeProfileSummaries.push({
        dayTypeId: dayType.dayTypeId,
        profileSummary: profileSumary
      });
    });
    return this.compressedAirResultsService.calculateBaselineResults(compressedAirAssessment, settings, dayTypeProfileSummaries);
  }

  getSingleDayTypeEndUseResults(dayTypeEndUse: DayTypeEndUse, dayTypeBaselineResults: BaselineResult, endUse: EndUse): EndUseResults {
    // end use airflow / Average system flow for day type
    let dayTypeEndUseResult: EndUseResults = {
      averagePercentCapacity: undefined,
      excessPressure: undefined,
    }
    let dayTypeAverageAirflow: number = dayTypeBaselineResults.averageAirFlow;
    if (dayTypeAverageAirflow) {
      let averagePercentCapacity = this.convertUnitsService.roundVal((dayTypeEndUse.averageAirflow / dayTypeAverageAirflow) * 100, 2);
      let excessPressure = dayTypeEndUse.measuredPressure - endUse.requiredPressure; 
      dayTypeEndUseResult.averagePercentCapacity = averagePercentCapacity
      dayTypeEndUseResult.excessPressure = excessPressure
    }
    return dayTypeEndUseResult;
  }

  addToAssessment(compressedAirAssessment: CompressedAirAssessment, settings: Settings, newEndUse?: EndUse): UpdatedEndUseData {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse(compressedAirAssessment);
    }
    newEndUse.modifiedDate = new Date();
    if(!compressedAirAssessment.endUseData.endUses) {
      compressedAirAssessment.endUseData.endUses = []
    }
    compressedAirAssessment.endUseData.endUses.push(newEndUse);
    compressedAirAssessment.endUseData.dayTypeAirFlowTotals = this.getDayTypeAirflowTotals(compressedAirAssessment, compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId, settings);
    return {
      endUse: newEndUse,
      compressedAirAssessment: compressedAirAssessment
    }
  }


  getEndUseEnergyData(compressedAirAssessment: CompressedAirAssessment, endUseDayTypeSetup: EndUseDayTypeSetup, dayTypeBaselineResults: BaselineResults): EndUseEnergy {
    let endUseEnergyData = new Array<EndUseEnergyData>();
    let hasInvalidEndUse: boolean = true;
    if (endUseDayTypeSetup.selectedDayTypeId) {
      let currentDayTypeResults: BaselineResult = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId == endUseDayTypeSetup.selectedDayTypeId);
      hasInvalidEndUse = compressedAirAssessment.endUseData.endUses.some((endUse: EndUse) => {
        let isValidEndUse: boolean = this.getEndUseFormFromObj(endUse, compressedAirAssessment.endUseData.endUses).valid;
        if (isValidEndUse) {
          let dayTypeEndUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId == endUseDayTypeSetup.selectedDayTypeId);
          if (dayTypeEndUse) {
            let isValidDayTypeEndUse: boolean = this.dayTypeUseFormService.getDayTypeUseForm(dayTypeEndUse, currentDayTypeResults.averageAirFlow).valid;
            if (isValidDayTypeEndUse) {
              let dayTypeEndUseResult: EndUseResults = this.getSingleDayTypeEndUseResults(dayTypeEndUse, currentDayTypeResults, endUse);
              endUseEnergyData.push({
                dayTypeAverageAirflowPercent: dayTypeEndUseResult.averagePercentCapacity,
                dayTypeAverageAirFlow: dayTypeEndUse.averageAirflow,
                endUseName: endUse.endUseName,
                endUseId: endUse.endUseId,
                color: undefined
              });
            } else {
              return true;
            }
          }
        } else {
          return true;
        }
      });


      let dayTypeLeakRate: number = endUseDayTypeSetup.dayTypeLeakRates.find(leakRate => leakRate.dayTypeId === endUseDayTypeSetup.selectedDayTypeId).dayTypeLeakRate;
      if (dayTypeLeakRate) {
        compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeEndUseAirflow;
        let leakRatePercent: number = (dayTypeLeakRate / compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeAverageAirflow) * 100;
        endUseEnergyData.unshift({
          dayTypeAverageAirflowPercent: leakRatePercent,
          dayTypeAverageAirFlow: dayTypeLeakRate,
          endUseName: 'Day Type Leak Rate',
          endUseId: 'dayTypeLeakRate',
          color: 'rgb(255, 0, 0)'
        });
      }
    }

    return {hasValidEndUses: !hasInvalidEndUse, endUseEnergyData};
  }

  getEndUseFormFromObj(endUse: EndUse, endUses: Array<EndUse>): FormGroup {
    let form: FormGroup = this.formBuilder.group({
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

  setEndUseNameValidators(form: FormGroup, endUses?: Array<EndUse>) {
    let endUseNameValidators: Array<ValidatorFn> = [Validators.required, this.duplicateNameValidator(form, endUses)];
    form.controls.endUseName.setValidators(endUseNameValidators);
    form.controls.endUseName.updateValueAndValidity();
    return form;
 }


 duplicateNameValidator(currentEndUseForm: FormGroup, endUses?: Array<EndUse>): ValidatorFn {
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

  getEndUseFromFrom(form: FormGroup): EndUse {
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

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}


export interface UpdatedEndUseData {
  endUse: EndUse,
  compressedAirAssessment: CompressedAirAssessment
}

export interface EndUseWarnings {
  requiredPressure: string,
}

export interface EndUseResults {
  averagePercentCapacity: number
  excessPressure: number,
}

export interface EndUseEnergyData {
  dayTypeAverageAirFlow: number, 
  dayTypeAverageAirflowPercent: number,
  endUseName: string, 
  endUseId: string, 
  color: string 
}

export interface EndUseWarnings {
  requiredPressure: string,
  duplicateNameWarning?: string
}

export interface EndUseEnergy {
  hasValidEndUses: boolean, 
  endUseEnergyData: Array<EndUseEnergyData>
}