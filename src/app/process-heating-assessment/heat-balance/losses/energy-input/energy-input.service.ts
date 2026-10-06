import { inject, Injectable, Signal, signal } from '@angular/core';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { Losses } from '../../../models/phast';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { LossFormItem, LossFormListService } from '../loss-form-list.service';
import { EnergyInputCalculationService } from './energy-input-calculation.service';
import { EnergyInputForm, EnergyInputFormService, EnergyInputWarnings } from './energy-input-form.service';

export type EnergyInputItem = LossFormItem<EnergyInputForm>;

@Injectable()
export class EnergyInputService extends LossFormListService<EnergyInputEAF, EnergyInputForm> {
  private readonly calculationService = inject(EnergyInputCalculationService);
  private readonly formService = inject(EnergyInputFormService);
  private readonly resultsService = inject(ProcessHeatingResultsService);

  protected readonly lossKey: keyof Losses = 'energyInputEAF';

  readonly losses: Signal<EnergyInputItem[]> = this.items;
  readonly warnings = signal<EnergyInputWarnings>({ electricityInput: null, heatDelivered: null });

  protected buildForm(loss: EnergyInputEAF): EnergyInputForm {
    return this.formService.getEnergyInputForm(loss, this.assessmentService.settingsSignal());
  }

  protected buildLoss(form: EnergyInputForm): EnergyInputEAF {
    return this.formService.buildEnergyInput(form);
  }

  protected calculateResult(form: EnergyInputForm, settings: Settings): number {
    return this.calculationService.calculate(this.formService.buildEnergyInput(form), settings);
  }

  /**
   * The minimum electricity input and warnings depend on the scenario's other losses and fuel inputs, so refresh them after each save.
   * The minimum is pushed into each form imperatively and `refreshResults()` patches the cached `heatLoss` that depends on form validity,
   * so the displayed result can be ahead of the saved one until the next save. Deriving the minimum as state (a computed read by the
   * validator) would remove this ordering dependency.
   */
  protected override onLossesChanged(): void {
    const phast = this.assessmentService.scenarioPhast(this.scenario);
    const settings = this.assessmentService.settingsSignal();
    const results = phast && settings ? this.resultsService.getResults(phast, settings) : undefined;
    const minElectricityInput = this.formService.getMinElectricityInput(results, settings);
    this.items().forEach(item => this.formService.setMinElectricityInput(item.form, minElectricityInput));
    this.refreshResults();
    // Results default to zero, which would trip the electricity warning before there is a valid entry to warn about
    const hasValidEntry = this.items().some(item => item.form.valid);
    this.warnings.set(this.formService.getWarnings(hasValidEntry ? results : undefined));
  }
}
