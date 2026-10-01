import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getGasLeakageWarnings } from '../../heat-balance/losses/gas-leakage/gas-leakage-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Control and Optimize Furnace Pressure';

export type GasLeakageOpportunityField = 'draftPressure' | 'openingArea';
export type GasLeakageOpportunitySection = 'draftPressure' | 'openingArea';

@Component({
  selector: 'app-gas-leakage-opportunity',
  standalone: false,
  templateUrl: './gas-leakage-opportunity.component.html',
  styleUrl: './gas-leakage-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GasLeakageOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'leakageLosses', GasLeakageOpportunityField, GasLeakageOpportunitySection>({
    lossKey: 'leakageLosses',
    category: ExploreOpportunityCategory.Leakage,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      draftPressure: directField<LeakageLoss, 'draftPressure'>('draftPressure'),
      openingArea: directField<LeakageLoss, 'openingArea'>('openingArea'),
    },
    sections: {
      draftPressure: ['draftPressure'],
      openingArea: ['openingArea'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarnings: getGasLeakageWarnings(comparison.baselineItem),
    modificationWarnings: getGasLeakageWarnings(comparison.modificationItem),
  })));

  isExpanded(section: GasLeakageOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: GasLeakageOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setModificationValue(lossId: string, field: GasLeakageOpportunityField, value: number): void {
    this.state.setModificationValue(lossId, field, value);
  }
}
