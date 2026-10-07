import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { PhastResults } from '../../models/phast';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
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
  private readonly featureFlagService = inject(FeatureFlagService);

  readonly scenario = input<AssessmentScenario>('baseline');

  readonly results: Signal<PhastResults | undefined> = computed(() =>
    this.resultsService.getResults(this.assessmentService.scenarioPhastSignal(this.scenario()), this.assessmentService.settingsSignal())
  );

  readonly showResultsCats: Signal<ShowResultsCategories | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    return settings ? this.resultsService.getResultCategories(settings) : undefined;
  });

  /** Standard electrotechnology only (electricity, not EAF or Custom Electrotechnology); legacy flag `showEnInput2`. */
  readonly showStandardElectrotechRows: Signal<boolean> = computed(() => !!this.showResultsCats()?.showEnInput2);

  readonly showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
}
