import { ChangeDetectionStrategy, Component, effect, inject, input, Signal, untracked } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
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

  // Re-initializes whenever `scenario` changes, not just on first render — needed for screens like
  // Expert View where this component could stay mounted while the user switches which
  // modification is selected. initialize() itself reads processHeatingSignal (via scenarioPhast),
  // so its call must be untracked — otherwise this effect would also rerun on every PHAST edit,
  // not just a scenario() change.
  constructor() {
    effect(() => {
      const scenario = this.scenario();
      untracked(() => this.service.initialize(scenario));
    });
  }
}
