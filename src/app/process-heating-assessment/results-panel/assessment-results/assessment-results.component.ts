import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal } from '@angular/core';
import { PhastResults } from '../../models/phast';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

@Component({
  selector: 'app-process-heating-assessment-results',
  standalone: false,
  templateUrl: './assessment-results.component.html',
  styleUrl: './assessment-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentResultsComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);

  readonly scenario = input<AssessmentScenario>('baseline');

  readonly results: Signal<PhastResults | undefined> = computed(() =>
    this.resultsService.getResults(this.assessmentService.scenarioPhastSignal(this.scenario()), this.assessmentService.settingsSignal())
  );

  constructor() {
    effect(() => {
      const results = this.results();
      if (results) {
        console.log(`[ProcessHeatingAssessment] scenario "${this.scenario()}" results`, results);
      }
    });
  }
}
