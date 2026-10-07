import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { GasLoadMaterialDbService } from '../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../../../indexedDb/wall-losses-surface-db.service';
import { ModificationNameCell, InputSummarySection, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { Settings } from '../../../shared/models/settings';
import { getModificationName } from '../../models/modification';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { EMPTY_LOOKUPS, FieldDefinition, InputSummaryLookups, resolveUnit, SECTION_DEFINITIONS, SectionDefinition, SummaryValue } from './input-summary-definitions';

export interface InputSummaryUI {
  modificationNames: ModificationNameCell[];
  sections: InputSummarySection[];
}

/** Builds read-only input tables for baseline and every modification from live scenario data. */
@Injectable()
export class InputSummaryResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly lookups: Signal<InputSummaryLookups> = toSignal(
    combineLatest([
      inject(SolidLoadMaterialDbService).getAllWithObservable(),
      inject(LiquidLoadMaterialDbService).getAllWithObservable(),
      inject(GasLoadMaterialDbService).getAllWithObservable(),
      inject(WallLossesSurfaceDbService).getAllWithObservable(),
    ]).pipe(map(([solidMaterials, liquidMaterials, gasMaterials, wallSurfaces]) => ({ solidMaterials, liquidMaterials, gasMaterials, wallSurfaces }))),
    { initialValue: EMPTY_LOOKUPS }
  );

  readonly inputSummaryUI: Signal<InputSummaryUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const baseline = this.assessmentService.scenarioPhastSignal('baseline');
    if (!settings || !baseline?.losses) {
      return undefined;
    }
    const modifications = this.modificationService.modifications();
    const scenarios: PHAST[] = [baseline, ...modifications.map(modification => this.assessmentService.scenarioPhastSignal(modification.id))];
    const categories = this.resultsService.getResultCategories(settings);
    const lookups = this.lookups();

    const sections = SECTION_DEFINITIONS
      .filter(definition => !definition.isVisible || definition.isVisible(categories))
      .flatMap(definition => this.buildSections(definition, scenarios, settings, lookups))
      .filter(section => section.rows.length > 0);

    return {
      modificationNames: modifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      sections,
    };
  });

  private buildSections(definition: SectionDefinition, scenarios: PHAST[], settings: Settings, lookups: InputSummaryLookups): InputSummarySection[] {
    if (definition.kind === 'scenario') {
      return [{ label: definition.label, rows: this.buildRows(definition.fields, scenarios, settings, lookups, scenario => scenario) }];
    }
    const itemsByScenario = scenarios.map(scenario => definition.items(scenario.losses) ?? []);
    return this.getEntryKeys(itemsByScenario).map((key, index) => {
      const selectEntry = (items: Array<{ id?: string; name?: string }>) => items.find((item, itemIndex) => this.entryKey(item, itemIndex) === key);
      const name = itemsByScenario.map(items => selectEntry(items)?.name).find(Boolean);
      return {
        label: `${definition.label} ${index + 1}${name ? `: ${name}` : ''}`,
        rows: this.buildRows(definition.fields, itemsByScenario, settings, lookups, selectEntry),
      };
    });
  }

  /** Entries are matched across scenarios by ID; entries saved without one (legacy) fall back to their position. */
  private entryKey(item: { id?: string }, index: number): string {
    return item.id ?? `index:${index}`;
  }

  /** Baseline entries first, then entries only a modification has, so a deleted entry never shifts the others. */
  private getEntryKeys(itemsByScenario: Array<Array<{ id?: string }>>): string[] {
    const keys = new Set<string>();
    itemsByScenario.forEach(items => items.forEach((item, index) => keys.add(this.entryKey(item, index))));
    return [...keys];
  }

  private buildRows<TSource, TItem>(
    fields: FieldDefinition<TItem>[],
    sources: TSource[],
    settings: Settings,
    lookups: InputSummaryLookups,
    selectItem: (source: TSource) => TItem | undefined
  ): ReportTableRow[] {
    return fields
      .map(field => {
        const cells: ReportColumnCell[] = sources.map(source => {
          const item = selectItem(source);
          return this.toCell(item === undefined ? undefined : field.value(item, settings, lookups));
        });
        const [baseline, ...modifications] = cells;
        return { label: field.label, units: resolveUnit(field.unit, settings), className: 'default' as const, baseline, modifications };
      })
      .filter(row => [row.baseline, ...row.modifications].some(cell => cell.value !== null));
  }

  private toCell(value: SummaryValue): ReportColumnCell {
    if (value === undefined || value === null || value === '') {
      return { value: null };
    }
    return typeof value === 'number' ? { value, decimalPipe: '1.0-4' } : { value };
  }
}
