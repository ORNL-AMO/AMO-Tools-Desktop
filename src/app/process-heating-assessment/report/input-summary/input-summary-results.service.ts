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
import { combineResultCategories, ProcessHeatingResultsService, ResultCategories } from '../../services/process-heating-results.service';
import { EMPTY_LOOKUPS, FieldDefinition, InputSummaryLookups, resolveUnit, SECTION_DEFINITIONS, SectionDefinition, SummaryValue } from './input-summary-definitions';

/** One summary definition's sections; `count` is the number of item entries and is omitted for scenario-level definitions. */
export interface InputSummaryCategory {
  label: string;
  count?: number;
  sections: InputSummarySection[];
}

export interface InputSummaryUI {
  modificationNames: ModificationNameCell[];
  categories: InputSummaryCategory[];
}

interface SummaryScenario {
  phast: PHAST;
  settings: Settings;
  categories: ResultCategories;
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
    const scenarios: SummaryScenario[] = ['baseline', ...modifications.map(modification => modification.id)].map(scenario => ({
      phast: this.assessmentService.scenarioPhastSignal(scenario),
      settings: this.assessmentService.scenarioSettings(scenario),
      categories: this.resultsService.scenarioResultCategories(scenario),
    }));
    const categories = combineResultCategories(scenarios.map(scenario => scenario.categories));
    const lookups = this.lookups();

    const summaryCategories = SECTION_DEFINITIONS
      .filter(definition => !definition.isVisible || definition.isVisible(categories))
      .map((definition): InputSummaryCategory => {
        const sections = this.buildSections(definition, scenarios, settings, lookups).filter(section => section.rows.length > 0);
        return { label: definition.label, count: definition.kind === 'items' ? sections.length : undefined, sections };
      })
      .filter(category => category.sections.length > 0);

    return {
      modificationNames: modifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      categories: summaryCategories,
    };
  });

  /** A loss section a scenario's energy source doesn't use shows no entries in that scenario's column. */
  private buildSections(definition: SectionDefinition, scenarios: SummaryScenario[], settings: Settings, lookups: InputSummaryLookups): InputSummarySection[] {
    if (definition.kind === 'scenario') {
      return [{ label: definition.label, rows: this.buildRows(definition.fields, scenarios, scenarios, settings, lookups, scenario => scenario.phast) }];
    }
    const itemsByScenario = scenarios.map(scenario => {
      const usesSection = !definition.isVisible || definition.isVisible(scenario.categories);
      return usesSection ? definition.items(scenario.phast.losses, scenario.phast) ?? [] : [];
    });
    return this.getEntryKeys(itemsByScenario).map((key, index) => {
      const selectEntry = (items: Array<{ id?: string; name?: string }>) => items.find((item, itemIndex) => this.entryKey(item, itemIndex) === key);
      const name = itemsByScenario.map(items => selectEntry(items)?.name).find(Boolean);
      return {
        label: `${definition.label} ${index + 1}${name ? `: ${name}` : ''}`,
        rows: this.buildRows(definition.fields, itemsByScenario, scenarios, settings, lookups, selectEntry),
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

  /**
   * @param sources one per scenario column, in the same order as `scenarios`
   * @param settings assessment settings, for units
   */
  private buildRows<TSource, TItem>(
    fields: FieldDefinition<TItem>[],
    sources: TSource[],
    scenarios: SummaryScenario[],
    settings: Settings,
    lookups: InputSummaryLookups,
    selectItem: (source: TSource) => TItem | undefined
  ): ReportTableRow[] {
    return fields
      .map(field => {
        const cells: ReportColumnCell[] = sources.map((source, index) => {
          const item = selectItem(source);
          return this.toCell(item === undefined ? undefined : field.value(item, scenarios[index].settings, lookups));
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
