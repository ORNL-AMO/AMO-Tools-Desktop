import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FlueGas } from '../../../shared/models/phast/losses/flueGas';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { FlueGasAvailableHeatResult, FlueGasCalculationService } from '../../heat-balance/losses/flue-gas/flue-gas-calculation.service';
import { FlueGasType, OXYGEN_CALCULATION_METHODS, OxygenCalculationMethod } from '../../heat-balance/losses/flue-gas/flue-gas-form.service';
import { getFlueGasWarnings } from '../../heat-balance/losses/flue-gas/flue-gas-warnings';
import { flueGasField, FlueGasOpportunityField, getActiveFlueGas, getOxygenCalculationMethod, patchActiveFlueGas } from '../flue-gas-opportunity-fields';
import { PREHEAT_COMBUSTION_AIR_DISPLAY_NAME } from '../preheat-combustion-air-opportunity/preheat-combustion-air-opportunity.component';
import { createSectionedOpportunityState } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Maintain Optimum Air/Fuel Ratio or Recommended O<sub>2</sub> Level in Flue Gas';

export type AirFuelRatioOpportunityField = Exclude<FlueGasOpportunityField, 'combustionAirTemperature'>;
export type AirFuelRatioOpportunitySection = 'airFuelRatio';

@Component({
  selector: 'app-air-fuel-ratio-opportunity',
  standalone: false,
  templateUrl: './air-fuel-ratio-opportunity.component.html',
  styleUrl: './air-fuel-ratio-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlueGasCalculationService],
})
export class AirFuelRatioOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly calculationService = inject(FlueGasCalculationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly OxygenCalculationMethod = OxygenCalculationMethod;
  readonly calculationMethods = OXYGEN_CALCULATION_METHODS;

  private readonly state = createSectionedOpportunityState<'flueGasLosses', AirFuelRatioOpportunityField, AirFuelRatioOpportunitySection>({
    lossKey: 'flueGasLosses',
    category: ExploreOpportunityCategory.FlueGas,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      excessAirPercentage: flueGasField('excessAirPercentage'),
      o2InFlueGas: flueGasField('o2InFlueGas'),
    },
    sections: {
      airFuelRatio: ['excessAirPercentage', 'o2InFlueGas'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  /** Flue gas is single-entry; only `flueGasLosses[0]` feeds results. */
  readonly comparisons = computed(() => this.state.comparisons().slice(0, 1).map(comparison => {
    const settings = this.settings();
    return {
      ...comparison,
      baselineMethod: getOxygenCalculationMethod(comparison.baselineItem),
      modificationMethod: getOxygenCalculationMethod(comparison.modificationItem),
      baselineWarnings: getFlueGasWarnings(comparison.baselineItem, settings),
      modificationWarnings: getFlueGasWarnings(comparison.modificationItem, settings),
      baselineDerived: this.derive(comparison.baselineItem, settings),
      modificationDerived: this.derive(comparison.modificationItem, settings),
    };
  }));

  isExpanded(section: AirFuelRatioOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
    if (!hasOpportunity) {
      this.comparisons().forEach(comparison => this.restoreBaselineMethod(comparison.id));
      this.turnOffPreheatCombustionAir();
    }
  }

  toggleSection(section: AirFuelRatioOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
    if (!show) {
      this.restoreBaselineMethod(lossId);
    }
  }

  /** Writes the entered value, then the other field from the suite so both are saved, as in legacy. */
  setModificationValue(lossId: string, field: AirFuelRatioOpportunityField, value: number): void {
    if (Number.isNaN(value)) return;
    const settings = this.settings();
    this.state.updateModificationItem(lossId, item => {
      const edited = flueGasField(field).set(item, value);
      const derived = this.derive(edited, settings);
      if (!derived) return edited;
      return patchActiveFlueGas(edited, field === 'o2InFlueGas'
        ? { excessAirPercentage: this.finiteOrZero(derived.calculatedExcessAir) }
        : { o2InFlueGas: this.finiteOrZero(derived.calculatedFlueGasO2) });
    });
  }

  /** Both inputs are zeroed so only the newly selected method's value is entered, as in legacy. */
  changeOxygenCalculationMethod(lossId: string, method: OxygenCalculationMethod): void {
    this.state.updateModificationItem(lossId, item =>
      patchActiveFlueGas(item, { oxygenCalculationMethod: method, o2InFlueGas: 0, excessAirPercentage: 0 }));
  }

  /** As in legacy, deselecting this opportunity also deselects Preheat Combustion Air and resets its temperature. */
  private turnOffPreheatCombustionAir(): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) return;
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.AirTemp, {
      hasOpportunity: false,
      display: PREHEAT_COMBUSTION_AIR_DISPLAY_NAME,
    });
    const temperature = flueGasField('combustionAirTemperature');
    this.comparisons().forEach(comparison =>
      this.state.updateModificationItem(comparison.id, item => temperature.set(item, temperature.get(comparison.baselineItem))));
  }

  private restoreBaselineMethod(lossId: string): void {
    const baselineItem = this.state.comparisons().find(comparison => comparison.id === lossId)?.baselineItem;
    const method = baselineItem && getOxygenCalculationMethod(baselineItem);
    if (method) {
      this.state.updateModificationItem(lossId, item => patchActiveFlueGas(item, { oxygenCalculationMethod: method }));
    }
  }

  private finiteOrZero(value: number): number {
    return Number.isFinite(value) ? value : 0;
  }

  /** The field the method does not enter is shown as the suite's calculated value, as in Expert View. */
  private derive(loss: FlueGas, settings: Settings): FlueGasAvailableHeatResult | null {
    const inputs = getActiveFlueGas(loss);
    if (!inputs) return null;
    return loss.flueGasType === FlueGasType.ByMass
      ? this.calculationService.calculateByMass(loss.flueGasByMass, settings)
      : this.calculationService.calculateByVolume(loss.flueGasByVolume, settings);
  }
}
