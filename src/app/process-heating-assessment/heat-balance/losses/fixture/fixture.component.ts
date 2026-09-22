import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { FixtureService } from './fixture.service';
import { FixtureFormService } from './fixture-form.service';
import { FixtureCalculationService } from './fixture-calculation.service';

@Component({
  selector: 'app-fixture',
  standalone: false,
  templateUrl: './fixture.component.html',
  styleUrl: './fixture.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FixtureService, FixtureFormService, FixtureCalculationService],
})
export class FixtureComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(FixtureService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
