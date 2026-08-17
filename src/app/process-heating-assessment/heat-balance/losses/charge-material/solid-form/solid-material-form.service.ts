import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';
import {
  ChargeMaterial,
  ChargeMaterialType,
  SolidChargeMaterial,
  ThermicReactionType,
} from '../../../../../shared/models/phast/losses/chargeMaterial';
import { applyInitialTempMaxValidator } from '../charge-material-form.util';

export type SolidMaterialForm = FormGroup<{
  materialId: FormControl<number | null>;
  materialSpecificHeatOfSolidMaterial: FormControl<number | null>;
  materialLatentHeatOfFusion: FormControl<number | null>;
  materialHeatOfLiquid: FormControl<number | null>;
  materialMeltingPoint: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  waterContentAsCharged: FormControl<number | null>;
  waterContentAsDischarged: FormControl<number | null>;
  initialTemperature: FormControl<number | null>;
  chargeMaterialDischargeTemperature: FormControl<number | null>;
  waterVaporDischargeTemperature: FormControl<number | null>;
  percentChargeMelted: FormControl<number | null>;
  percentChargeReacted: FormControl<number | null>;
  heatOfReaction: FormControl<number | null>;
  endothermicOrExothermic: FormControl<ThermicReactionType | null>;
  additionalHeatRequired: FormControl<number | null>;
}>;

export interface SolidMaterialWarnings {
  dischargeAboveMeltingPointNoMeltPercent: string | null;
  dischargeBelowMeltingPointWithMeltPercent: string | null;
}

export const EMPTY_WARNINGS: SolidMaterialWarnings = {
  dischargeAboveMeltingPointNoMeltPercent: null,
  dischargeBelowMeltingPointWithMeltPercent: null,
};

@Injectable()
export class SolidMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  getSolidChargeMaterialForm(chargeMaterial: ChargeMaterial): SolidMaterialForm {
    const solid = chargeMaterial.solidChargeMaterial ?? {};
    const form: SolidMaterialForm = this.formBuilder.group({
      materialId: [solid.materialId ?? 1, Validators.required],
      materialSpecificHeatOfSolidMaterial: [solid.specificHeatSolid ?? null, [Validators.required, Validators.min(0)]],
      materialLatentHeatOfFusion: [solid.latentHeat ?? null, [Validators.required, Validators.min(0)]],
      materialHeatOfLiquid: [solid.specificHeatLiquid ?? null, [Validators.required, Validators.min(0)]],
      materialMeltingPoint: [solid.meltingPoint ?? null, Validators.required],
      feedRate: [solid.chargeFeedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      waterContentAsCharged: [solid.waterContentCharged ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      waterContentAsDischarged: [solid.waterContentDischarged ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      initialTemperature: [solid.initialTemperature ?? null, Validators.required],
      chargeMaterialDischargeTemperature: [solid.dischargeTemperature ?? null, Validators.required],
      waterVaporDischargeTemperature: [solid.waterVaporDischargeTemperature ?? 0, Validators.required],
      percentChargeMelted: [solid.chargeMelted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentChargeReacted: [solid.chargeReacted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatOfReaction: [solid.reactionHeat ?? 0, [Validators.required, Validators.min(0)]],
      endothermicOrExothermic: [solid.thermicReactionType ?? ThermicReactionType.Endothermic, Validators.required],
      additionalHeatRequired: [solid.additionalHeat ?? 0, Validators.required],
    });
    return this.setInitialTempValidator(form);
  }

  setInitialTempValidator(form: SolidMaterialForm): SolidMaterialForm {
    applyInitialTempMaxValidator(form.controls.initialTemperature, form.controls.chargeMaterialDischargeTemperature.value);
    return form;
  }

  buildSolidChargeMaterial(form: SolidMaterialForm): ChargeMaterial {
    const v = form.getRawValue();
    const solidChargeMaterial: SolidChargeMaterial = {
      materialId: v.materialId,
      specificHeatSolid: v.materialSpecificHeatOfSolidMaterial,
      latentHeat: v.materialLatentHeatOfFusion,
      specificHeatLiquid: v.materialHeatOfLiquid,
      meltingPoint: v.materialMeltingPoint,
      chargeFeedRate: v.feedRate,
      waterContentCharged: v.waterContentAsCharged,
      waterContentDischarged: v.waterContentAsDischarged,
      initialTemperature: v.initialTemperature,
      dischargeTemperature: v.chargeMaterialDischargeTemperature,
      waterVaporDischargeTemperature: v.waterVaporDischargeTemperature,
      chargeMelted: v.percentChargeMelted,
      chargeReacted: v.percentChargeReacted,
      reactionHeat: v.heatOfReaction,
      thermicReactionType: v.endothermicOrExothermic,
      additionalHeat: v.additionalHeatRequired,
    };
    return { chargeMaterialType: ChargeMaterialType.Solid, solidChargeMaterial };
  }

  checkSolidWarnings(solid: SolidChargeMaterial): SolidMaterialWarnings {
    if (!solid || solid.dischargeTemperature == null || solid.meltingPoint == null) return EMPTY_WARNINGS;
    const { dischargeTemperature, meltingPoint, chargeMelted } = solid;
    return {
      dischargeAboveMeltingPointNoMeltPercent: (dischargeTemperature > meltingPoint && chargeMelted === 0)
        ? `The Charge Outlet Temperature is higher than the melting point, please enter proper percentage for charge melted.`
        : null,
      dischargeBelowMeltingPointWithMeltPercent: (dischargeTemperature < meltingPoint && chargeMelted > 0)
        ? `The Charge Outlet Temperature is lower than the melting point, the percentage for charge melted should be 0%.`
        : null,
    };
  }
}
