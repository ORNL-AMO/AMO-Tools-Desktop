import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ChargeMaterial, ChargeMaterialType } from '../../../shared/models/phast/losses/chargeMaterial';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { getChargeMaterialInitialTemperatureWarning } from '../../heat-balance/losses/charge-material/charge-material-warnings';
import { createSectionedOpportunityState } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Preheat Charge Material';

function readInitialTemperature(material: ChargeMaterial): number | undefined {
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

function withInitialTemperature(material: ChargeMaterial, initialTemperature: number | undefined): ChargeMaterial {
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

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createSectionedOpportunityState<'chargeMaterials', 'initialTemperature', 'initialTemperature'>({
    lossKey: 'chargeMaterials',
    category: ExploreOpportunityCategory.Material,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      initialTemperature: { get: readInitialTemperature, set: withInitialTemperature },
    },
    sections: {
      initialTemperature: ['initialTemperature'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineWarning: getChargeMaterialInitialTemperatureWarning(comparison.baselineItem),
    modificationWarning: getChargeMaterialInitialTemperatureWarning(comparison.modificationItem),
  })));

  isExpanded(materialId: string): boolean {
    return this.state.isExpanded('initialTemperature', materialId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(materialId: string, show: boolean): void {
    this.state.toggleSection('initialTemperature', materialId, show);
  }

  setModificationValue(materialId: string, initialTemperature: number): void {
    this.state.setModificationValue(materialId, 'initialTemperature', initialTemperature);
  }
}
