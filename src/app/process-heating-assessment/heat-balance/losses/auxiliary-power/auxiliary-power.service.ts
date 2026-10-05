import { inject, Injectable, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AuxiliaryPowerLoss } from '../../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Losses } from '../../../models/phast';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { AuxiliaryPowerCalculationService } from './auxiliary-power-calculation.service';
import { AuxiliaryPowerForm, AuxiliaryPowerFormService } from './auxiliary-power-form.service';

export type AuxiliaryPowerItem = LossFormItem<AuxiliaryPowerForm>;

@Injectable()
export class AuxiliaryPowerService extends LossFormListService<AuxiliaryPowerLoss, AuxiliaryPowerForm> {
  private readonly calculationService = inject(AuxiliaryPowerCalculationService);
  private readonly formService = inject(AuxiliaryPowerFormService);

  protected readonly lossKey: keyof Losses = 'auxiliaryPowerLosses';

  readonly losses: Signal<AuxiliaryPowerItem[]> = this.items;

  protected buildForm(loss: AuxiliaryPowerLoss): AuxiliaryPowerForm {
    return this.formService.getAuxiliaryPowerForm(loss);
  }

  protected buildLoss(form: AuxiliaryPowerForm): AuxiliaryPowerLoss {
    return this.formService.buildAuxiliaryPowerLoss(form);
  }

  protected calculateResult(form: AuxiliaryPowerForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildAuxiliaryPowerLoss(form), settings);
  }
}
