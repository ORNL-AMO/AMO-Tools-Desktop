import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export interface WallLossSurfaceTemperatureComparison {
  id: string;
  name: string;
  baselineSurfaceTemperature: number | undefined;
  modificationSurfaceTemperature: number | undefined;
}

const OPPORTUNITY_DISPLAY_NAME = 'Reduce Wall Surface Temperature';

@Component({
  selector: 'app-wall-loss-opportunity',
  standalone: false,
  templateUrl: './wall-loss-opportunity.component.html',
  styleUrl: './wall-loss-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallLossOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.Wall]?.hasOpportunity ?? false
  );

  readonly surfaceTemperatureComparisons: Signal<WallLossSurfaceTemperatureComparison[]> = computed(() => {
    const baselineLosses = this.assessmentService.scenarioPhast('baseline')?.losses?.wallLosses ?? [];
    const modificationId = this.modificationService.selectedModificationId();
    const modificationLosses = modificationId
      ? this.assessmentService.scenarioPhast(modificationId)?.losses?.wallLosses ?? []
      : [];

    return baselineLosses.map(baselineLoss => {
      const modificationLoss = modificationLosses.find(loss => loss.id === baselineLoss.id);
      return {
        id: baselineLoss.id,
        name: baselineLoss.name,
        baselineSurfaceTemperature: baselineLoss.surfaceTemperature,
        modificationSurfaceTemperature: modificationLoss?.surfaceTemperature ?? baselineLoss.surfaceTemperature,
      };
    });
  });

  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.Wall, {
      hasOpportunity,
      display: OPPORTUNITY_DISPLAY_NAME,
    });


    if (!hasOpportunity) {
      this.resetSurfaceTemperaturesToBaseline(modificationId);
    }
  }

  private resetSurfaceTemperaturesToBaseline(modificationId: string): void {
    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }

    const baselineLosses = this.assessmentService.scenarioPhast('baseline')?.losses?.wallLosses ?? [];
    const effectiveLosses = this.assessmentService.scenarioPhast(modificationId)?.losses?.wallLosses ?? [];

    // Reset only the surface temperature on each loss back to baseline's value; any other override
    // already on these losses (e.g. entered separately in Expert View) is left as is.
    const resetWallLosses = effectiveLosses.map(loss => {
      const baselineLoss = baselineLosses.find(candidate => candidate.id === loss.id);
      return baselineLoss?.surfaceTemperature === undefined ? loss : { ...loss, surfaceTemperature: baselineLoss.surfaceTemperature };
    });

    this.assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      wallLosses: resetWallLosses,
    });
  }

  setModificationSurfaceTemperature(lossId: string, surfaceTemperature: number): void {
    if (Number.isNaN(surfaceTemperature)) {
      return;
    }

    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }

    const effectiveLosses = this.assessmentService.scenarioPhast(modification.id)?.losses?.wallLosses ?? [];
    const updatedWallLosses = effectiveLosses.map(loss =>
      loss.id === lossId ? { ...loss, surfaceTemperature } : loss
    );

    this.assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      wallLosses: updatedWallLosses,
    });
  }
}
