import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getOpeningLossWarnings } from '../../heat-balance/losses/opening/opening-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Minimize the Time Furnace Doors are Open';

@Component({
  selector: 'app-opening-time-open-opportunity',
  standalone: false,
  templateUrl: './opening-time-open-opportunity.component.html',
  styleUrl: './opening-time-open-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningTimeOpenOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'openingLosses', 'percentTimeOpen', 'percentTimeOpen'>({
    lossKey: 'openingLosses',
    category: ExploreOpportunityCategory.AllTimeOpen,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      percentTimeOpen: directField<OpeningLoss, 'percentTimeOpen'>('percentTimeOpen'),
    },
    sections: {
      percentTimeOpen: ['percentTimeOpen'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarning: getOpeningLossWarnings(comparison.baselineItem).timeOpenWarning,
    modificationWarning: getOpeningLossWarnings(comparison.modificationItem).timeOpenWarning,
  })));

  isExpanded(lossId: string): boolean {
    return this.state.isExpanded('percentTimeOpen', lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(lossId: string, show: boolean): void {
    this.state.toggleSection('percentTimeOpen', lossId, show);
  }

  setModificationValue(lossId: string, percentTimeOpen: number): void {
    this.state.setModificationValue(lossId, 'percentTimeOpen', percentTimeOpen);
  }
}
