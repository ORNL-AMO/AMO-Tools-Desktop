import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getAtmosphereLossWarnings } from '../../heat-balance/losses/atmosphere/atmosphere-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Optimize Furnace Atmosphere Makeup System';

export type AtmosphereOpportunityField = 'flowRate' | 'inletTemperature' | 'outletTemperature';
export type AtmosphereOpportunitySection = 'flowRate' | 'temperature';

@Component({
  selector: 'app-atmosphere-opportunity',
  standalone: false,
  templateUrl: './atmosphere-opportunity.component.html',
  styleUrl: './atmosphere-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtmosphereOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'atmosphereLosses', AtmosphereOpportunityField, AtmosphereOpportunitySection>({
    lossKey: 'atmosphereLosses',
    category: ExploreOpportunityCategory.Atmosphere,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      flowRate: directField<AtmosphereLoss, 'flowRate'>('flowRate'),
      inletTemperature: directField<AtmosphereLoss, 'inletTemperature'>('inletTemperature'),
      outletTemperature: directField<AtmosphereLoss, 'outletTemperature'>('outletTemperature'),
    },
    sections: {
      flowRate: ['flowRate'],
      temperature: ['inletTemperature', 'outletTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarnings: getAtmosphereLossWarnings(comparison.baselineItem),
    modificationWarnings: getAtmosphereLossWarnings(comparison.modificationItem),
  })));

  isExpanded(section: AtmosphereOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: AtmosphereOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setModificationValue(lossId: string, field: AtmosphereOpportunityField, value: number): void {
    this.state.setModificationValue(lossId, field, value);
  }
}
