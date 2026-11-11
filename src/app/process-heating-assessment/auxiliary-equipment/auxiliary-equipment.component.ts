import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { AuxiliaryEquipmentItemResult } from '../models/auxiliary-equipment';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from '../services/auxiliary-equipment-results.service';
import { reinitOnScenarioChange } from '../heat-balance/losses/reinit-on-scenario-change';
import { AuxiliaryEquipmentService } from './auxiliary-equipment.service';

@Component({
  selector: 'app-auxiliary-equipment',
  standalone: false,
  templateUrl: './auxiliary-equipment.component.html',
  styleUrl: './auxiliary-equipment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuxiliaryEquipmentService],
})
export class AuxiliaryEquipmentComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(AuxiliaryEquipmentResultsService);
  protected readonly service = inject(AuxiliaryEquipmentService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly results = computed(() => this.resultsService.scenarioResults(this.scenario()));
  private readonly resultsById: Signal<ReadonlyMap<string, AuxiliaryEquipmentItemResult>> = computed(() =>
    new Map(this.results().items.map(result => [result.id, result]))
  );

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }

  itemResult(id: string): AuxiliaryEquipmentItemResult | undefined {
    return this.resultsById().get(id);
  }
}
