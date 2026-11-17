import { computed, inject, Injectable, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { Settings } from '../../../shared/models/settings';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { getModificationName } from '../../models/modification';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { combineResultCategories, resultRowValue, ResultColumn, visibleResultRows } from '../../models/result-rows';
import { AuxiliaryEquipmentResultsService } from '../../services/auxiliary-equipment-results.service';
import { AuxiliaryEquipmentResults } from '../../models/auxiliary-equipment';

export interface ResultsDataUI {
  modificationNames: ModificationNameCell[];
  /** Header of the label column, including the hourly energy unit */
  title: string;
  rows: ReportTableRow[];
  /** Annual energy per auxiliary equipment item and in total; empty when no scenario has any */
  auxiliaryEquipmentRows: ReportTableRow[];
}

export const AUXILIARY_EQUIPMENT_TABLE_TITLE = 'Auxiliary Equipment (kWh/yr)';

/**
 * Builds the hourly energy loss/use table for baseline and every modification from live scenario
 * results. Rows are gated by the heating configuration so the component only renders them.
 */
@Injectable()
export class ResultsDataResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly auxiliaryEquipmentResultsService = inject(AuxiliaryEquipmentResultsService);

  readonly resultsDataUI: Signal<ResultsDataUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const baselineResults = this.resultsService.scenarioResults('baseline');
    if (!baselineResults) {
      return undefined;
    }

    const modifications = this.modificationService.modifications();
    const modificationResults = modifications.map(modification => this.resultsService.scenarioResults(modification.id));
    const validModifications = modifications.filter((_, index) => modificationResults[index]);
    const mods = modificationResults.filter(Boolean);

    const lossUnit = settings.energyResultUnit === 'kWh' ? 'kWh/hr' : `${settings.energyResultUnit}/hr`;
    return {
      modificationNames: validModifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      title: `Hourly Energy Loss/Use (${lossUnit})`,
      rows: this.buildRows(
        { results: baselineResults, categories: this.resultsService.scenarioResultCategories('baseline') },
        validModifications.map((modification, index) => ({ results: mods[index], categories: this.resultsService.scenarioResultCategories(modification.id) })),
        settings,
      ),
      auxiliaryEquipmentRows: this.buildAuxiliaryEquipmentRows(
        this.auxiliaryEquipmentResultsService.scenarioResults('baseline'),
        validModifications.map(modification => this.auxiliaryEquipmentResultsService.scenarioResults(modification.id)),
      ),
    };
  });

  /**
   * @param baseline baseline auxiliary equipment results
   * @param mods auxiliary equipment results of each modification column
   * @returns one row per item of any scenario, matched by id in baseline order, then the total; empty when no scenario has equipment
   */
  private buildAuxiliaryEquipmentRows(baseline: AuxiliaryEquipmentResults, mods: AuxiliaryEquipmentResults[]): ReportTableRow[] {
    const names = new Map<string, string>();
    [baseline, ...mods].forEach(results => results.items.forEach(item => {
      if (!names.has(item.id)) names.set(item.id, item.name);
    }));
    if (!names.size) {
      return [];
    }
    const energyUse = (results: AuxiliaryEquipmentResults, id: string): number | undefined => results.items.find(item => item.id === id)?.energyUse;
    const itemRows: ReportTableRow[] = [...names].map(([id, name]) => ({
      label: name,
      className: 'default',
      baseline: this.cell(energyUse(baseline, id), 0),
      modifications: mods.map(results => this.cell(energyUse(results, id), 0)),
    }));
    return [...itemRows, {
      label: 'Total Auxiliary Energy Use',
      className: 'emphasis',
      baseline: this.cell(this.completeTotal(baseline), 0),
      modifications: mods.map(results => this.cell(this.completeTotal(results), 0)),
    }];
  }

  /** @returns kWh/yr, or undefined when an item is missing inputs, so a partial total isn't reported */
  private completeTotal(results: AuxiliaryEquipmentResults): number | undefined {
    return results.isComplete ? results.totalEnergyUse : undefined;
  }

  private buildRows(baseline: ResultColumn, mods: ResultColumn[], settings: Settings): ReportTableRow[] {
    const categories = combineResultCategories([baseline.categories, ...mods.map(mod => mod.categories)]);
    const energyDecimals = ['MMBtu', 'GJ', 'kWh'].includes(settings.energyResultUnit) ? 2 : 0;
    const rows = visibleResultRows(categories).map((definition): ReportTableRow => {
      const decimals = definition.percentDecimals ?? energyDecimals;
      const columnCell = (column: ResultColumn): ReportColumnCell => this.cell(resultRowValue(definition, column), decimals);
      return {
        label: definition.label,
        units: definition.percentDecimals === undefined ? undefined : '%',
        className: definition.isTotal ? 'emphasis' : 'default',
        baseline: columnCell(baseline),
        modifications: mods.map(columnCell),
      };
    });

    if (this.featureFlagService.showOperationalImpacts()) {
      const units = `${settings.emissionsUnit === 'Metric' ? 'tonne' : 'ton'} CO<sub>2</sub>/hr`;
      const emissions = (column: ResultColumn): ReportColumnCell => this.cell(column.results?.co2EmissionsOutput?.hourlyTotalEmissionOutput, 2);
      rows.push({ label: 'CO<sub>2</sub> Emissions', units, className: 'default', baseline: emissions(baseline), modifications: mods.map(emissions) });
      if (mods.length) {
        const savings = (column: ResultColumn): ReportColumnCell =>
          this.cell(this.resultsService.getCo2EmissionsSavings(baseline.results, column.results, 'hourlyTotalEmissionOutput'), 2);
        rows.push({ label: 'CO<sub>2</sub> Emissions Savings', units, className: 'default', baseline: { value: null }, modifications: mods.map(savings) });
      }
    }
    return rows;
  }

  /** Zero and missing values render as the empty placeholder, matching legacy. */
  private cell(value: number | undefined, decimals: number): ReportColumnCell {
    if (!value || !Number.isFinite(value)) {
      return { value: null };
    }
    return { value, decimalPipe: `1.${decimals}-${decimals}` };
  }
}
