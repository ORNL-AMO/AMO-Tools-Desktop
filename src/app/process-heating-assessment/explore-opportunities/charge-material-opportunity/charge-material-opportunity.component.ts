import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ChargeMaterial, ChargeMaterialType } from '../../models/charge-material';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export interface ChargeMaterialTemperatureComparison {
  id: string;
  name: string;
  baselineInitialTemperature: number | undefined;
  modificationInitialTemperature: number | undefined;
}

const OPPORTUNITY_DISPLAY_NAME = 'Preheat Charge Material';

function readInitialTemperature(material: ChargeMaterial | undefined): number | undefined {
  if (!material) {
    return undefined;
  }
  switch (material.chargeMaterialType) {
    case ChargeMaterialType.Liquid:
      return material.liquidChargeMaterial?.initialTemperature;
    case ChargeMaterialType.Gas:
      return material.gasChargeMaterial?.initialTemperature;
    case ChargeMaterialType.Solid:
    default:
      return material.solidChargeMaterial?.initialTemperature;
  }
}

function withInitialTemperature(material: ChargeMaterial, initialTemperature: number): ChargeMaterial {
  switch (material.chargeMaterialType) {
    case ChargeMaterialType.Liquid:
      return { ...material, liquidChargeMaterial: { ...material.liquidChargeMaterial, initialTemperature } };
    case ChargeMaterialType.Gas:
      return { ...material, gasChargeMaterial: { ...material.gasChargeMaterial, initialTemperature } };
    case ChargeMaterialType.Solid:
    default:
      return { ...material, solidChargeMaterial: { ...material.solidChargeMaterial, initialTemperature } };
  }
}

@Component({
  selector: 'app-charge-material-opportunity',
  standalone: false,
  templateUrl: './charge-material-opportunity.component.html',
  styleUrl: './charge-material-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunities?.[ExploreOpportunityCategory.Material]?.hasOpportunity ?? false
  );


  readonly materialTemperatureComparisons: Signal<ChargeMaterialTemperatureComparison[]> = computed(() => {
    const baselineMaterials = this.assessmentService.scenarioPhast('baseline')?.losses?.chargeMaterials ?? [];
    const modificationId = this.modificationService.selectedModificationId();
    const modificationMaterials = modificationId
      ? this.assessmentService.scenarioPhast(modificationId)?.losses?.chargeMaterials ?? []
      : [];

    return baselineMaterials.map(baselineMaterial => {
      const modificationMaterial = modificationMaterials.find(material => material.id === baselineMaterial.id);
      return {
        id: baselineMaterial.id,
        name: baselineMaterial.name,
        baselineInitialTemperature: readInitialTemperature(baselineMaterial),
        modificationInitialTemperature: readInitialTemperature(modificationMaterial) ?? readInitialTemperature(baselineMaterial),
      };
    });
  });


  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.Material, {
      hasOpportunity,
      display: OPPORTUNITY_DISPLAY_NAME,
    });

    // The merge no longer gates a loss-type diff on this flag (see scenario-merge.util.ts), so
    // deselecting the opportunity has to actively put the preheated temperatures back to baseline
    // itself: otherwise they'd keep applying even with the opportunity off.
    if (!hasOpportunity) {
      this.resetInitialTemperaturesToBaseline(modificationId);
    }
  }

  private resetInitialTemperaturesToBaseline(modificationId: string): void {
    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }

    const baselineMaterials = this.assessmentService.scenarioPhast('baseline')?.losses?.chargeMaterials ?? [];
    const effectiveMaterials = this.assessmentService.scenarioPhast(modificationId)?.losses?.chargeMaterials ?? [];

    // Reset only the initial temperature on each material back to baseline's value; any other
    // override already on these materials (e.g. entered separately in Expert View) is left as is.
    const resetChargeMaterials = effectiveMaterials.map(material => {
      const baselineMaterial = baselineMaterials.find(candidate => candidate.id === material.id);
      const baselineInitialTemperature = readInitialTemperature(baselineMaterial);
      return baselineInitialTemperature === undefined ? material : withInitialTemperature(material, baselineInitialTemperature);
    });

    this.assessmentService.updateModificationProperty(modificationId, 'losses', {
      ...modification.scenarioOverrides?.losses,
      chargeMaterials: resetChargeMaterials,
    });
  }

  setModificationInitialTemperature(materialId: string, initialTemperature: number): void {
    if (Number.isNaN(initialTemperature)) {
      return;
    }

    const modification = this.modificationService.selectedModification();
    if (!modification) {
      return;
    }

    // Start from this modification's own currently-effective materials (baseline merged with
    // whatever it already overrides), not raw baseline — otherwise editing one material's
    // temperature would silently discard any override already set on another material.
    const effectiveMaterials = this.assessmentService.scenarioPhast(modification.id)?.losses?.chargeMaterials ?? [];
    const updatedChargeMaterials = effectiveMaterials.map(material =>
      material.id === materialId ? withInitialTemperature(material, initialTemperature) : material
    );

    this.assessmentService.updateModificationProperty(modification.id, 'losses', {
      ...modification.scenarioOverrides?.losses,
      chargeMaterials: updatedChargeMaterials,
    });
  }
}
