import { computed, inject, Injectable, Signal } from '@angular/core';
import { ConvertPhastService } from '../../../phast/convert-phast.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { getModificationName } from '../../models/modification';
import { PhastResults } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

export interface ResultsDataUI {
  modificationNames: ModificationNameCell[];
  /** Header of the label column, including the hourly energy unit */
  title: string;
  rows: ReportTableRow[];
}

type ResultSelector = (results: PhastResults) => number | undefined;

/**
 * Builds the hourly energy loss/use table for baseline and every modification from live scenario
 * results. Rows are gated by the heating configuration so the component only renders them.
 */
@Injectable()
export class ResultsDataResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly convertPhastService = inject(ConvertPhastService);
  private readonly featureFlagService = inject(FeatureFlagService);

  readonly resultsDataUI: Signal<ResultsDataUI | undefined> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const baselineResults = this.getScenarioResults('baseline', settings);
    if (!baselineResults) {
      return undefined;
    }

    const modifications = this.modificationService.modifications();
    const modificationResults = modifications.map(modification => this.getScenarioResults(modification.id, settings));
    const validModifications = modifications.filter((_, index) => modificationResults[index]);
    const mods = modificationResults.filter(Boolean);

    const lossUnit = settings.energyResultUnit === 'kWh' ? 'kWh/hr' : `${settings.energyResultUnit}/hr`;
    return {
      modificationNames: validModifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      title: `Hourly Energy Loss/Use (${lossUnit})`,
      rows: this.buildRows(baselineResults, mods, settings),
    };
  });

  /** @returns results with EAF fuel energy converted to kWh, or undefined when the scenario has no results */
  private getScenarioResults(scenario: AssessmentScenario, settings: Settings): PhastResults | undefined {
    const results = this.resultsService.scenarioResults(scenario);
    if (results && this.isEaf(settings)) {
      return this.convertPhastService.convertEAFEnergyUsed(results, settings);
    }
    return results;
  }

  private buildRows(baseline: PhastResults, mods: PhastResults[], settings: Settings): ReportTableRow[] {
    const categories: ShowResultsCategories = this.resultsService.getResultCategories(settings);
    const isEaf = this.isEaf(settings);
    const energyDecimals = ['MMBtu', 'GJ', 'kWh'].includes(settings.energyResultUnit) ? 2 : 0;
    const row = (label: string, selector: ResultSelector, decimals = energyDecimals): ReportTableRow =>
      this.buildRow(label, undefined, baseline, mods, selector, decimals);
    const percentRow = (label: string, selector: ResultSelector, decimals: number): ReportTableRow =>
      this.buildRow(label, '%', baseline, mods, selector, decimals);

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
    if (categories.showAuxPower) rows.push(row('Aux Power Losses', r => r.totalAuxPower));
    if (categories.showSlag) rows.push(row('Slag Losses', r => r.totalSlag));
    rows.push(
      row('Other Losses', r => r.totalOtherLoss),
      row('Total Available Heat Required', r => r.totalInput),
    );
    if (categories.showFlueGas) {
      rows.push(
        percentRow('Available Heat', r => r.flueGasAvailableHeat, 1),
        row('Flue Gas Losses', r => r.flueGasSystemLosses),
      );
    }
    rows.push(row('Exothermic Heat from Process', r => r.exothermicHeat));
    if (categories.showEnInput2) {
      rows.push(
        percentRow('Fuel Input Available Heat', r => r.availableHeatPercent, 0),
        row('Exhaust Gas Losses', r => r.totalExhaustGas),
      );
    }
    if (categories.showExGas) rows.push(row('Exhaust Gas Losses', r => r.totalExhaustGasEAF));
    if (categories.showSystemEff) {
      rows.push(
        percentRow('System Efficiency', r => r.heatingSystemEfficiency, 0),
        row('Total System Losses', r => r.totalSystemLosses),
      );
    }
    if (categories.showHeatDelivered) rows.push(row('Fuel Heat Delivered', r => r.energyInputHeatDelivered));
    if (categories.showEnInput2) rows.push(row('Total Additional Fuel Heat', r => r.totalAdditionalFuelHeat));
    if (categories.showElectricalDelivered && isEaf) rows.push(row('Electrical Heat Delivered', r => r.energyInputHeatDelivered));
    if (categories.showChemicalEnergyDelivered) rows.push(row('Chemical Energy Delivered', r => r.energyInputTotalChemEnergy));
    if (categories.showElectricalDelivered && !isEaf) rows.push(row('Electrical Heat Delivered', r => r.electricalHeatDelivered));
    if (categories.showEnInput2) {
      rows.push(
        row('Electrical Heater Losses', r => r.electricalHeaterLosses),
        row('Total Provided Electrical Heat', r => r.totalProvidedElectricalHeat),
      );
    }
    rows.push({ ...row('Gross Heat Input', r => r.grossHeatInput), className: 'emphasis' });

    if (this.featureFlagService.showOperationalImpacts()) {
      const emissionsUnit = `${settings.emissionsUnit === 'Metric' ? 'tonne' : 'ton'} CO<sub>2</sub>/hr`;
      rows.push(this.buildRow('CO<sub>2</sub> Emissions', emissionsUnit, baseline, mods, r => r.co2EmissionsOutput?.hourlyTotalEmissionOutput, 2));
      if (mods.length) {
        const savings: ResultSelector = r => this.resultsService.getCo2EmissionsSavings(baseline, r, 'hourlyTotalEmissionOutput');
        rows.push(this.buildRow('CO<sub>2</sub> Emissions Savings', emissionsUnit, baseline, mods, savings, 2, false));
      }
    }
    return rows;
  }

  private buildRow(
    label: string,
    units: string | undefined,
    baseline: PhastResults,
    mods: PhastResults[],
    selector: ResultSelector,
    decimals: number,
    showBaseline = true
  ): ReportTableRow {
    return {
      label,
      units,
      className: 'default',
      baseline: showBaseline ? this.cell(selector(baseline), decimals) : { value: null },
      modifications: mods.map(results => this.cell(selector(results), decimals)),
    };
  }

  /** Zero and missing values render as the empty placeholder, matching legacy. */
  private cell(value: number | undefined, decimals: number): ReportColumnCell {
    if (!value || !Number.isFinite(value)) {
      return { value: null };
    }
    return { value, decimalPipe: `1.${decimals}-${decimals}` };
  }

  private isEaf(settings: Settings): boolean {
    return settings.furnaceType === 'Electric Arc Furnace (EAF)';
  }
}
