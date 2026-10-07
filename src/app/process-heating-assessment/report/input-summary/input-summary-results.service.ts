import { computed, inject, Injectable, Signal } from '@angular/core';
import { ModificationNameCell, InputSummarySection, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { Settings } from '../../../shared/models/settings';
import { getModificationName } from '../../models/modification';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { FieldDefinition, resolveUnit, SECTION_DEFINITIONS, SectionDefinition, SummaryValue } from './input-summary-definitions';

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

  readonly inputSummaryUI: Signal<InputSummaryUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const baseline = this.assessmentService.scenarioPhastSignal('baseline');
    if (!settings || !baseline?.losses) {
      return undefined;
    }
    const modifications = this.modificationService.modifications();
    const scenarios: PHAST[] = [baseline, ...modifications.map(modification => this.assessmentService.scenarioPhastSignal(modification.id))];
    const categories = this.resultsService.getResultCategories(settings);

    const sections = SECTION_DEFINITIONS
      .filter(definition => !definition.isVisible || definition.isVisible(categories))
      .flatMap(definition => this.buildSections(definition, scenarios, settings))
      .filter(section => section.rows.length > 0);

    return {
      modificationNames: modifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      sections,
    };
  });

  private buildSections(definition: SectionDefinition, scenarios: PHAST[], settings: Settings): InputSummarySection[] {
    if (definition.kind === 'scenario') {
      return [{ label: definition.label, rows: this.buildRows(definition.fields, scenarios, settings, scenario => scenario) }];
    }
    const itemsByScenario = scenarios.map(scenario => definition.items(scenario.losses) ?? []);
    const itemCount = Math.max(...itemsByScenario.map(items => items.length));
    return Array.from({ length: itemCount }, (_, index) => {
      const name = itemsByScenario.map(items => items[index]?.name).find(Boolean);
      return {
        label: `${definition.label} ${index + 1}${name ? `: ${name}` : ''}`,
        rows: this.buildRows(definition.fields, itemsByScenario, settings, items => items[index]),
      };
    });
  }

  private buildRows<TSource, TItem>(
    fields: FieldDefinition<TItem>[],
    sources: TSource[],
    settings: Settings,
    selectItem: (source: TSource) => TItem | undefined
  ): ReportTableRow[] {
    return fields
      .map(field => {
        const cells: ReportColumnCell[] = sources.map(source => {
          const item = selectItem(source);
          return this.toCell(item === undefined ? undefined : field.value(item, settings));
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
