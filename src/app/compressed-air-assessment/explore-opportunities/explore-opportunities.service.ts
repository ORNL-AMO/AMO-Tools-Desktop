import { Injectable } from '@angular/core';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Injectable()
export class ExploreOpportunitiesService {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  getNewModification():Modification {
    return {
      name: 'Modification',
      modificationId: Math.random().toString(36).substr(2, 9),
      flowReallocation: {
        selected: false
      },
      reduceAirLeaks: {
        selected: false
      },
      improveEndUseEfficiency: {
        selected: false
      },
      reduceSystemAirPressure: {
        selected: false
      },
      useUnloadingControls: {
        selected: false
      },
      adjustCascadingSetPoints: {
        selected: false
      },
      useAutomaticSequencer: {
        selected: false
      },
      reduceRuntime: {
        selected: false
      },
      addPrimaryReceiverVolume: {
        selected: false
      }
    }
  }

  saveModification(modification: Modification){
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let modIndex: number = compressedAirAssessment.modifications.findIndex(mod => {return mod.modificationId = modification.modificationId});
    compressedAirAssessment.modifications[modIndex] = modification;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
