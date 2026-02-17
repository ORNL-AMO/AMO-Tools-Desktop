import { computed, inject, Injectable, Signal } from '@angular/core';
import { ChillerInventoryItem, ExploreOppsBaseline, Modification, ModificationEEMProperty, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { BehaviorSubject, combineLatest, EMPTY, of, switchMap, tap } from 'rxjs';
import { ProcessCoolingAssessmentService } from './process-cooling-asessment.service';
import { copyObject, getNewIdString } from '../../shared/helperFunctions';
import { LocalStorageService } from '../../shared/local-storage.service';
import { PC_SELECTED_MODIFICATION_KEY } from '../../shared/models/app';
import { AppErrorService } from '../../shared/errors/app-error.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ExploreOpportunitiesFormService } from './explore-opportunities-form.service';

@Injectable()
export class ModificationService {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private localStorageService = inject(LocalStorageService);
  private appErrorService = inject(AppErrorService);
  private processCoolingSignal = this.processCoolingAssessmentService.processCoolingSignal;


  private readonly selectedModificationId = new BehaviorSubject<string>(undefined);
  readonly selectedModificationId$ = this.selectedModificationId.asObservable();


  modifications: Signal<Array<Modification>> = computed(() => {
    return this.processCoolingSignal()?.modifications ?? [];
  });
  readonly selectedModification$ = combineLatest([
    this.selectedModificationId$,
    toObservable(this.modifications)
  ]).pipe(
    tap(([id, modifications]) => {
      if (id) {
        this.localStorageService.store(PC_SELECTED_MODIFICATION_KEY, id);
      }
    }),
    switchMap(([selectedModificationId, modifications]: [string, Modification[]]) => {
      if (selectedModificationId) {
        const selectedModification = this.getModificationById(selectedModificationId);
        return of(selectedModification);
      } else if (modifications && modifications.length > 0) {
        let defaultSelectedId = this.getStorageSelectedId();
        defaultSelectedId = defaultSelectedId ? defaultSelectedId : modifications[0].id;
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

  isModificationValid(): boolean {
    const selectedModificationId = this.selectedModificationId.getValue();
    if (!selectedModificationId) {
      return true;
    }
    const modification = this.getModificationById(selectedModificationId);
    if (!modification) {
      return true;
    }

    const baselineValues = this.getBaselineExploreOppsValues();

    if (modification.increaseChilledWaterTemp?.useOpportunity) {
      const form = this.exploreOpportunitiesFormService.getIncreaseChilledTempForm(
        modification.increaseChilledWaterTemp.chilledWaterSupplyTemp,
        this.processCoolingAssessmentService.settingsSignal(),
        baselineValues.increaseChilledWaterTemp.chilledWaterSupplyTemp
      );
      if (!form.valid) {
        return false;
      }
    }

    if (modification.decreaseCondenserWaterTemp?.useOpportunity) {
      const form = this.exploreOpportunitiesFormService.getDecreaseCondenserWaterTempForm(
        modification.decreaseCondenserWaterTemp.condenserWaterTemp,
        this.processCoolingAssessmentService.settingsSignal(),
        baselineValues.decreaseCondenserWaterTemp.condenserWaterTemp
      );
      if (!form.valid) {
        return false;
      }
    }

    if (modification.useSlidingCondenserWaterTemp?.useOpportunity) {
      const form = this.exploreOpportunitiesFormService.getSlidingCondenserWaterTempForm(
        modification.useSlidingCondenserWaterTemp.followingTempDifferential,
        this.processCoolingAssessmentService.settingsSignal(),
      );
      if (!form.valid) {
        return false;
      }
    }

    if (modification.applyVariableSpeedControls?.useOpportunity) {
      const form = this.exploreOpportunitiesFormService.getApplyVariableSpeedControlForm(
        modification.applyVariableSpeedControls.chilledWaterVariableFlow,
        modification.applyVariableSpeedControls.condenserWaterVariableFlow
      );
      if (!form.valid) {
        return false;
      }
    }

    if (modification.upgradeCoolingTowerFans?.useOpportunity) {
      const form = this.exploreOpportunitiesFormService.getUpgradeCoolingTowerFanForm({
        towerType: modification.upgradeCoolingTowerFans.towerType,
        numberOfFans: modification.upgradeCoolingTowerFans.numberOfFans,
        fanSpeedType: modification.upgradeCoolingTowerFans.fanSpeedType
      });
      if (!form.valid) {
        return false;
      }
    }

    return true;
  }

  updateModification(modification: Modification) {
    let processCoolingAssessment: ProcessCoolingAssessment = { ...this.processCoolingSignal() };
    const modIndex = processCoolingAssessment.modifications.findIndex(mod => mod.id === modification.id);
    if (modIndex !== -1) {
      processCoolingAssessment.modifications[modIndex] = { ...modification };
      const updatedModifications = [...processCoolingAssessment.modifications];
      const updatedProcessCooling = {
        ...processCoolingAssessment,
        modifications: updatedModifications
      };
      this.processCoolingAssessmentService.setProcessCooling(updatedProcessCooling);
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

  /**
  * Map Baseline Explore Opportunities values to a modification
  * @param processCoolingAssessment 
  * @param modification 
  * @returns 
  */
  getNewModification(): Modification {
    const baselineValues = this.getBaselineExploreOppsValues();
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
        chilledWaterVariableFlow: baselineValues.applyVariableSpeedControls.chilledWaterVariableFlow,
        condenserWaterVariableFlow: baselineValues.applyVariableSpeedControls.condenserWaterVariableFlow,
        useOpportunity: false,
      },
      replaceChillers: {
        currentChillerId: '',
        newChiller: undefined,
        useOpportunity: false,
      },
      upgradeCoolingTowerFans: {
        towerType: baselineValues.upgradeCoolingTowerFans.towerType,
        fanSpeedType: baselineValues.upgradeCoolingTowerFans.fanSpeedType,
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
        compressorType: undefined,
        useOpportunity: false,
      },
    }
  }

  /**
   * Map Explore Opportunities (Modification) values to a new process cooling assessment representing the modification
   * @param processCoolingAssessment - Full assessment from which baseline values are pulled
   * @param modification 
   * @returns 
   */
  getModifiedProcessCoolingAssessment(processCoolingAssessment: ProcessCoolingAssessment, modification: Modification): ProcessCoolingAssessment {
    let modifiedProcessCoolingAssessment: ProcessCoolingAssessment = { ...processCoolingAssessment };
    let systemInformation = { ...modifiedProcessCoolingAssessment.systemInformation };
    // * EEMS currently only update systemInformation values

    if (modification.increaseChilledWaterTemp.useOpportunity) {
      systemInformation.operations = {
        ...systemInformation.operations,
        chilledWaterSupplyTemp: modification.increaseChilledWaterTemp.chilledWaterSupplyTemp,
      };
    }

    if (modification.decreaseCondenserWaterTemp.useOpportunity) {
      systemInformation.waterCooledSystemInput = {
        ...systemInformation.waterCooledSystemInput,
        condenserWaterTemp: modification.decreaseCondenserWaterTemp.condenserWaterTemp,
      };
    }

    if (modification.useSlidingCondenserWaterTemp.useOpportunity) {
      systemInformation.waterCooledSystemInput = {
        ...systemInformation.waterCooledSystemInput,
        isConstantCondenserWaterTemp: modification.useSlidingCondenserWaterTemp.isConstantCondenserWaterTemp,
        followingTempDifferential: modification.useSlidingCondenserWaterTemp.followingTempDifferential,
      };
    }

    if (modification.applyVariableSpeedControls.useOpportunity) {
      systemInformation.chilledWaterPumpInput = {
        ...systemInformation.chilledWaterPumpInput,
        variableFlow: modification.applyVariableSpeedControls.chilledWaterVariableFlow,
      };
      systemInformation.condenserWaterPumpInput = {
        ...systemInformation.condenserWaterPumpInput,
        variableFlow: modification.applyVariableSpeedControls.condenserWaterVariableFlow,
      };

    }

    if (modification.applyVariableSpeedControls.useOpportunity) {
      systemInformation.condenserWaterPumpInput = {
        ...systemInformation.condenserWaterPumpInput,
        variableFlow: modification.applyVariableSpeedControls.condenserWaterVariableFlow,
      };
    }

    if (modification.upgradeCoolingTowerFans.useOpportunity) {
      systemInformation.towerInput = {
        ...systemInformation.towerInput,
        towerType: modification.upgradeCoolingTowerFans.towerType,
        fanSpeedType: modification.upgradeCoolingTowerFans.fanSpeedType,
        numberOfFans: modification.upgradeCoolingTowerFans.numberOfFans,
      };
    }

    if (modification.useFreeCooling.useOpportunity) {
      systemInformation.towerInput = {
        ...systemInformation.towerInput,
        usesFreeCooling: modification.useFreeCooling.usesFreeCooling,
        isHEXRequired: modification.useFreeCooling.isHEXRequired,
        HEXApproachTemp: modification.useFreeCooling.HEXApproachTemp,
      };
    }

    modifiedProcessCoolingAssessment.systemInformation = systemInformation;

    return modifiedProcessCoolingAssessment;
  }

  getBaselineExploreOppsValues(): ExploreOppsBaseline {
    const processCooling = this.processCoolingSignal();
    let exploreOpportunitiesBaseline: ExploreOppsBaseline = {
      increaseChilledWaterTemp: {
        chilledWaterSupplyTemp: processCooling.systemInformation.operations.chilledWaterSupplyTemp,
      },
      decreaseCondenserWaterTemp: {
        condenserWaterTemp: processCooling.systemInformation.waterCooledSystemInput?.condenserWaterTemp,
      },
      useSlidingCondenserWaterTemp: {
        followingTempDifferential: processCooling.systemInformation.waterCooledSystemInput?.followingTempDifferential,
        isConstantCondenserWaterTemp: processCooling.systemInformation.waterCooledSystemInput?.isConstantCondenserWaterTemp,
      },
      applyVariableSpeedControls: {
        chilledWaterVariableFlow: processCooling.systemInformation.chilledWaterPumpInput.variableFlow,
        condenserWaterVariableFlow: processCooling.systemInformation.condenserWaterPumpInput?.variableFlow,
      },
      upgradeCoolingTowerFans: {
        towerType: processCooling.systemInformation.towerInput.towerType,
        fanSpeedType: processCooling.systemInformation.towerInput.fanSpeedType,
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
