import { computed, inject, Injectable, Signal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { CalculatorSuiteApiService } from '../../tools-suite-api/calculator-suite-api.service';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { ElectricityReductionData } from '../../shared/models/standalone';
import { Settings } from '../../shared/models/settings';
import { AuxiliaryEquipmentItemResult, AuxiliaryEquipmentResults } from '../models/auxiliary-equipment';
import { AssessmentScenario, ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { AuxiliaryEquipmentFormService } from '../auxiliary-equipment/auxiliary-equipment-form.service';

/** Calculates auxiliary equipment electricity separately from the heat balance. */
@Injectable()
export class AuxiliaryEquipmentResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly calculatorSuiteApiService = inject(CalculatorSuiteApiService);
  private readonly formService = inject(AuxiliaryEquipmentFormService);

  private readonly scenarioResultsCache = new Map<AssessmentScenario, Signal<AuxiliaryEquipmentResults>>();

  /**
   * Results shared by every reader of the scenario, recalculated only when its equipment or the settings change.
   * Readers must not mutate the returned object.
   * @param scenario 'baseline' or a modification id
   * @returns per-item and total power, energy, and cost
   */
  scenarioResults(scenario: AssessmentScenario): AuxiliaryEquipmentResults {
    let cached = this.scenarioResultsCache.get(scenario);
    if (!cached) {
      cached = computed(() => this.getResults(
        this.assessmentService.scenarioPhastSignal(scenario)?.auxiliaryEquipment,
        this.assessmentService.settingsSignal(),
      ));
      this.scenarioResultsCache.set(scenario, cached);
    }
    return cached();
  }

  /**
   * @param equipment the scenario's auxiliary equipment
   * @param settings facility settings supplying the electricity cost
   * @returns per-item and total power, energy, and cost; items missing inputs are left out
   */
  getResults(equipment: AuxiliaryEquipmentItem[] | undefined, settings: Settings): AuxiliaryEquipmentResults {
    const items = (equipment ?? [])
      .filter(item => this.formService.isValid(item))
      .map(item => this.calculateItem(item, settings?.electricityCost));
    return {
      items,
      totalPower: items.reduce((total, item) => total + item.power, 0),
      totalEnergyUse: items.reduce((total, item) => total + item.energyUse, 0),
      totalEnergyCost: items.reduce((total, item) => total + item.energyCost, 0),
    };
  }

  private calculateItem(item: AuxiliaryEquipmentItem, electricityCost: number): AuxiliaryEquipmentItemResult {
    const input: ElectricityReductionData = { ...cloneDeep(item), electricityCost };
    if (input.userSelectedHP && input.nameplateData.ratedMotorPower != null) {
      input.nameplateData.ratedMotorPower = new ConvertValue(input.nameplateData.ratedMotorPower, 'hp', 'kW').convertedValue;
    }
    const result = this.calculatorSuiteApiService.electricityReduction({ electricityReductionInputVec: [input] });
    // The suite's power is for one unit, while its energy and cost already cover every unit
    const power = result.power * (item.units ?? 1);
    return { id: item.id, name: item.name, power, energyUse: result.energyUse, energyCost: result.energyCost };
  }
}
