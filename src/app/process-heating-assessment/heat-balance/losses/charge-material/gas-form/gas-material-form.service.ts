import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, ChargeMaterialType, ThermicReactionType } from '../../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';

export type GasMaterialForm = FormGroup<{
  materialId: FormControl<number | null>;
  materialSpecificHeat: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  vaporInGas: FormControl<number | null>;
  initialTemperature: FormControl<number | null>;
  dischargeTemperature: FormControl<number | null>;
  specificHeatOfVapor: FormControl<number | null>;
  gasReacted: FormControl<number | null>;
  heatOfReaction: FormControl<number | null>;
  endothermicOrExothermic: FormControl<string | null>;
  additionalHeatRequired: FormControl<number | null>;
  name: FormControl<string | null>;
}>;

@Injectable()
export class GasMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  initGasForm(lossNumber: number = 1): GasMaterialForm {
    return this.formBuilder.group({
      materialId: new FormControl<number | null>(1, Validators.required),
      materialSpecificHeat: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      feedRate: new FormControl<number | null>(null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      vaporInGas: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      initialTemperature: new FormControl<number | null>(null, Validators.required),
      dischargeTemperature: new FormControl<number | null>(null, Validators.required),
      specificHeatOfVapor: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      gasReacted: new FormControl<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<string | null>('Endothermic', Validators.required),
      additionalHeatRequired: new FormControl<number | null>(0, Validators.required),
      name: new FormControl<string | null>(`Material #${lossNumber}`, Validators.required),
    }) as GasMaterialForm;
  }

  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial): GasMaterialForm {
    const gas = chargeMaterial.gasChargeMaterial;
    const reactionTypeLabel = gas.thermicReactionType !== ThermicReactionType.Endothermic ? 'Exothermic' : 'Endothermic';
    const formGroup = this.formBuilder.group({
      materialId: new FormControl<number | null>(gas.materialId ?? null, Validators.required),
      materialSpecificHeat: new FormControl<number | null>(gas.specificHeatGas ?? null, [Validators.required, Validators.min(0)]),
      feedRate: new FormControl<number | null>(gas.feedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]),
      vaporInGas: new FormControl<number | null>(gas.percentVapor ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      initialTemperature: new FormControl<number | null>(gas.initialTemperature ?? null, Validators.required),
      dischargeTemperature: new FormControl<number | null>(gas.dischargeTemperature ?? null, Validators.required),
      specificHeatOfVapor: new FormControl<number | null>(gas.specificHeatVapor ?? 0, [Validators.required, Validators.min(0)]),
      gasReacted: new FormControl<number | null>(gas.percentReacted ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]),
      heatOfReaction: new FormControl<number | null>(gas.reactionHeat ?? 0, [Validators.required, Validators.min(0)]),
      endothermicOrExothermic: new FormControl<string | null>(reactionTypeLabel, Validators.required),
      additionalHeatRequired: new FormControl<number | null>(gas.additionalHeat ?? 0, Validators.required),
      name: new FormControl<string | null>(chargeMaterial.name ?? null, Validators.required),
    }) as GasMaterialForm;
    return this.setInitialTempValidator(formGroup);
  }

  setInitialTempValidator(formGroup: GasMaterialForm): GasMaterialForm {
    const dischargeTemperature = formGroup.controls.dischargeTemperature.value;
    if (dischargeTemperature !== null) {
      formGroup.controls.initialTemperature.setValidators([Validators.required, Validators.max(dischargeTemperature)]);
      formGroup.controls.initialTemperature.markAsDirty();
      formGroup.controls.initialTemperature.updateValueAndValidity({ emitEvent: false });
    }
    return formGroup;
  }

  buildGasChargeMaterial(gasForm: GasMaterialForm): ChargeMaterial {
    const value = gasForm.getRawValue();
    const thermicReactionType = value.endothermicOrExothermic === 'Exothermic' ? ThermicReactionType.Exothermic : ThermicReactionType.Endothermic;
    return {
      name: value.name ?? undefined,
      chargeMaterialType: ChargeMaterialType.Gas,
      gasChargeMaterial: {
        materialId: value.materialId ?? undefined,
        thermicReactionType: thermicReactionType,
        specificHeatGas: value.materialSpecificHeat ?? undefined,
        feedRate: value.feedRate ?? undefined,
        percentVapor: value.vaporInGas ?? undefined,
        initialTemperature: value.initialTemperature ?? undefined,
        dischargeTemperature: value.dischargeTemperature ?? undefined,
        specificHeatVapor: value.specificHeatOfVapor ?? undefined,
        percentReacted: value.gasReacted ?? undefined,
        reactionHeat: value.heatOfReaction ?? undefined,
        additionalHeat: value.additionalHeatRequired ?? undefined,
      },
    };
  }
}
