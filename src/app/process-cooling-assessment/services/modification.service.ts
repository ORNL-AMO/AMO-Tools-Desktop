import { computed, inject, Injectable } from '@angular/core';
import { ChillerInventoryItem, ExploreOppsBaseline, Modification, ModificationEEMProperty, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
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

  updateModificationEEM<K extends ModificationEEMProperty>(EEMName: K, value: Modification[K]) {
    const selectedModificationId: string = this.selectedModificationId.getValue();
    const modification = this.modifications().find(mod => mod.id === selectedModificationId);
    if (modification) {
      modification[EEMName] = value;
      this.updateModification(modification);
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
    const baselineValues = this.getBaselineValues();
    return {
      name: 'Modification',
      id: getNewIdString(),
      notes: undefined,
      increaseChilledWaterTemp: {
        chilledWaterSupplyTemp: baselineValues.increaseChilledWaterTemp.chilledWaterSupplyTemp,
        useOpportunity: false,
      },
      decreaseCondenserWaterTemp: {
        condenserWaterTemp: baselineValues.decreaseCondenserWaterTemp.condenserWaterTemp,
        useOpportunity: false,
      },
      useSlidingCondenserWaterTemp: {
        followingTempDifferential: baselineValues.useSlidingCondenserWaterTemp.followingTempDifferential,
        isConstantCondenserWaterTemp: baselineValues.useSlidingCondenserWaterTemp.isConstantCondenserWaterTemp,
        useOpportunity: false,
      },
      applyVariableSpeedControls: {
        fanSpeedType: baselineValues.applyVariableSpeedControls.fanSpeedType,
        useOpportunity: false,
      },
      replaceChillers: {
        currentChillerId: '',
        newChiller: {} as ChillerInventoryItem,
        useOpportunity: false,
      },
      upgradeCoolingTowerFans: {
        numberOfFans: baselineValues.upgradeCoolingTowerFans.numberOfFans,
        useOpportunity: false,
      },
      useFreeCooling: {
        usesFreeCooling: baselineValues.useFreeCooling.usesFreeCooling,
        isHEXRequired: baselineValues.useFreeCooling.isHEXRequired,
        HEXApproachTemp: baselineValues.useFreeCooling.HEXApproachTemp,
        useOpportunity: false,
      },
      replaceRefrigerant: {
        currentRefrigerant: undefined,
        newRefrigerant: undefined,
        useOpportunity: false,
      },
      installVSDOnCentrifugalCompressor: {
        useOpportunity: false,
      },
    }
  }

  // todo
  getModifiedProcessCoolingAssessment(processCoolingAssessment: ProcessCoolingAssessment, modification: Modification): ProcessCoolingAssessment {
    return {
      ...processCoolingAssessment,
    };
  }

  getBaselineValues(): ExploreOppsBaseline {
    const processCooling = this.processCoolingSignal();
    let exploreOpportunitiesBaseline: ExploreOppsBaseline = {
      increaseChilledWaterTemp: {
        chilledWaterSupplyTemp: processCooling.systemInformation.operations.chilledWaterSupplyTemp,
      },
      decreaseCondenserWaterTemp: {
        condenserWaterTemp: processCooling.systemInformation.waterCooledSystemInput.condenserWaterTemp,
      },
      useSlidingCondenserWaterTemp: {
        followingTempDifferential: processCooling.systemInformation.airCooledSystemInput.followingTempDifferential,
        isConstantCondenserWaterTemp: processCooling.systemInformation.waterCooledSystemInput.isConstantCondenserWaterTemp,
      },
      applyVariableSpeedControls: {
        fanSpeedType: processCooling.systemInformation.towerInput.fanSpeedType,
      },
      upgradeCoolingTowerFans: {
        numberOfFans: processCooling.systemInformation.towerInput.numberOfFans,
      },
      useFreeCooling: {
        usesFreeCooling: processCooling.systemInformation.towerInput.usesFreeCooling,
        isHEXRequired: processCooling.systemInformation.towerInput.isHEXRequired,
        HEXApproachTemp: processCooling.systemInformation.towerInput.HEXApproachTemp,
      },
      // todo below baseline equivalents
      replaceChillers: {
        currentChillerId: '',
        newChiller: {} as ChillerInventoryItem,
      },
      replaceRefrigerant: {
        currentRefrigerant: undefined,
        newRefrigerant: undefined,
      },
      installVSDOnCentrifugalCompressor: {
        compressorType: undefined,
      },
    }

    return exploreOpportunitiesBaseline;
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
