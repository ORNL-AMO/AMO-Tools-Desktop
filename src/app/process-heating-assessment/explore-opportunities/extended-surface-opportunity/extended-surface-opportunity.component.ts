import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export interface ExtendedSurfaceTemperatureComparison {
  id: string;
  name: string;
  baselineSurfaceTemperature: number | undefined;
  modificationSurfaceTemperature: number | undefined;
}

const OPPORTUNITY_DISPLAY_NAME = 'Reduce Extended Surface Temperature';

@Component({
  selector: 'app-extended-surface-opportunity',
  standalone: false,
  templateUrl: './extended-surface-opportunity.component.html',
  styleUrl: './extended-surface-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedSurfaceOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.ExtendedSurface]?.hasOpportunity ?? false
  );

  readonly surfaceTemperatureComparisons: Signal<ExtendedSurfaceTemperatureComparison[]> = computed(() => {
    const baselineSurfaces = this.assessmentService.scenarioPhast('baseline')?.losses?.extendedSurfaces ?? [];
    const modificationId = this.modificationService.selectedModificationId();
    const modificationSurfaces = modificationId
      ? this.assessmentService.scenarioPhast(modificationId)?.losses?.extendedSurfaces ?? []
      : [];

    return baselineSurfaces.map(baselineSurface => {
      const modificationSurface = modificationSurfaces.find(surface => surface.id === baselineSurface.id);
      return {
        id: baselineSurface.id,
        name: baselineSurface.name,
        baselineSurfaceTemperature: baselineSurface.surfaceTemperature,
        modificationSurfaceTemperature: modificationSurface?.surfaceTemperature ?? baselineSurface.surfaceTemperature,
      };
    });
  });

  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.ExtendedSurface, {
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

    const baselineSurfaces = this.assessmentService.scenarioPhast('baseline')?.losses?.extendedSurfaces ?? [];
    const effectiveSurfaces = this.assessmentService.scenarioPhast(modificationId)?.losses?.extendedSurfaces ?? [];

    // Reset only the surface temperature on each entry back to baseline's value; any other override
    // already on these entries (e.g. entered separately in Expert View) is left as is.
    const resetExtendedSurfaces = effectiveSurfaces.map(surface => {
      const baselineSurface = baselineSurfaces.find(candidate => candidate.id === surface.id);
      return baselineSurface?.surfaceTemperature === undefined ? surface : { ...surface, surfaceTemperature: baselineSurface.surfaceTemperature };
    });

    this.assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      extendedSurfaces: resetExtendedSurfaces,
    });
  }

  setModificationSurfaceTemperature(surfaceId: string, surfaceTemperature: number): void {
    if (Number.isNaN(surfaceTemperature)) {
      return;
    }

    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }

    const effectiveSurfaces = this.assessmentService.scenarioPhast(modification.id)?.losses?.extendedSurfaces ?? [];
    const updatedExtendedSurfaces = effectiveSurfaces.map(surface =>
      surface.id === surfaceId ? { ...surface, surfaceTemperature } : surface
    );

    this.assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      extendedSurfaces: updatedExtendedSurfaces,
    });
  }
}
