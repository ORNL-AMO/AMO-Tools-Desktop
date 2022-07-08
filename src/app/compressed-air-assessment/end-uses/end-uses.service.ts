import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUse, ProfileSummary } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { BaselineResult, BaselineResults, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';

@Injectable()
export class EndUsesService {

  selectedEndUse: BehaviorSubject<EndUse>;
  selectedDayTypeEndUse: BehaviorSubject<DayTypeEndUse>;
  constructor(private formBuilder: FormBuilder,
    private compressedAirResultsService: CompressedAirAssessmentResultsService,
    private convertUnitsService: ConvertUnitsService) {
    this.selectedEndUse = new BehaviorSubject<EndUse>(undefined);
    this.selectedDayTypeEndUse = new BehaviorSubject<DayTypeEndUse>(undefined);
  }

  updateCompressedAirEndUse(updatedEndUse: EndUse, compressedAirAssessment: CompressedAirAssessment, updatedDayTypeEndUse?: DayTypeEndUse): UpdatedEndUseData {
    updatedEndUse.modifiedDate = new Date();
    if (updatedDayTypeEndUse) {
      let updatedIndex: number = updatedEndUse.dayTypeEndUses.findIndex(dayTypeEndUse => dayTypeEndUse.dayTypeId == updatedDayTypeEndUse.dayTypeId);
      Object.assign(updatedEndUse.dayTypeEndUses[updatedIndex], updatedDayTypeEndUse);
    }
    let endUseIndex: number = compressedAirAssessment.endUses.findIndex(item => { return item.endUseId == updatedEndUse.endUseId});
    compressedAirAssessment.endUses[endUseIndex] = updatedEndUse;
    return {endUse: updatedEndUse, compressedAirAssessment: compressedAirAssessment};
  }

  getNewEndUse(compressedAirAssessment: CompressedAirAssessment): EndUse {
    return {
      endUseId: Math.random().toString(36).substr(2, 9),
      endUseName: 'New End Use',
      modifiedDate: new Date(),
      endUseDescription: undefined,
      selectedDayTypeId: compressedAirAssessment.compressedAirDayTypes[0].dayTypeId,
      dayTypeEndUses: [this.getDefaultDayTypeEndUse(compressedAirAssessment.compressedAirDayTypes[0].dayTypeId)]
    }
  }

  getDefaultDayTypeEndUse(dayTypeId: string) {
    return {
      dayTypeId: dayTypeId,
      dayTypeLeakRate: undefined,
      averageAirflow: undefined,
      averageCapacity: undefined,
      regulated: undefined,
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

  getSingleDayTypeEndUseResults(dayTypeEndUse: DayTypeEndUse, dayTypeBaselineResults: BaselineResult): EndUseResults {
    // end use airflow / Average system flow for day type
    let dayTypeAverageAirflow: number = dayTypeBaselineResults.averageAirFlow;
    let dayTypeEndUseResult: EndUseResults = {
      averagePercentCapacity: this.convertUnitsService.roundVal((dayTypeEndUse.averageAirflow / dayTypeAverageAirflow) * 100, 2),
      excessPressure: dayTypeEndUse.measuredPressure - dayTypeEndUse.requiredPressure,
    }
    dayTypeEndUseResult.averagePercentCapacity = this.convertUnitsService.roundVal((dayTypeEndUse.averageAirflow / dayTypeAverageAirflow) * 100, 2);
    dayTypeEndUseResult.excessPressure = dayTypeEndUse.measuredPressure - dayTypeEndUse.requiredPressure;
    return dayTypeEndUseResult;
  }

  addToAssessment(compressedAirAssessment: CompressedAirAssessment, newEndUse?: EndUse): UpdatedEndUseData {
    if (!newEndUse) {
      newEndUse = this.getNewEndUse(compressedAirAssessment);
    }
    newEndUse.modifiedDate = new Date();
    if(!compressedAirAssessment.endUses) {
      compressedAirAssessment.endUses = []
    }
    compressedAirAssessment.endUses.push(newEndUse);
    return {
      endUse: newEndUse,
      compressedAirAssessment: compressedAirAssessment
    }
  }


  getEndUseEnergyData(compressedAirAssessment: CompressedAirAssessment, selectedDayType: CompressedAirDayType, dayTypeBaselineResults: BaselineResults): Array<EndUseEnergyData> {
    let endUseEnergyData = new Array<EndUseEnergyData>();
    // let dayTypeEndUses: Array<DayTypeEndUse> = [];
    if (selectedDayType) {
      let currentDayTypeResults: BaselineResult = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId == selectedDayType.dayTypeId);
      compressedAirAssessment.endUses.forEach((endUse: EndUse) => {
        let dayTypeEndUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId == selectedDayType.dayTypeId);
        let dayTypeEndUseResult: EndUseResults = this.getSingleDayTypeEndUseResults(dayTypeEndUse, currentDayTypeResults);
          endUseEnergyData.push({
            dayTypeAverageAirflowPercent: dayTypeEndUseResult.averagePercentCapacity,
            dayTypeAverageAirFlow: dayTypeEndUse.averageAirflow,
            endUseName: endUse.endUseName,
            color: undefined
          });
      });      
    } else {
      // For all day types
      compressedAirAssessment.endUses.forEach((endUse: EndUse) => {
       endUse.dayTypeEndUses.forEach(dayTypeEndUse => {
        let currentDayTypeResults: BaselineResult = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId == dayTypeEndUse.dayTypeId);
          let dayTypeEndUseResult: EndUseResults = this.getSingleDayTypeEndUseResults(dayTypeEndUse, currentDayTypeResults);
          endUseEnergyData.push({
            dayTypeAverageAirflowPercent: dayTypeEndUseResult.averagePercentCapacity,
            dayTypeAverageAirFlow: dayTypeEndUse.averageAirflow,
            endUseName: endUse.endUseName,
            color: undefined
          });
        });
      });  
    }
    
    return endUseEnergyData;
  }

  getEndUseFormFromObj(endUse: EndUse): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      endUseName: [endUse.endUseName],
      endUseDescription: [endUse.endUseDescription],
      location: [endUse.location],
      selectedDayTypeId: [endUse.selectedDayTypeId],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getEndUseFromFrom(form: FormGroup): EndUse {
    let selectedEndUse: EndUse = this.selectedEndUse.getValue();
    // TODO set daytypeEndUses?
    return {
      endUseId: selectedEndUse.endUseId,
      modifiedDate: selectedEndUse.modifiedDate,
      endUseName: form.controls.endUseName.value,
      selectedDayTypeId: form.controls.selectedDayTypeId.value,
      location: form.controls.location.value,
      endUseDescription: form.controls.endUseDescription.value,
    }
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

    // getDayTypeBaselineResults(compressedAirAssessment: CompressedAirAssessment, selectedDayType: CompressedAirDayType, settings: Settings): BaselineResults {
  //   let dayTypeProfileSummaries = [];
  //   let profileSumary: Array<ProfileSummary> = this.compressedAirResultsService.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, selectedDayType, settings)
  //   dayTypeProfileSummaries.push({
  //     dayTypeId: selectedDayType.dayTypeId,
  //     profileSummary: profileSumary
  //   });
  //   let dayTypeBaselineResults: BaselineResults = this.compressedAirResultsService.calculateBaselineResults(compressedAirAssessment, settings, dayTypeProfileSummaries);
  //   return dayTypeBaselineResults;
  // }

  
  // getAllDayTypeBaselineResults(compressedAirAssessment: CompressedAirAssessment, settings: Settings): BaselineResults {
  //   let dayTypeProfileSummaries = [];
  //   compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
  //     let profileSumary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings)
  //     dayTypeProfileSummaries.push({
  //       dayTypeId: dayType.dayTypeId,
  //       profileSummary: profileSumary
  //     });
  //   });
  //   let dayTypeBaselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(compressedAirAssessment, settings, dayTypeProfileSummaries);
  //   return dayTypeBaselineResults;
  // }

    // getAllDayTypeEndUseResults(endUse: EndUse, compressedAirAssessment: CompressedAirAssessment, settings: Settings, dayTypeBaselineResults?: BaselineResults): Array<EndUseResults> {
  //   let endUseResults: Array<EndUseResults> = [];
  //   endUse.dayTypeEndUses.forEach(dayTypeEndUse => {
  //     let dayTypeProfileSummaries = [];
  //     compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
  //       let profileSumary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings)
  //       dayTypeProfileSummaries.push({
  //         dayTypeId: dayType.dayTypeId,
  //         profileSummary: profileSumary
  //       });
  //     });
  //     let dayTypeBaselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(compressedAirAssessment, settings, dayTypeProfileSummaries);
  
  //     // end use airflow / Average system flow for day type
  //     let dayTypeAverageAirflow: number = dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId === dayTypeEndUse.dayTypeId).averageAirFlow;
  //     let dayTypeEndUseResult: EndUseResults = {
  //       averagePercentCapacity: this.convertUnitsService.roundVal((dayTypeEndUse.averageAirflow / dayTypeAverageAirflow) * 100, 2),
  //       excessPressure: dayTypeEndUse.measuredPressure - dayTypeEndUse.requiredPressure,
  //     }
  //     dayTypeEndUseResult.averagePercentCapacity = this.convertUnitsService.roundVal((dayTypeEndUse.averageAirflow / dayTypeAverageAirflow) * 100, 2);
  //     dayTypeEndUseResult.excessPressure = dayTypeEndUse.measuredPressure - dayTypeEndUse.requiredPressure;
  //     endUseResults.push(dayTypeEndUseResult);
  //   });
  //   debugger;
  //   return endUseResults;
  // }
}


export interface UpdatedEndUseData {
  endUse: EndUse,
  compressedAirAssessment: CompressedAirAssessment
}

export interface EndUseResults {
  averagePercentCapacity: number
  excessPressure: number,
}

export interface EndUseEnergyData {
  dayTypeAverageAirFlow: number, 
  dayTypeAverageAirflowPercent: number,
  endUseName: string, 
  color: string 
}