import { computed, inject, Injectable, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { Settings } from '../../../shared/models/settings';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { getModificationName } from '../../models/modification';
import { PhastResults } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { combineResultCategories, ProcessHeatingResultsService, ResultCategories } from '../../services/process-heating-results.service';
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

type ResultSelector = (results: PhastResults) => number | undefined;

interface RowDefinition {
  label: string;
  units?: string;
  selector: ResultSelector;
  decimals: number;
  /** Result category the row belongs to; a column whose energy source doesn't use it shows the empty placeholder */
  category?: keyof ResultCategories;
  /** False leaves the baseline cell empty, for rows that compare a modification against baseline */
  showBaseline?: boolean;
}

interface ResultColumn {
  results: PhastResults;
  categories: ResultCategories;
}

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
    const row = (label: string, selector: ResultSelector, category?: keyof ResultCategories): ReportTableRow =>
      this.buildRow({ label, selector, decimals: energyDecimals, category }, baseline, mods);
    const percentRow = (label: string, selector: ResultSelector, decimals: number, category: keyof ResultCategories): ReportTableRow =>
      this.buildRow({ label, units: '%', selector, decimals, category }, baseline, mods);

    const rows: ReportTableRow[] = [
      row('Charge Materials', r => r.totalChargeMaterialLoss),
      row('Fixtures, trays etc.', r => r.totalFixtureLoss),
      row('Wall Losses', r => r.totalWallLoss),
      row('Cooling Losses', r => r.totalCoolingLoss),
      row('Atmosphere Losses', r => r.totalAtmosphereLoss),
      row('Opening Losses', r => r.totalOpeningLoss),
      row('Leakage Losses', r => r.totalLeakageLoss),
      row('Extended Surface Losses', r => r.totalExtSurfaceLoss),
    ];
    if (categories.showSlag) rows.push(row('Slag Losses', r => r.totalSlag, 'showSlag'));
    rows.push(
      row('Other Losses', r => r.totalOtherLoss),
      row('Total Available Heat Required', r => r.totalInput),
    );
    if (categories.showFlueGas) {
      rows.push(
        percentRow('Available Heat', r => r.flueGasAvailableHeat, 1, 'showFlueGas'),
        row('Flue Gas Losses', r => r.flueGasSystemLosses, 'showFlueGas'),
      );
    }
    rows.push(row('Exothermic Heat from Process', r => r.exothermicHeat));
    if (categories.showEnInput2) {
      rows.push(
        percentRow('Fuel Input Available Heat', r => r.availableHeatPercent, 0, 'showEnInput2'),
        row('Exhaust Gas Losses', r => r.totalExhaustGas, 'showEnInput2'),
      );
    }
    if (categories.showExGas) rows.push(row('Exhaust Gas Losses', r => r.totalExhaustGasEAF, 'showExGas'));
    if (categories.showSystemEff) {
      rows.push(
        percentRow('System Efficiency', r => r.heatingSystemEfficiency, 0, 'showSystemEff'),
        row('Total System Losses', r => r.totalSystemLosses, 'showSystemEff'),
      );
    }
    if (categories.showHeatDelivered) rows.push(row('Fuel Heat Delivered', r => r.energyInputHeatDelivered, 'showHeatDelivered'));
    if (categories.showEnInput2) rows.push(row('Total Additional Fuel Heat', r => r.totalAdditionalFuelHeat, 'showEnInput2'));
    if (categories.showEafElectricalDelivered) rows.push(row('Electrical Heat Delivered', r => r.energyInputHeatDelivered, 'showEafElectricalDelivered'));
    if (categories.showChemicalEnergyDelivered) rows.push(row('Chemical Energy Delivered', r => r.energyInputTotalChemEnergy, 'showChemicalEnergyDelivered'));
    if (categories.showStandardElectricalDelivered) rows.push(row('Electrical Heat Delivered', r => r.electricalHeatDelivered, 'showStandardElectricalDelivered'));
    if (categories.showEnInput2) {
      rows.push(
        row('Electrical Heater Losses', r => r.electricalHeaterLosses, 'showEnInput2'),
        row('Total Provided Electrical Heat', r => r.totalProvidedElectricalHeat, 'showEnInput2'),
      );
    }
    rows.push({ ...row('Gross Heat Input', r => r.grossHeatInput), className: 'emphasis' });

    if (this.featureFlagService.showOperationalImpacts()) {
      const emissionsUnit = `${settings.emissionsUnit === 'Metric' ? 'tonne' : 'ton'} CO<sub>2</sub>/hr`;
      rows.push(this.buildRow({
        label: 'CO<sub>2</sub> Emissions', units: emissionsUnit, selector: r => r.co2EmissionsOutput?.hourlyTotalEmissionOutput, decimals: 2,
      }, baseline, mods));
      if (mods.length) {
        const savings: ResultSelector = r => this.resultsService.getCo2EmissionsSavings(baseline.results, r, 'hourlyTotalEmissionOutput');
        rows.push(this.buildRow({ label: 'CO<sub>2</sub> Emissions Savings', units: emissionsUnit, selector: savings, decimals: 2, showBaseline: false }, baseline, mods));
      }
    }
    return rows;
  }

  private buildRow(definition: RowDefinition, baseline: ResultColumn, mods: ResultColumn[]): ReportTableRow {
    const { label, units, selector, decimals, category, showBaseline = true } = definition;
    const columnCell = (column: ResultColumn): ReportColumnCell =>
      !category || column.categories[category] ? this.cell(selector(column.results), decimals) : { value: null };
    return {
      label,
      units,
      className: 'default',
      baseline: showBaseline ? columnCell(baseline) : { value: null },
      modifications: mods.map(columnCell),
    };
  }

  /** Zero and missing values render as the empty placeholder, matching legacy. */
  private cell(value: number | undefined, decimals: number): ReportColumnCell {
    if (!value || !Number.isFinite(value)) {
      return { value: null };
    }
    return { value, decimalPipe: `1.${decimals}-${decimals}` };
  }
}
