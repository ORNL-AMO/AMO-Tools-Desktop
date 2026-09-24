import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getOpeningLossWarnings } from '../../heat-balance/losses/opening/opening-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Install Curtains or Radiation Shields to Reduce Opening Losses';

@Component({
  selector: 'app-opening-emissivity-opportunity',
  standalone: false,
  templateUrl: './opening-emissivity-opportunity.component.html',
  styleUrl: './opening-emissivity-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningEmissivityOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'openingLosses', 'emissivity', 'emissivity'>({
    lossKey: 'openingLosses',
    category: ExploreOpportunityCategory.AllEmissivity,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      emissivity: directField<OpeningLoss, 'emissivity'>('emissivity'),
    },
    sections: {
      emissivity: ['emissivity'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarning: getOpeningLossWarnings(comparison.baselineItem).emissivityWarning,
    modificationWarning: getOpeningLossWarnings(comparison.modificationItem).emissivityWarning,
  })));

  isExpanded(lossId: string): boolean {
    return this.state.isExpanded('emissivity', lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(lossId: string, show: boolean): void {
    this.state.toggleSection('emissivity', lossId, show);
  }

  setModificationValue(lossId: string, emissivity: number): void {
    this.state.setModificationValue(lossId, 'emissivity', emissivity);
  }
}
