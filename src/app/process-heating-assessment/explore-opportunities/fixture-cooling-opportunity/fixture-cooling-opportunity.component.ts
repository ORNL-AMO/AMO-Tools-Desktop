import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Avoid Fixture Cooling';

@Component({
  selector: 'app-fixture-cooling-opportunity',
  standalone: false,
  templateUrl: './fixture-cooling-opportunity.component.html',
  styleUrl: './fixture-cooling-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCoolingOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'fixtureLosses', 'initialTemperature', 'initialTemperature'>({
    lossKey: 'fixtureLosses',
    category: ExploreOpportunityCategory.AllTemp,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      initialTemperature: directField<FixtureLoss, 'initialTemperature'>('initialTemperature'),
    },
    sections: {
      initialTemperature: ['initialTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;
  readonly comparisons = this.state.comparisons;

  isExpanded(lossId: string): boolean {
    return this.state.isExpanded('initialTemperature', lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(lossId: string, show: boolean): void {
    this.state.toggleSection('initialTemperature', lossId, show);
  }

  setModificationValue(lossId: string, initialTemperature: number): void {
    this.state.setModificationValue(lossId, 'initialTemperature', initialTemperature);
  }
}
