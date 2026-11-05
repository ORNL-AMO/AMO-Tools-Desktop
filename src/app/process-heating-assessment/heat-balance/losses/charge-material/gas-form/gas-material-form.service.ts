import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';
import {
  ChargeMaterial,
  ChargeMaterialType,
  GasChargeMaterial,
  ThermicReactionType,
} from '../../../../../shared/models/phast/losses/chargeMaterial';
import { applyInitialTempMaxValidator } from '../charge-material-form.util';

export type GasMaterialForm = FormGroup<{
  materialId: FormControl<number | null>;
  specificHeatOfGas: FormControl<number | null>;
  feedRate: FormControl<number | null>;
  percentVaporInGasMixture: FormControl<number | null>;
  initialTemperature: FormControl<number | null>;
  chargeMaterialDischargeTemperature: FormControl<number | null>;
  specificHeatOfVapor: FormControl<number | null>;
  percentChargeReacted: FormControl<number | null>;
  heatOfReaction: FormControl<number | null>;
  endothermicOrExothermic: FormControl<ThermicReactionType | null>;
  additionalHeatRequired: FormControl<number | null>;
}>;

/** Starting values for a new material; a saved one rebuilds from exactly what was saved so a cleared field stays invalid. */
const NEW_GAS_MATERIAL: GasChargeMaterial = { materialId: 1, percentVapor: 0, specificHeatVapor: 0, percentReacted: 0, reactionHeat: 0, thermicReactionType: ThermicReactionType.Endothermic, additionalHeat: 0 };

@Injectable()
export class GasMaterialFormService {
  private readonly formBuilder = inject(FormBuilder);

  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial): GasMaterialForm {
    const gas = chargeMaterial.gasChargeMaterial ?? NEW_GAS_MATERIAL;
    const form: GasMaterialForm = this.formBuilder.group({
      materialId: [gas.materialId ?? null, Validators.required],
      specificHeatOfGas: [gas.specificHeatGas ?? null, [Validators.required, Validators.min(0)]],
      feedRate: [gas.feedRate ?? null, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      percentVaporInGasMixture: [gas.percentVapor ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      initialTemperature: [gas.initialTemperature ?? null, Validators.required],
      chargeMaterialDischargeTemperature: [gas.dischargeTemperature ?? null, Validators.required],
      specificHeatOfVapor: [gas.specificHeatVapor ?? null, [Validators.required, Validators.min(0)]],
      percentChargeReacted: [gas.percentReacted ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatOfReaction: [gas.reactionHeat ?? null, [Validators.required, Validators.min(0)]],
      endothermicOrExothermic: [gas.thermicReactionType ?? null, Validators.required],
      additionalHeatRequired: [gas.additionalHeat ?? null, Validators.required],
    });
    return this.setInitialTempValidator(form);
  }

  setInitialTempValidator(form: GasMaterialForm): GasMaterialForm {
    applyInitialTempMaxValidator(form.controls.initialTemperature, form.controls.chargeMaterialDischargeTemperature.value);
    return form;
  }

  buildGasChargeMaterial(form: GasMaterialForm): ChargeMaterial {
    const v = form.getRawValue();
    const gasChargeMaterial: GasChargeMaterial = {
      materialId: v.materialId,
      specificHeatGas: v.specificHeatOfGas,
      feedRate: v.feedRate,
      percentVapor: v.percentVaporInGasMixture,
      initialTemperature: v.initialTemperature,
      dischargeTemperature: v.chargeMaterialDischargeTemperature,
      specificHeatVapor: v.specificHeatOfVapor,
      percentReacted: v.percentChargeReacted,
      reactionHeat: v.heatOfReaction,
      thermicReactionType: v.endothermicOrExothermic,
      additionalHeat: v.additionalHeatRequired,
    };
    return { chargeMaterialType: ChargeMaterialType.Gas, gasChargeMaterial };
  }

  // No warnings for gas — intentional, see spec §4.3.
}
