import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { WallLoss } from '../../models/wall-loss';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { createOpportunityComparisonState } from '../explore-opportunity-comparison';

const OPPORTUNITY_DISPLAY_NAME = 'Add / Improve Wall Insulation';

@Component({
  selector: 'app-wall-loss-opportunity',
  standalone: false,
  templateUrl: './wall-loss-opportunity.component.html',
  styleUrl: './wall-loss-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallLossOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createOpportunityComparisonState({
    lossKey: 'wallLosses',
    category: ExploreOpportunityCategory.Wall,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    getValue: (loss: WallLoss) => loss.surfaceTemperature,
    withValue: (loss: WallLoss, surfaceTemperature: number) => ({ ...loss, surfaceTemperature }),
  });

  readonly useOpportunity = this.state.useOpportunity;
  readonly comparisons = this.state.comparisons;

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  setModificationValue(lossId: string, surfaceTemperature: number): void {
    this.state.setModificationValue(lossId, surfaceTemperature);
  }
}
