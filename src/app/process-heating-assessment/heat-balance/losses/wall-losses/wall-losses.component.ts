import { ChangeDetectionStrategy, Component, effect, inject, input, Signal, untracked } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { WallLossesService } from './wall-losses.service';
import { WallLossesFormService } from './wall-losses-form.service';
import { WallLossCalculationService } from './wall-loss-calculation.service';

@Component({
  selector: 'app-wall-losses',
  standalone: false,
  templateUrl: './wall-losses.component.html',
  styleUrl: './wall-losses.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WallLossesService, WallLossesFormService, WallLossCalculationService],
})
export class WallLossesComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(WallLossesService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    effect(() => {
      const scenario = this.scenario();
      untracked(() => {
        const wallLosses = this.assessmentService.scenarioPhast(scenario)?.losses?.wallLosses ?? [];
        this.service.initialize(wallLosses, scenario);
      });
    });
  }
}
