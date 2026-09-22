import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getWallLossSurfaceTemperatureWarning } from '../../heat-balance/losses/wall-losses/wall-loss-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';
import { WallLoss } from '../../models/wall-loss';

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

  private readonly state = createSectionedOpportunityState<'wallLosses', 'surfaceTemperature', 'surfaceTemperature'>({
    lossKey: 'wallLosses',
    category: ExploreOpportunityCategory.Wall,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      surfaceTemperature: directField<WallLoss, 'surfaceTemperature'>('surfaceTemperature'),
    },
    sections: {
      surfaceTemperature: ['surfaceTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarning: getWallLossSurfaceTemperatureWarning(comparison.baselineItem),
    modificationWarning: getWallLossSurfaceTemperatureWarning(comparison.modificationItem),
  })));

  isExpanded(lossId: string): boolean {
    return this.state.isExpanded('surfaceTemperature', lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(lossId: string, show: boolean): void {
    this.state.toggleSection('surfaceTemperature', lossId, show);
  }

  setModificationValue(lossId: string, surfaceTemperature: number): void {
    this.state.setModificationValue(lossId, 'surfaceTemperature', surfaceTemperature);
  }
}
