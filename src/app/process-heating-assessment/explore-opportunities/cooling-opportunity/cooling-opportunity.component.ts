import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { CoolingLossWarnings, getGasCoolingWarnings, getLiquidCoolingWarnings } from '../../heat-balance/losses/cooling/cooling-warnings';
import { gasOutletTemperatureFields, isLiquidMedium } from '../../heat-balance/losses/cooling/cooling-form.service';
import { createSectionedOpportunityState, OpportunityFieldAccessor } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Optimize or Improve Furnace Cooling System';

export type CoolingOpportunityField = 'flowRate' | 'initialTemperature' | 'outletTemperature';
export type CoolingOpportunitySection = 'flowRate' | 'temperature';

/** Accessor for a field present under the same name on both `GasCoolingLoss` and `LiquidCoolingLoss`. */
function coolingField<P extends keyof GasCoolingLoss & keyof LiquidCoolingLoss>(property: P): OpportunityFieldAccessor<CoolingLoss> {
  return {
    get: item => isLiquidMedium(item.coolingLossType) ? item.liquidCoolingLoss?.[property] : item.gasCoolingLoss?.[property],
    set: (item, value) => isLiquidMedium(item.coolingLossType)
      ? { ...item, liquidCoolingLoss: { ...item.liquidCoolingLoss, [property]: value } }
      : { ...item, gasCoolingLoss: { ...item.gasCoolingLoss, [property]: value } },
  };
}

const flowRate = coolingField('flowRate');
const initialTemperature = coolingField('initialTemperature');

/** Gas's outlet is read from/written to `finalTemperature`, mirrored into `outletTemperature`; see
 * `gasOutletTemperatureFields`. Liquid just uses `outletTemperature` directly. */
const outletTemperature: OpportunityFieldAccessor<CoolingLoss> = {
  get: item => isLiquidMedium(item.coolingLossType) ? item.liquidCoolingLoss?.outletTemperature : item.gasCoolingLoss?.finalTemperature,
  set: (item, value) => isLiquidMedium(item.coolingLossType)
    ? { ...item, liquidCoolingLoss: { ...item.liquidCoolingLoss, outletTemperature: value } }
    : { ...item, gasCoolingLoss: { ...item.gasCoolingLoss, ...gasOutletTemperatureFields(value) } },
};

function warningsFor(item: CoolingLoss): CoolingLossWarnings {
  return isLiquidMedium(item.coolingLossType)
    ? getLiquidCoolingWarnings(item.liquidCoolingLoss ?? {})
    : getGasCoolingWarnings(item.gasCoolingLoss ?? {});
}

@Component({
  selector: 'app-cooling-opportunity',
  standalone: false,
  templateUrl: './cooling-opportunity.component.html',
  styleUrl: './cooling-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoolingOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'coolingLosses', CoolingOpportunityField, CoolingOpportunitySection>({
    lossKey: 'coolingLosses',
    category: ExploreOpportunityCategory.Cooling,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: { flowRate, initialTemperature, outletTemperature },
    sections: {
      flowRate: ['flowRate'],
      temperature: ['initialTemperature', 'outletTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineIsGas: !isLiquidMedium(comparison.baselineItem.coolingLossType),
    modificationIsGas: !isLiquidMedium(comparison.modificationItem.coolingLossType),
    baselineWarnings: warningsFor(comparison.baselineItem),
    modificationWarnings: warningsFor(comparison.modificationItem),
  })));

  isExpanded(section: CoolingOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: CoolingOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setModificationValue(lossId: string, field: CoolingOpportunityField, value: number): void {
    this.state.setModificationValue(lossId, field, value);
  }
}
