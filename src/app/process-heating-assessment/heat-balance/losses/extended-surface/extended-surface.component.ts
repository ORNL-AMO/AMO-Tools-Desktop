import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { ExtendedSurfaceService } from './extended-surface.service';
import { ExtendedSurfaceFormService } from './extended-surface-form.service';
import { WallLossCalculationService } from '../wall-losses/wall-loss-calculation.service';

@Component({
  selector: 'app-extended-surface',
  standalone: false,
  templateUrl: './extended-surface.component.html',
  styleUrl: './extended-surface.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExtendedSurfaceService, ExtendedSurfaceFormService, WallLossCalculationService],
})
export class ExtendedSurfaceComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(ExtendedSurfaceService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
