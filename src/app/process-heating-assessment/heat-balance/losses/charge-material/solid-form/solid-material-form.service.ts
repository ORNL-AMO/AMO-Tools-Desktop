import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, ChargeMaterialType, SolidChargeMaterial, ThermicReactionType } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';

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
  name: FormControl<string | null>;
}>;

@Injectable()
export class SolidMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  initSolidForm(lossNumber: number = 1): SolidMaterialForm {
    return this.formBuilder.group({
      materialId: new FormControl<number | null>(1, Validators.required),
      materialSpecificHeatOfSolidMaterial: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      materialLatentHeatOfFusion: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      materialHeatOfLiquid: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      materialMeltingPoint: new FormControl<number | null>(null, Validators.required),
      feedRate: new FormControl<number | null>(null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      waterContentAsCharged: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      waterContentAsDischarged: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      initialTemperature: new FormControl<number | null>(null, Validators.required),
      chargeMaterialDischargeTemperature: new FormControl<number | null>(null, Validators.required),
      waterVaporDischargeTemperature: new FormControl<number | null>(0, Validators.required),
      percentChargeMelted: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      percentChargeReacted: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<ThermicReactionType | null>(ThermicReactionType.Endothermic, Validators.required),
      additionalHeatRequired: new FormControl<number | null>(0, Validators.required),
      name: new FormControl<string | null>(`Material #${lossNumber}`, Validators.required),
    }) as SolidMaterialForm;
  }

  getSolidChargeMaterialForm(chargeMaterial: ChargeMaterial): SolidMaterialForm {
    const solid = chargeMaterial.solidChargeMaterial;
    const formGroup = this.formBuilder.group({
      materialId: new FormControl<number | null>(solid.materialId ?? null, Validators.required),
      materialSpecificHeatOfSolidMaterial: new FormControl<number | null>(solid.specificHeatSolid ?? null, [Validators.required, Validators.min(0)]),
      materialLatentHeatOfFusion: new FormControl<number | null>(solid.latentHeat ?? null, [Validators.required, Validators.min(0)]),
      materialHeatOfLiquid: new FormControl<number | null>(solid.specificHeatLiquid ?? null, [Validators.required, Validators.min(0)]),
      materialMeltingPoint: new FormControl<number | null>(solid.meltingPoint ?? null, Validators.required),
      feedRate: new FormControl<number | null>(solid.chargeFeedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      waterContentAsCharged: new FormControl<number | null>(solid.waterContentCharged ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      waterContentAsDischarged: new FormControl<number | null>(solid.waterContentDischarged ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      initialTemperature: new FormControl<number | null>(solid.initialTemperature ?? null, Validators.required),
      chargeMaterialDischargeTemperature: new FormControl<number | null>(solid.dischargeTemperature ?? null, Validators.required),
      waterVaporDischargeTemperature: new FormControl<number | null>(solid.waterVaporDischargeTemperature ?? 0, Validators.required),
      percentChargeMelted: new FormControl<number | null>(solid.chargeMelted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      percentChargeReacted: new FormControl<number | null>(solid.chargeReacted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(solid.reactionHeat ?? 0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<ThermicReactionType | null>(solid.thermicReactionType ?? ThermicReactionType.Endothermic, Validators.required),
      additionalHeatRequired: new FormControl<number | null>(solid.additionalHeat ?? 0, Validators.required),
      name: new FormControl<string | null>(chargeMaterial.name ?? null, Validators.required),
    }) as SolidMaterialForm;
    return this.setInitialTempValidator(formGroup);
  }

  setInitialTempValidator(formGroup: SolidMaterialForm): SolidMaterialForm {
    const dischargeTemperature = formGroup.controls.chargeMaterialDischargeTemperature.value;
    if (dischargeTemperature !== null) {
      formGroup.controls.initialTemperature.setValidators([Validators.required, Validators.max(dischargeTemperature)]);
      formGroup.controls.initialTemperature.markAsDirty();
      formGroup.controls.initialTemperature.updateValueAndValidity({ emitEvent: false });
    }
    return formGroup;
  }

  buildSolidChargeMaterial(solidForm: SolidMaterialForm): ChargeMaterial {
    const value = solidForm.getRawValue();
    return {
      name: value.name ?? undefined,
      chargeMaterialType: ChargeMaterialType.Solid,
      solidChargeMaterial: {
        materialId: value.materialId ?? undefined,
        thermicReactionType: value.endothermicOrExothermic ?? undefined,
        specificHeatSolid: value.materialSpecificHeatOfSolidMaterial ?? undefined,
        latentHeat: value.materialLatentHeatOfFusion ?? undefined,
        specificHeatLiquid: value.materialHeatOfLiquid ?? undefined,
        meltingPoint: value.materialMeltingPoint ?? undefined,
        chargeFeedRate: value.feedRate ?? undefined,
        waterContentCharged: value.waterContentAsCharged ?? undefined,
        waterContentDischarged: value.waterContentAsDischarged ?? undefined,
        initialTemperature: value.initialTemperature ?? undefined,
        dischargeTemperature: value.chargeMaterialDischargeTemperature ?? undefined,
        waterVaporDischargeTemperature: value.waterVaporDischargeTemperature ?? undefined,
        chargeMelted: value.percentChargeMelted ?? undefined,
        chargeReacted: value.percentChargeReacted ?? undefined,
        reactionHeat: value.heatOfReaction ?? undefined,
        additionalHeat: value.additionalHeatRequired ?? undefined,
      },
    };
  }

  checkSolidWarnings(material: SolidChargeMaterial): SolidMaterialWarnings {
    return { dischargeTempWarning: this.checkDischargeTemperature(material) };
  }

  checkDischargeTemperature(material: SolidChargeMaterial): string | null {
    if (material.dischargeTemperature > material.meltingPoint && material.chargeMelted === 0) {
      return 'The Charge Outlet Temperature is higher than the melting point, please enter proper percentage for charge melted.';
    }
    if (material.dischargeTemperature < material.meltingPoint && material.chargeMelted > 0) {
      return 'The Charge Outlet Temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    }
    return null;
  }
}

export interface SolidMaterialWarnings {
  dischargeTempWarning: string | null;
}
