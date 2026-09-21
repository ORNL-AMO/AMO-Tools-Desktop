import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ChargeMaterial, ChargeMaterialType } from '../../../shared/models/phast/losses/chargeMaterial';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { createOpportunityComparisonState } from '../explore-opportunity-comparison';

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

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  private readonly state = createOpportunityComparisonState({
    lossKey: 'chargeMaterials',
    category: ExploreOpportunityCategory.Material,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    getValue: readInitialTemperature,
    withValue: withInitialTemperature,
  });

  readonly useOpportunity = this.state.useOpportunity;
  readonly comparisons = this.state.comparisons;

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  setModificationValue(materialId: string, initialTemperature: number): void {
    this.state.setModificationValue(materialId, initialTemperature);
  }
}
