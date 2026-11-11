import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Signal, viewChild } from '@angular/core';
import { getModificationName, ProcessHeatingModification } from '../../models/modification';
import { AuxiliaryEquipmentResults } from '../../models/auxiliary-equipment';
import { AssessmentScenario } from '../../services/process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from '../../services/auxiliary-equipment-results.service';
import { ModificationService } from '../../services/modification.service';

export interface AuxiliaryEquipmentResultRow {
  name: string;
  /** kWh/yr; undefined when the scenario doesn't have the item or it is missing inputs */
  baseline: number | undefined;
  modification: number | undefined;
}

/**
 * Lists every item of either scenario, matched by id, in baseline order followed by items only the
 * modification has.
 * @param baseline baseline results
 * @param modification modification results, when one is compared
 * @returns one row per item with its annual energy in each scenario
 */
export function buildAuxiliaryEquipmentRows(baseline: AuxiliaryEquipmentResults, modification: AuxiliaryEquipmentResults | undefined): AuxiliaryEquipmentResultRow[] {
  const modificationById = new Map((modification?.items ?? []).map(item => [item.id, item]));
  const rows: AuxiliaryEquipmentResultRow[] = baseline.items.map(item => ({
    name: modificationById.get(item.id)?.name ?? item.name,
    baseline: item.energyUse,
    modification: modificationById.get(item.id)?.energyUse,
  }));
  const baselineIds = new Set(baseline.items.map(item => item.id));
  const modificationOnly = (modification?.items ?? []).filter(item => !baselineIds.has(item.id));
  return [...rows, ...modificationOnly.map(item => ({ name: item.name, baseline: undefined, modification: item.energyUse }))];
}

/** Auxiliary equipment results, shown on their own so they are never read against the heat balance. */
@Component({
  selector: 'app-auxiliary-equipment-results',
  standalone: false,
  templateUrl: './auxiliary-equipment-results.component.html',
  styleUrl: './auxiliary-equipment-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuxiliaryEquipmentResultsComponent {
  private readonly resultsService = inject(AuxiliaryEquipmentResultsService);
  private readonly modificationService = inject(ModificationService);

  /** 'baseline' on the Baseline step; the selected modification id in Expert View. */
  readonly scenario = input<AssessmentScenario>('baseline');

  readonly modification: Signal<ProcessHeatingModification | undefined> = computed(() => {
    const scenario = this.scenario();
    return scenario === 'baseline' ? undefined : this.modificationService.modifications().find(modification => modification.id === scenario);
  });

  readonly modificationName: Signal<string> = computed(() => {
    const modification = this.modification();
    return modification ? getModificationName(modification) : '';
  });

  readonly baselineResults: Signal<AuxiliaryEquipmentResults> = computed(() => this.resultsService.scenarioResults('baseline'));
  readonly modificationResults: Signal<AuxiliaryEquipmentResults | undefined> = computed(() =>
    this.modification() ? this.resultsService.scenarioResults(this.scenario()) : undefined
  );

  readonly rows: Signal<AuxiliaryEquipmentResultRow[]> = computed(() => buildAuxiliaryEquipmentRows(this.baselineResults(), this.modificationResults()));

  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
