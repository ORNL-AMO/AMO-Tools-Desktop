import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Reduce Slag';

@Component({
  selector: 'app-slag-opportunity',
  standalone: false,
  templateUrl: './slag-opportunity.component.html',
  styleUrl: './slag-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlagOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'slagLosses', 'weight', 'weight'>({
    lossKey: 'slagLosses',
    category: ExploreOpportunityCategory.Slag,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      weight: directField<Slag, 'weight'>('weight'),
    },
    sections: {
      weight: ['weight'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;
  readonly comparisons = this.state.comparisons;

  isExpanded(lossId: string): boolean {
    return this.state.isExpanded('weight', lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(lossId: string, show: boolean): void {
    this.state.toggleSection('weight', lossId, show);
  }

  setModificationValue(lossId: string, weight: number): void {
    this.state.setModificationValue(lossId, 'weight', weight);
  }
}
