import { computed, inject, Injectable } from '@angular/core';
import { ChillerInventoryItem, ExploreOppsBaseline, Modification, ModificationEEMProperty, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { BehaviorSubject, EMPTY, map, Observable, of, switchMap, tap } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { copyObject, getNewIdString } from '../../shared/helperFunctions';
import { LocalStorageService } from '../../shared/local-storage.service';
import { PC_SELECTED_MODIFICATION_KEY } from '../../shared/models/app';
import { AppErrorService } from '../../shared/errors/app-error.service';

@Injectable()
export class ModificationService {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private localStorageService = inject(LocalStorageService);
  private appErrorService = inject(AppErrorService);
  private processCoolingSignal = this.processCoolingAssessmentService.processCoolingSignal;
  modifications = computed(() => {
    return this.processCoolingSignal().modifications;
  });

  private readonly selectedModificationId = new BehaviorSubject<string>(undefined);
  readonly selectedModificationId$ = this.selectedModificationId.asObservable();

  // * this needs to be set from an assessment with mods that is being loaded for the first time
    readonly selectedModification$: Observable<Modification> = this.selectedModificationId$.pipe(
    tap(id => {
      if (id) {
        this.localStorageService.store(PC_SELECTED_MODIFICATION_KEY, id);
      }
    }),
    switchMap((selectedModificationId: string) => {
      if (selectedModificationId) {
        const selectedModification = this.getModificationById(selectedModificationId);
        return of(selectedModification);
      } else if (this.modifications() && this.modifications().length > 0) {
        let defaultSelectedId = this.getStorageSelectedId();
        defaultSelectedId = defaultSelectedId ? defaultSelectedId : this.modifications()[0].id;
        this.setSelectedModificationId(defaultSelectedId);
        return EMPTY;
      } else {
        return of(undefined);
      }
    }),
  );

  getStorageSelectedId(): string {
    let userSelectedModificationId: string;
    try {
      userSelectedModificationId = this.localStorageService.retrieve(PC_SELECTED_MODIFICATION_KEY);
    } catch (error) {
      this.appErrorService.handleAppError('Error retrieving selectedModificationId from localStorage', error);
    }
    return userSelectedModificationId;
  }

  setSelectedModificationId(modificationId: string) {
    this.selectedModificationId.next(modificationId);
  }

  getModificationById(modificationId: string): Modification {
    return this.modifications().find(mod => mod.id === modificationId);
  }

  updateModification(modification: Modification) {
    let processCoolingAssessment: ProcessCoolingAssessment = { ...this.processCoolingSignal() };
    const modIndex = processCoolingAssessment.modifications.findIndex(mod => mod.id === modification.id);
    if (modIndex !== -1) {
      const updatedModification = { ...modification }
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
    let processCoolingAssessment: ProcessCoolingAssessment = { ...this.processCoolingSignal() };
    let modification: Modification = this.getNewModification();
    modification.name = name ? name : modification.name;
    processCoolingAssessment.modifications.push(modification);
    this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
    this.setSelectedModificationId(modification.id);
  }

  deleteAssessmentModification(id: string) {
    let processCoolingAssessment: ProcessCoolingAssessment = { ...this.processCoolingSignal() };
    if (id) {
      processCoolingAssessment.modifications = processCoolingAssessment.modifications.filter(mod => mod.id !== id);
    }
    this.processCoolingAssessmentService.setProcessCooling(processCoolingAssessment);
  }

  copyModification(id: string) {
    let processCoolingAssessment: ProcessCoolingAssessment = { ...this.processCoolingSignal() };
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
      isValid: true,
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
        newChiller: undefined,
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

  
  getModifiedProcessCoolingAssessment(processCoolingAssessment: ProcessCoolingAssessment, modification: Modification): ProcessCoolingAssessment {
    let modifiedProcessCoolingAssessment: ProcessCoolingAssessment = { ...processCoolingAssessment };

    modifiedProcessCoolingAssessment.systemInformation = {
      ...processCoolingAssessment.systemInformation,
      operations: {
        ...processCoolingAssessment.systemInformation.operations,
        chilledWaterSupplyTemp: modification.increaseChilledWaterTemp.chilledWaterSupplyTemp,
      },
      waterCooledSystemInput: {
        ...processCoolingAssessment.systemInformation.waterCooledSystemInput,
        condenserWaterTemp: modification.decreaseCondenserWaterTemp.condenserWaterTemp,
      }
    };

    return modifiedProcessCoolingAssessment;
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
