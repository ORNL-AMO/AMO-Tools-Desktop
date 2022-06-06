import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressedAirDayType, EndUse } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  // selectedEndUseResults: BehaviorSubject<EndUseResults>;
  constructor(private formBuilder: FormBuilder, 
    private convertUnitsService: ConvertUnitsService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
    // this.selectedEndUseResults = new BehaviorSubject<EndUseResults>({averagePercentCapacity: undefined, excessPressure: undefined});
  }

  updateCompressedAirEndUse(endUseForm: FormGroup, compressedAirAssessment: CompressedAirAssessment, settings: Settings): UpdatedEndUseData {
    let updatedEndUse = this.getEndUseFromFrom(endUseForm);
    // this.setEndUseResults(updatedEndUse, compressedAirAssessment, settings);
    updatedEndUse.modifiedDate = new Date();
    let endUseIndex: number = compressedAirAssessment.endUses.findIndex(item => { return item.endUseId == updatedEndUse.endUseId});
    compressedAirAssessment.endUses[endUseIndex] = updatedEndUse;
    return {endUse: updatedEndUse, compressedAirAssessment: compressedAirAssessment};
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

  setEndUseResults(endUse: EndUse, compressedAirAssessment: CompressedAirAssessment, settings: Settings): EndUseResults {
    let baselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(compressedAirAssessment, settings);
    // end use airflow / Average system flow for day type
    let dayTypeAverageAirflow: number = baselineResults.dayTypeResults.find(result => result.dayTypeId === endUse.dayType).averageAirFlow;
    let endUseResults: EndUseResults = {
      averagePercentCapacity: undefined,
      excessPressure: undefined,
    }
    endUseResults.averagePercentCapacity = this.convertUnitsService.roundVal((endUse.averageAirflow / dayTypeAverageAirflow) * 100, 2);
    debugger;
    endUseResults.excessPressure = endUse.measuredPressure - endUse.requiredPressure;
    // this.selectedEndUseResults.next(endUseResults);
    return endUseResults;
  }

  addToAssessment(compressedAirAssessment: CompressedAirAssessment, newEndUse?: EndUse): UpdatedEndUseData {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse();
    }
    newEndUse.modifiedDate = new Date();
    compressedAirAssessment.endUses.push(newEndUse);
    return {
      endUse: newEndUse,
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
      regulated: [endUse.regulated],
      requiredPressure: [endUse.requiredPressure],
      measuredPressure: [endUse.measuredPressure],
      // averageCapacity: [endUse.averageCapacity],
      // excessPressure: [endUse.excessPressure],
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
      regulated: form.controls.regulated.value,
      requiredPressure: form.controls.requiredPressure.value,
      measuredPressure: form.controls.measuredPressure.value,
      // averageCapacity: form.controls.averageCapacity.value,
      // excessPressure: form.controls.excessPressure.value,
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


export interface UpdatedEndUseData {
  endUse: EndUse,
  compressedAirAssessment: CompressedAirAssessment
}

export interface EndUseResults {
  averagePercentCapacity: number
  excessPressure: number,
}