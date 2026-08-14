import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';
import {
  ChargeMaterial,
  ChargeMaterialType,
  LiquidChargeMaterial,
  ThermicReactionType,
} from '../../../../../shared/models/phast/losses/chargeMaterial';
import { applyInitialTempMaxValidator } from '../charge-material-form.util';

export type LiquidMaterialForm = FormGroup<{
  materialId: FormControl<number | null>;
  specificHeatOfLiquid: FormControl<number | null>;
  vaporizingTemperature: FormControl<number | null>;
  latentHeatOfVaporization: FormControl<number | null>;
  specificHeatOfVapor: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  initialTemperature: FormControl<number | null>;
  chargeMaterialDischargeTemperature: FormControl<number | null>;
  percentChargeVaporized: FormControl<number | null>;
  percentChargeReacted: FormControl<number | null>;
  heatOfReaction: FormControl<number | null>;
  endothermicOrExothermic: FormControl<ThermicReactionType | null>;
  additionalHeatRequired: FormControl<number | null>;
}>;

export interface LiquidMaterialWarnings {
  dischargeAboveVaporizingNoVaporPercent: string | null;
  dischargeBelowVaporizingWithVaporPercent: string | null;
  initialAboveVaporizingNoVaporPercent: string | null;
  dischargeAboveVaporizingNoVaporPercentAlt: string | null;
}

export const EMPTY_WARNINGS: LiquidMaterialWarnings = {
  dischargeAboveVaporizingNoVaporPercent: null,
  dischargeBelowVaporizingWithVaporPercent: null,
  initialAboveVaporizingNoVaporPercent: null,
  dischargeAboveVaporizingNoVaporPercentAlt: null,
};

@Injectable()
export class LiquidMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial): LiquidMaterialForm {
    const liquid = chargeMaterial.liquidChargeMaterial ?? {};
    const form: LiquidMaterialForm = this.formBuilder.group({
      materialId: [liquid.materialId ?? 1, Validators.required],
      specificHeatOfLiquid: [liquid.specificHeatLiquid ?? null, [Validators.required, Validators.min(0)]],
      vaporizingTemperature: [liquid.vaporizingTemperature ?? null, Validators.required],
      latentHeatOfVaporization: [liquid.latentHeat ?? null, [Validators.required, Validators.min(0)]],
      specificHeatOfVapor: [liquid.specificHeatVapor ?? null, [Validators.required, Validators.min(0)]],
      feedRate: [liquid.chargeFeedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      initialTemperature: [liquid.initialTemperature ?? null, Validators.required],
      chargeMaterialDischargeTemperature: [liquid.dischargeTemperature ?? null, Validators.required],
      percentChargeVaporized: [liquid.percentVaporized ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentChargeReacted: [liquid.percentReacted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatOfReaction: [liquid.reactionHeat ?? 0, [Validators.required, Validators.min(0)]],
      endothermicOrExothermic: [liquid.thermicReactionType ?? ThermicReactionType.Endothermic, Validators.required],
      additionalHeatRequired: [liquid.additionalHeat ?? 0, Validators.required],
    });
    return this.setInitialTempValidator(form);
  }

  setInitialTempValidator(form: LiquidMaterialForm): LiquidMaterialForm {
    applyInitialTempMaxValidator(form.controls.initialTemperature, form.controls.chargeMaterialDischargeTemperature.value);
    return form;
  }

  buildLiquidChargeMaterial(form: LiquidMaterialForm): ChargeMaterial {
    const v = form.getRawValue();
    const liquidChargeMaterial: LiquidChargeMaterial = {
      materialId: v.materialId,
      specificHeatLiquid: v.specificHeatOfLiquid,
      vaporizingTemperature: v.vaporizingTemperature,
      latentHeat: v.latentHeatOfVaporization,
      specificHeatVapor: v.specificHeatOfVapor,
      chargeFeedRate: v.feedRate,
      initialTemperature: v.initialTemperature,
      dischargeTemperature: v.chargeMaterialDischargeTemperature,
      percentVaporized: v.percentChargeVaporized,
      percentReacted: v.percentChargeReacted,
      reactionHeat: v.heatOfReaction,
      thermicReactionType: v.endothermicOrExothermic,
      additionalHeat: v.additionalHeatRequired,
    };
    return { chargeMaterialType: ChargeMaterialType.Liquid, liquidChargeMaterial };
  }

  checkLiquidWarnings(liquid: LiquidChargeMaterial): LiquidMaterialWarnings {
    if (!liquid || liquid.vaporizingTemperature == null) return EMPTY_WARNINGS;
    const { dischargeTemperature, initialTemperature, vaporizingTemperature, percentVaporized } = liquid;
    // Compare the raw field, not a `?? 0`-normalized copy: a genuinely missing percentVaporized
    // (e.g. an older saved record) should not trip these warnings, matching the pre-rewrite
    // behavior where comparisons against `undefined` were always false.
    return {
      dischargeAboveVaporizingNoVaporPercent: (dischargeTemperature > vaporizingTemperature && percentVaporized === 0)
        ? `The Charge Outlet Temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.`
        : null,
      dischargeBelowVaporizingWithVaporPercent: (dischargeTemperature < vaporizingTemperature && percentVaporized > 0)
        ? `The Charge Outlet Temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.`
        : null,
      initialAboveVaporizingNoVaporPercent: (initialTemperature > vaporizingTemperature && percentVaporized <= 0)
        ? `The Charge Inlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.`
        : null,
      dischargeAboveVaporizingNoVaporPercentAlt: (dischargeTemperature > vaporizingTemperature && percentVaporized <= 0)
        ? `The Charge Outlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.`
        : null,
    };
  }
}
