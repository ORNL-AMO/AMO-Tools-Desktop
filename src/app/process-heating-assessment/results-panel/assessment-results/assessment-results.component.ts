import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Signal, viewChild } from '@angular/core';
import { PhastResults } from '../../models/phast';
import { getModificationName, ProcessHeatingModification } from '../../models/modification';
import { Settings } from '../../../shared/models/settings';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { combineResultCategories, ProcessHeatingResultsService, ResultCategories } from '../../services/process-heating-results.service';
import { ModificationService } from '../../services/modification.service';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';

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
  private readonly modificationService = inject(ModificationService);
  private readonly validityService = inject(ProcessHeatingValidityService);
  private readonly featureFlagService = inject(FeatureFlagService);

  /** 'baseline' on Baseline steps; the selected modification id on the Assessment step. */
  readonly scenario = input<AssessmentScenario>('baseline');

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  readonly baselineResults: Signal<PhastResults | undefined> = computed(() => this.resultsService.scenarioResults('baseline'));

  readonly modification: Signal<ProcessHeatingModification | undefined> = computed(() => {
    const scenario = this.scenario();
    return scenario === 'baseline' ? undefined : this.modificationService.modifications().find(modification => modification.id === scenario);
  });

  readonly modificationName: Signal<string> = computed(() => {
    const modification = this.modification();
    return modification ? getModificationName(modification) : '';
  });

  readonly modificationResults: Signal<PhastResults | undefined> = computed(() =>
    this.modification() ? this.resultsService.scenarioResults(this.scenario()) : undefined
  );

  readonly invalidModification: Signal<InvalidModification | undefined> = computed(() =>
    this.validityService.invalidModifications().find(modification => modification.id === this.modification()?.id)
  );

  readonly co2EmissionsSavings: Signal<number | undefined> = computed(() => {
    const baseline = this.baselineResults();
    const modification = this.modificationResults();
    return baseline && modification ? this.resultsService.getCo2EmissionsSavings(baseline, modification, 'hourlyTotalEmissionOutput') : undefined;
  });

  readonly baselineCategories: Signal<ResultCategories> = computed(() => this.resultsService.scenarioResultCategories('baseline'));

  readonly modificationCategories: Signal<ResultCategories | undefined> = computed(() =>
    this.modification() ? this.resultsService.scenarioResultCategories(this.scenario()) : undefined
  );

  /** Rows either column uses, since the baseline and modification can use different energy sources. */
  readonly rowCategories: Signal<ResultCategories> = computed(() => {
    const modification = this.modificationCategories();
    return modification ? combineResultCategories([this.baselineCategories(), modification]) : this.baselineCategories();
  });

  readonly lossUnit: Signal<string> = computed(() => `${this.settings().energyResultUnit}/hr`);

  readonly decimalCount: Signal<string> = computed(() =>
    ['MMBtu', 'GJ', 'kWh'].includes(this.settings().energyResultUnit?.trim()) ? '1.2-2' : '1.0-0'
  );

  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
