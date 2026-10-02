import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getFlueGasWarnings } from '../../heat-balance/losses/flue-gas/flue-gas-warnings';
import { flueGasField } from '../flue-gas-opportunity-fields';
import { createSectionedOpportunityState } from '../sectioned-opportunity-state';

export const PREHEAT_COMBUSTION_AIR_DISPLAY_NAME = 'Preheat Combustion Air';

export type PreheatCombustionAirOpportunityField = 'combustionAirTemperature';
export type PreheatCombustionAirOpportunitySection = 'combustionAirTemperature';

@Component({
  selector: 'app-preheat-combustion-air-opportunity',
  standalone: false,
  templateUrl: './preheat-combustion-air-opportunity.component.html',
  styleUrl: './preheat-combustion-air-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreheatCombustionAirOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'flueGasLosses', PreheatCombustionAirOpportunityField, PreheatCombustionAirOpportunitySection>({
    lossKey: 'flueGasLosses',
    category: ExploreOpportunityCategory.AirTemp,
    displayName: PREHEAT_COMBUSTION_AIR_DISPLAY_NAME,
    fields: {
      combustionAirTemperature: flueGasField('combustionAirTemperature'),
    },
    sections: {
      combustionAirTemperature: ['combustionAirTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  /** Flue gas is single-entry; only `flueGasLosses[0]` feeds results. */
  readonly comparisons = computed(() => this.state.comparisons().slice(0, 1).map(comparison => ({
    ...comparison,
    baselineWarnings: getFlueGasWarnings(comparison.baselineItem, this.settings()),
    modificationWarnings: getFlueGasWarnings(comparison.modificationItem, this.settings()),
  })));

  isExpanded(section: PreheatCombustionAirOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: PreheatCombustionAirOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setModificationValue(lossId: string, field: PreheatCombustionAirOpportunityField, value: number): void {
    this.state.setModificationValue(lossId, field, value);
  }
}
