import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Settings } from '../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../shared/models/materials';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { ExploreOpportunityCategory } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { convertDbValue } from '../../heat-balance/losses/charge-material/charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../../heat-balance/losses/charge-material/charge-material-units';
import { getFixtureFeedRateWarning } from '../../heat-balance/losses/fixture/fixture-warnings';
import { createSectionedOpportunityState, directField } from '../sectioned-opportunity-state';

const OPPORTUNITY_DISPLAY_NAME = 'Improve Materials Handling';

export type FixtureMaterialsHandlingField = 'feedRate' | 'materialName' | 'specificHeat';
export type FixtureMaterialsHandlingSection = 'feedRate' | 'material';

@Component({
  selector: 'app-fixture-materials-handling-opportunity',
  standalone: false,
  templateUrl: './fixture-materials-handling-opportunity.component.html',
  styleUrl: './fixture-materials-handling-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureMaterialsHandlingOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly materials: Signal<SolidLoadChargeMaterial[]> = toSignal(
    inject(SolidLoadMaterialDbService).getAllWithObservable(),
    { initialValue: [] },
  );

  private readonly state = createSectionedOpportunityState<'fixtureLosses', FixtureMaterialsHandlingField, FixtureMaterialsHandlingSection>({
    lossKey: 'fixtureLosses',
    category: ExploreOpportunityCategory.Fixtures,
    displayName: OPPORTUNITY_DISPLAY_NAME,
    fields: {
      feedRate: directField<FixtureLoss, 'feedRate'>('feedRate'),
      materialName: {
        get: loss => loss.materialName,
        set: (loss, materialName) => this.withMaterial(loss, materialName),
      },
      specificHeat: directField<FixtureLoss, 'specificHeat'>('specificHeat'),
    },
    sections: {
      feedRate: ['feedRate'],
      // Specific heat follows the material, so closing the section restores both.
      material: ['materialName', 'specificHeat'],
    },
  });

  readonly useOpportunity = this.state.useOpportunity;

  readonly comparisons = computed(() => this.state.comparisons().map(comparison => ({
    ...comparison,
    baselineMaterialName: this.materialSubstance(comparison.baseline.materialName),
    baselineFeedRateWarning: getFixtureFeedRateWarning(comparison.baselineItem),
    modificationFeedRateWarning: getFixtureFeedRateWarning(comparison.modificationItem),
  })));

  isExpanded(section: FixtureMaterialsHandlingSection, lossId: string): boolean {
    return this.state.isExpanded(section, lossId);
  }

  toggleOpportunity(hasOpportunity: boolean): void {
    this.state.toggleOpportunity(hasOpportunity);
  }

  toggleSection(section: FixtureMaterialsHandlingSection, lossId: string, show: boolean): void {
    this.state.toggleSection(section, lossId, show);
  }

  setFeedRate(lossId: string, feedRate: number): void {
    this.state.setModificationValue(lossId, 'feedRate', feedRate);
  }

  setMaterial(lossId: string, materialId: number): void {
    this.state.setModificationValue(lossId, 'materialName', materialId);
  }

  /**
   * Also copies `latentHeat`/`meltingPoint`/`specificHeatLiquid` — hidden fields not shown in this
   * form, but read back if the selected material is later deleted, so they can't be left stale from
   * whatever material was previously selected. Matches the recovery fields the main Fixture form's
   * material selector copies (`heat-balance/losses/fixture/fixture-form.component.ts`).
   */
  private withMaterial(loss: FixtureLoss, materialName: number | undefined): FixtureLoss {
    if (materialName === undefined) {
      return { ...loss, materialName: undefined, specificHeat: undefined, latentHeat: undefined, meltingPoint: undefined, specificHeatLiquid: undefined };
    }
    const material = this.materials().find(candidate => candidate.id === materialName);
    if (!material) {
      return { ...loss, materialName };
    }
    const settings = this.settings();
    return {
      ...loss,
      materialName,
      specificHeat: convertDbValue(material.specificHeatSolid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      latentHeat: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, settings),
      meltingPoint: convertDbValue(material.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, settings),
      specificHeatLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
    };
  }

  private materialSubstance(materialId: number | undefined): string | undefined {
    return this.materials().find(material => material.id === materialId)?.substance;
  }
}
