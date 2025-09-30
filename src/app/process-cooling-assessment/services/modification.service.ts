import { computed, inject, Injectable } from '@angular/core';
import { Modification, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { BehaviorSubject, map } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { copyObject, getNewIdString } from '../../shared/helperFunctions';

@Injectable()
export class ModificationService {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private processCoolingSignal = this.processCoolingAssessmentService.processCoolingSignal;
  
  modifications = computed(() => {
    return this.processCoolingSignal().modifications;
  });

  private readonly selectedModificationId = new BehaviorSubject<string>(undefined);
  readonly selectedModificationId$ = this.selectedModificationId.asObservable();

  readonly selectedModification$ = this.selectedModificationId$.pipe(
    map(selectedModificationId => {
      let selectedModification: Modification;
      let processCooling: ProcessCoolingAssessment= this.processCoolingSignal();
      if (selectedModificationId) {
        selectedModification = this.getModificationById(selectedModificationId);
      } else if (processCooling.modifications && processCooling.modifications.length > 0) {
        this.setSelectedModificationId(processCooling.modifications[0].id);
      }
      return selectedModification;
    })
  );
  
  setSelectedModificationId(modificationId: string) {
    this.selectedModificationId.next(modificationId);
  }

  getModificationById(modificationId: string): Modification {
    return this.modifications().find(mod => mod.id === modificationId);
  }

  updateModification(modification: Modification) {
    let processCoolingAssessment: ProcessCoolingAssessment = {...this.processCoolingSignal()};
    const modIndex = processCoolingAssessment.modifications.findIndex(mod => mod.id === modification.id);
    if (modIndex !== -1) {
      const updatedModification = {...modification}
      processCoolingAssessment.modifications[modIndex] = updatedModification;
      console.log('Updating modification:', updatedModification);
      this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
    } 
  }

  addNewModificationToAssessment(name?: string) {
    let processCoolingAssessment: ProcessCoolingAssessment = {...this.processCoolingSignal()};
    let modification: Modification = this.getNewModification();
    modification.name = name ? name : modification.name;
    processCoolingAssessment.modifications.push(modification);
    this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
    this.setSelectedModificationId(modification.id);
  }

  deleteAssessmentModification(id: string) {
    let processCoolingAssessment: ProcessCoolingAssessment = {...this.processCoolingSignal()};
    if (id) {
      processCoolingAssessment.modifications = processCoolingAssessment.modifications.filter(mod => mod.id !== id);
    }
    this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
  }

  copyModification(id: string) {
    let processCoolingAssessment: ProcessCoolingAssessment = {...this.processCoolingSignal()};
    let modificationToCopy = this.getModificationById(id);
    if (modificationToCopy) {
      let modificationCopy: Modification = copyObject(modificationToCopy);
      let nameExists = this.modifications().filter(mod => { return mod.name.includes(modificationCopy.name); });
      if (nameExists) {
        modificationCopy.name = modificationCopy.name + '(' + nameExists.length + ')';
      }
      modificationCopy.id = getNewIdString();
      processCoolingAssessment.modifications.push(modificationCopy);
      this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
      this.setSelectedModificationId(modificationCopy.id);
    }
  }
    
  getNewModification(): Modification {
    return {
      name: 'Modification',
      id: getNewIdString(),
      notes: undefined,
      increaseChilledWaterTemp: undefined,
      decreaseCondenserWaterTemp: undefined,
      useSlidingCondenserWaterTemp: undefined,
      applyVariableSpeedControls: undefined,
      replaceChillers: undefined,
      upgradeCoolingTowerFans: undefined,
      useFreeCooling: undefined,
      replaceRefrigerant: undefined,
      installVSDOnCentrifugalCompressor: undefined,
    }
  }

  // todo
  getModifiedProcessCoolingAssessment(processCoolingAssessment: ProcessCoolingAssessment, modification: Modification): ProcessCoolingAssessment {
    return {
      ...processCoolingAssessment,
    };
  }

  getEEMBadges(modification: Modification): Array<string> {
    let badges: Array<string> = new Array();
    if (modification.increaseChilledWaterTemp?.useOpportunity) {
      badges.push('Increase Chilled Water Temperature');
    }
    if (modification.decreaseCondenserWaterTemp?.useOpportunity) {
      badges.push('Decrease Condenser Water Temperature');
    }
    if (modification.useSlidingCondenserWaterTemp?.useOpportunity) {
      badges.push('Use Sliding Condenser Water Temperature');
    }
    if (modification.applyVariableSpeedControls?.useOpportunity) {
      badges.push('Apply Variable Speed Controls');
    }
    if (modification.replaceChillers?.useOpportunity) {
      badges.push('Replace Chillers');
    }
    if (modification.upgradeCoolingTowerFans?.useOpportunity) {
      badges.push('Upgrade Cooling Tower Fans');
    }
    if (modification.useFreeCooling?.useOpportunity) {
      badges.push('Use Free Cooling');
    }
    if (modification.replaceRefrigerant?.useOpportunity) {
      badges.push('Replace Refrigerant');
    }
    if (modification.installVSDOnCentrifugalCompressor?.useOpportunity) {
      badges.push('Install VSD on Centrifugal Compressor');
    }

    return badges;
  }
}
