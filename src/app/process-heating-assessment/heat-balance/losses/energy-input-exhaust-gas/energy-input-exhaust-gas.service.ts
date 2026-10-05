import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { EnergyInputExhaustGasCalculationService } from './energy-input-exhaust-gas-calculation.service';
import { EnergyInputExhaustGasForm, EnergyInputExhaustGasFormService } from './energy-input-exhaust-gas-form.service';

export type EnergyInputExhaustGasItem = LossFormItem<EnergyInputExhaustGasForm>;

@Injectable()
export class EnergyInputExhaustGasService extends LossFormListService<EnergyInputExhaustGasLoss, EnergyInputExhaustGasForm> {
  private readonly calculationService = inject(EnergyInputExhaustGasCalculationService);
  private readonly formService = inject(EnergyInputExhaustGasFormService);

  protected readonly lossKey: keyof Losses = 'energyInputExhaustGasLoss';

  readonly losses: Signal<EnergyInputExhaustGasItem[]> = this.items;

  protected buildForm(loss: EnergyInputExhaustGasLoss): EnergyInputExhaustGasForm {
    return this.formService.getEnergyInputExhaustGasForm(loss);
  }

  protected buildLoss(form: EnergyInputExhaustGasForm): EnergyInputExhaustGasLoss {
    return this.formService.buildEnergyInputExhaustGasLoss(form);
  }

  protected calculateResult(form: EnergyInputExhaustGasForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildEnergyInputExhaustGasLoss(form), settings).exhaustGasLosses;
  }
}
