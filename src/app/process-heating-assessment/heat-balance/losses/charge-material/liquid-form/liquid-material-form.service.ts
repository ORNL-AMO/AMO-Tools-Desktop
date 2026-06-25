import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, ChargeMaterialType, LiquidChargeMaterial, ThermicReactionType } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';

export type LiquidMaterialForm = FormGroup<{
  materialId: FormControl<number | null>;
  materialSpecificHeatLiquid: FormControl<number | null>;
  materialVaporizingTemperature: FormControl<number | null>;
  materialLatentHeat: FormControl<number | null>;
  materialSpecificHeatVapor: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  initialTemperature: FormControl<number | null>;
  dischargeTemperature: FormControl<number | null>;
  liquidVaporized: FormControl<number | null>;
  liquidReacted: FormControl<number | null>;
  heatOfReaction: FormControl<number | null>;
  endothermicOrExothermic: FormControl<ThermicReactionType | null>;
  additionalHeatRequired: FormControl<number | null>;
  name: FormControl<string | null>;
}>;

@Injectable()
export class LiquidMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  initLiquidForm(lossNumber: number = 1): LiquidMaterialForm {
    return this.formBuilder.group({
      materialId: new FormControl<number | null>(1, Validators.required),
      materialSpecificHeatLiquid: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      materialVaporizingTemperature: new FormControl<number | null>(null, Validators.required),
      materialLatentHeat: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      materialSpecificHeatVapor: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      feedRate: new FormControl<number | null>(null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      initialTemperature: new FormControl<number | null>(null, Validators.required),
      dischargeTemperature: new FormControl<number | null>(null, Validators.required),
      liquidVaporized: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      liquidReacted: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<ThermicReactionType | null>(ThermicReactionType.Endothermic, Validators.required),
      additionalHeatRequired: new FormControl<number | null>(0, Validators.required),
      name: new FormControl<string | null>(`Material #${lossNumber}`, Validators.required),
    }) as LiquidMaterialForm;
  }

  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial): LiquidMaterialForm {
    const liquid = chargeMaterial.liquidChargeMaterial;
    const formGroup = this.formBuilder.group({
      materialId: new FormControl<number | null>(liquid.materialId ?? null, Validators.required),
      materialSpecificHeatLiquid: new FormControl<number | null>(liquid.specificHeatLiquid ?? null, [Validators.required, Validators.min(0)]),
      materialVaporizingTemperature: new FormControl<number | null>(liquid.vaporizingTemperature ?? null, Validators.required),
      materialLatentHeat: new FormControl<number | null>(liquid.latentHeat ?? null, [Validators.required, Validators.min(0)]),
      materialSpecificHeatVapor: new FormControl<number | null>(liquid.specificHeatVapor ?? null, [Validators.required, Validators.min(0)]),
      feedRate: new FormControl<number | null>(liquid.chargeFeedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      initialTemperature: new FormControl<number | null>(liquid.initialTemperature ?? null, Validators.required),
      dischargeTemperature: new FormControl<number | null>(liquid.dischargeTemperature ?? null, Validators.required),
      liquidVaporized: new FormControl<number | null>(liquid.percentVaporized ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      liquidReacted: new FormControl<number | null>(liquid.percentReacted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(liquid.reactionHeat ?? 0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<ThermicReactionType | null>(liquid.thermicReactionType ?? ThermicReactionType.Endothermic, Validators.required),
      additionalHeatRequired: new FormControl<number | null>(liquid.additionalHeat ?? 0, Validators.required),
      name: new FormControl<string | null>(chargeMaterial.name ?? null, Validators.required),
    }) as LiquidMaterialForm;
    return this.setInitialTempValidator(formGroup);
  }

  setInitialTempValidator(formGroup: LiquidMaterialForm): LiquidMaterialForm {
    const dischargeTemperature = formGroup.controls.dischargeTemperature.value;
    if (dischargeTemperature !== null) {
      formGroup.controls.initialTemperature.setValidators([Validators.required, Validators.max(dischargeTemperature)]);
      formGroup.controls.initialTemperature.markAsDirty();
      formGroup.controls.initialTemperature.updateValueAndValidity({ emitEvent: false });
    }
    return formGroup;
  }

  buildLiquidChargeMaterial(liquidForm: LiquidMaterialForm): ChargeMaterial {
    const value = liquidForm.getRawValue();
    return {
      name: value.name ?? undefined,
      chargeMaterialType: ChargeMaterialType.Liquid,
      liquidChargeMaterial: {
        materialId: value.materialId ?? undefined,
        thermicReactionType: value.endothermicOrExothermic ?? undefined,
        specificHeatLiquid: value.materialSpecificHeatLiquid ?? undefined,
        vaporizingTemperature: value.materialVaporizingTemperature ?? undefined,
        latentHeat: value.materialLatentHeat ?? undefined,
        specificHeatVapor: value.materialSpecificHeatVapor ?? undefined,
        chargeFeedRate: value.feedRate ?? undefined,
        initialTemperature: value.initialTemperature ?? undefined,
        dischargeTemperature: value.dischargeTemperature ?? undefined,
        percentVaporized: value.liquidVaporized ?? undefined,
        percentReacted: value.liquidReacted ?? undefined,
        reactionHeat: value.heatOfReaction ?? undefined,
        additionalHeat: value.additionalHeatRequired ?? undefined,
      },
    };
  }

  checkLiquidWarnings(material: LiquidChargeMaterial): LiquidMaterialWarnings {
    return {
      dischargeTempWarning: this.checkDischargeTemp(material),
      inletOverVaporizingWarning: this.checkInletOverVaporizing(material),
      outletOverVaporizingWarning: this.checkOutletOverVaporizing(material),
    };
  }

  checkDischargeTemp(material: LiquidChargeMaterial): string | null {
    if (material.dischargeTemperature > material.vaporizingTemperature && material.percentVaporized === 0) {
      return 'The Charge Outlet Temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    }
    if (material.dischargeTemperature < material.vaporizingTemperature && material.percentVaporized > 0) {
      return 'The Charge Outlet Temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    }
    return null;
  }

  checkInletOverVaporizing(material: LiquidChargeMaterial): string | null {
    if (material.initialTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return 'The Charge Inlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.';
    }
    return null;
  }

  checkOutletOverVaporizing(material: LiquidChargeMaterial): string | null {
    if (material.dischargeTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return 'The Charge Outlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.';
    }
    return null;
  }
}

export interface LiquidMaterialWarnings {
  dischargeTempWarning: string | null;
  inletOverVaporizingWarning: string | null;
  outletOverVaporizingWarning: string | null;
}
