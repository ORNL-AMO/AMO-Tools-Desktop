import { inject, Injectable, Signal } from '@angular/core';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { EnergyInputCalculationService } from './energy-input-calculation.service';
import { EnergyInputForm, EnergyInputFormService } from './energy-input-form.service';

export type EnergyInputItem = LossFormItem<EnergyInputForm>;

@Injectable()
export class EnergyInputService extends LossFormListService<EnergyInputEAF, EnergyInputForm> {
  private readonly calculationService = inject(EnergyInputCalculationService);
  private readonly formService = inject(EnergyInputFormService);

  protected readonly lossKey: keyof Losses = 'energyInputEAF';

  readonly losses: Signal<EnergyInputItem[]> = this.items;

  protected buildForm(loss: EnergyInputEAF): EnergyInputForm {
    return this.formService.getEnergyInputForm(loss, this.assessmentService.settingsSignal());
  }

  protected buildLoss(form: EnergyInputForm): EnergyInputEAF {
    return this.formService.buildEnergyInput(form);
  }

  protected calculateResult(form: EnergyInputForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildEnergyInput(form), settings);
  }
}
