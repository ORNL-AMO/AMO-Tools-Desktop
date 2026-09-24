import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getOpeningLossWarnings } from '../../heat-balance/losses/opening/opening-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Minimize Opening Size or Install Tunnel-like Extensions';

export type OpeningSizeOpportunityField = 'numberOfOpenings' | 'thickness' | 'lengthOfOpening' | 'heightOfOpening' | 'viewFactor';
export type OpeningSizeOpportunitySection = 'size' | 'viewFactor';

@Component({
  selector: 'app-opening-size-opportunity',
  standalone: false,
  templateUrl: './opening-size-opportunity.component.html',
  styleUrl: './opening-size-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningSizeOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'openingLosses', OpeningSizeOpportunityField, OpeningSizeOpportunitySection>({
    lossKey: 'openingLosses',
    category: ExploreOpportunityCategory.Opening,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      numberOfOpenings: directField<OpeningLoss, 'numberOfOpenings'>('numberOfOpenings'),
      thickness: directField<OpeningLoss, 'thickness'>('thickness'),
      lengthOfOpening: directField<OpeningLoss, 'lengthOfOpening'>('lengthOfOpening'),
      heightOfOpening: directField<OpeningLoss, 'heightOfOpening'>('heightOfOpening'),
      viewFactor: directField<OpeningLoss, 'viewFactor'>('viewFactor'),
    },
    sections: {
      size: ['numberOfOpenings', 'thickness', 'lengthOfOpening', 'heightOfOpening'],
      viewFactor: ['viewFactor'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarnings: getOpeningLossWarnings(comparison.baselineItem),
    modificationWarnings: getOpeningLossWarnings(comparison.modificationItem),
  })));

  isExpanded(section: OpeningSizeOpportunitySection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: OpeningSizeOpportunitySection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setModificationValue(lossId: string, field: OpeningSizeOpportunityField, value: number): void {
    this.state.setModificationValue(lossId, field, value);
  }
}
