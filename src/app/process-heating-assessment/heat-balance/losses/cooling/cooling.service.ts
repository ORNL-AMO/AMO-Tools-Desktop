import { inject, Injectable, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { CoolingCalculationService } from './cooling-calculation.service';
import { CoolingForm, CoolingFormService, CoolingMedium, isGasCoolingForm, isGasMedium } from './cooling-form.service';

export type CoolingItem = LossFormItem<CoolingForm>;

@Injectable()
export class CoolingService extends LossFormListService<CoolingLoss, CoolingForm> {
  private readonly calculationService = inject(CoolingCalculationService);
  private readonly formService = inject(CoolingFormService);

  protected readonly lossKey: keyof Losses = 'coolingLosses';

  readonly losses: Signal<CoolingItem[]> = this.items;

  /**
   * Air ↔ Other Gas and Water ↔ Other Liquid only change the saved type. Crossing gas ↔ liquid
   * replaces the form, discarding the other medium's values.
   */
  switchMedium(id: string, medium: CoolingMedium): void {
    const item = this.losses().find(candidate => candidate.id === id);
    if (!item) return;
    if (isGasCoolingForm(item.form) === isGasMedium(medium)) {
      (item.form.controls.coolingLossType as FormControl<CoolingMedium>).setValue(medium);
      return;
    }
    const settings = this.assessmentService.settingsSignal();
    this.replaceForm(id, this.formService.getCoolingForm({
      coolingLossType: medium,
      coolingMedium: item.form.controls.coolingMedium.value ?? undefined,
    }, settings));
  }

  protected buildForm(loss: CoolingLoss): CoolingForm {
    return this.formService.getCoolingForm(loss, this.assessmentService.settingsSignal());
  }

  protected buildLoss(form: CoolingForm): CoolingLoss {
    return this.formService.buildCoolingLoss(form);
  }

  /**
   * Calculates every medium, as legacy's cooling form does. Legacy's results total
   * (`PhastService.sumCoolingLosses()`) only counts 'Gas' and 'Liquid', so Other Gas / Other Liquid
   * losses show a heat loss here but add 0 to the results panel. Kept to match legacy until that
   * total is fixed.
   */
  protected calculateResult(form: CoolingForm, settings: Settings): number {
    const loss = this.formService.buildCoolingLoss(form);
    return isGasCoolingForm(form)
      ? this.calculationService.calculateGas(loss.gasCoolingLoss, settings)
      : this.calculationService.calculateLiquid(loss.liquidCoolingLoss, settings);
  }
}
