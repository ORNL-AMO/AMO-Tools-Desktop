import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { CoolingItem, CoolingService } from './cooling.service';
import { CoolingFormService, CoolingMedium, GasCoolingForm, isGasCoolingForm, LiquidCoolingForm } from './cooling-form.service';
import { CoolingCalculationService } from './cooling-calculation.service';

@Component({
  selector: 'app-cooling',
  standalone: false,
  templateUrl: './cooling.component.html',
  styleUrl: './cooling.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CoolingService, CoolingFormService, CoolingCalculationService],
})
export class CoolingComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(CoolingService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly mediumOptions: { value: CoolingMedium; label: string }[] = [
    { value: CoolingMedium.Air, label: 'Air' },
    { value: CoolingMedium.Water, label: 'Water' },
    { value: CoolingMedium.OtherGas, label: 'Other Gas' },
    { value: CoolingMedium.OtherLiquid, label: 'Other Liquid' },
  ];

  gasForm(item: CoolingItem): GasCoolingForm | null {
    return isGasCoolingForm(item.form) ? item.form : null;
  }

  liquidForm(item: CoolingItem): LiquidCoolingForm | null {
    return isGasCoolingForm(item.form) ? null : item.form;
  }

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
