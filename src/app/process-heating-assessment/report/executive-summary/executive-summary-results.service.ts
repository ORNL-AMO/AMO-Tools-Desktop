import { computed, inject, Injectable, Signal } from '@angular/core';
import { isEqual } from 'lodash';
import { ConvertValue } from '../../../shared/convert-units/ConvertValue';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ExecutiveSummary, PhastCo2EmissionsOutput } from '../../../shared/models/phast/phast';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { Settings } from '../../../shared/models/settings';
import { getModificationName, ProcessHeatingModification } from '../../models/modification';
import { EAFResults, Losses, Notes, PHAST, PhastResults } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

export interface ExecutiveSummaryUI {
  modificationNames: ModificationNameCell[];
  summaryRows: ReportTableRow[];
  eafEnergyRows: ReportTableRow[];
  co2Rows: ReportTableRow[];
  costRows: ReportTableRow[];
  notes: SummaryNote[];
}

export interface ScenarioSavings {
  costSavings: number;
  energySavings: number;
}

export interface SummaryNote {
  modificationName: string;
  lossName: string;
  note: string;
}

interface ScenarioSummary {
  summary: ExecutiveSummary;
  results: PhastResults;
}

const LOSS_LABELS: Array<{ key: keyof Losses; label: string }> = [
  { key: 'atmosphereLosses', label: 'Atmosphere' },
  { key: 'auxiliaryPowerLosses', label: 'Auxiliary power' },
  { key: 'chargeMaterials', label: 'Charge Materials' },
  { key: 'coolingLosses', label: 'Cooling' },
  { key: 'energyInputEAF', label: 'Energy Input' },
  { key: 'energyInputExhaustGasLoss', label: 'Exhaust Gas Energy Input' },
  { key: 'exhaustGasEAF', label: 'Exhaust Gas' },
  { key: 'extendedSurfaces', label: 'Extended Surface' },
  { key: 'fixtureLosses', label: 'Fixture' },
  { key: 'flueGasLosses', label: 'Flue Gas' },
  { key: 'leakageLosses', label: 'Leakage' },
  { key: 'openingLosses', label: 'Opening' },
  { key: 'otherLosses', label: 'Other' },
  { key: 'slagLosses', label: 'Slag' },
  { key: 'wallLosses', label: 'Wall' },
];

const PERCENT = '%';

const NOTE_LABELS: Array<{ key: keyof Notes; label: string }> = [
  { key: 'atmosphereNotes', label: 'Atmosphere Losses' },
  { key: 'auxiliaryPowerNotes', label: 'Auxiliary Power Losses' },
  { key: 'chargeNotes', label: 'Charge Materials' },
  { key: 'coolingNotes', label: 'Cooling Losses' },
  { key: 'energyInputExhaustGasNotes', label: 'Energy Input' },
  { key: 'exhaustGasNotes', label: 'Exhaust Gas Losses' },
  { key: 'extendedNotes', label: 'Extended Surface Losses' },
  { key: 'fixtureNotes', label: 'Fixture Losses' },
  { key: 'flueGasNotes', label: 'Flue Gas Losses' },
  { key: 'heatSystemEfficiencyNotes', label: 'Heat System Efficiency' },
  { key: 'leakageNotes', label: 'Leakage Losses' },
  { key: 'openingNotes', label: 'Opening Losses' },
  { key: 'operationsNotes', label: 'Operations' },
  { key: 'otherNotes', label: 'Other Losses' },
  { key: 'slagNotes', label: 'Slag Losses' },
  { key: 'wallNotes', label: 'Wall Losses' },
];

/**
 * Builds the Executive Summary report tables for baseline and every modification from live
 * scenario results. All values are computed here so the component only renders rows.
 */
@Injectable()
export class ExecutiveSummaryResultsService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly modificationService = inject(ModificationService);
  private readonly featureFlagService = inject(FeatureFlagService);

  private readonly scenarioSummaries = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    const baselinePhast = this.assessmentService.scenarioPhastSignal('baseline');
    const modifications = this.modificationService.modifications();
    const baseline = this.getScenarioSummary('baseline', settings);
    if (!baseline) {
      return undefined;
    }

    const modificationSummaries: ScenarioSummary[] = modifications.map(modification =>
      this.getScenarioSummary(modification.id, settings, baseline.summary)
    );
    this.applyCo2Savings(baseline, modificationSummaries.filter(Boolean));
    return { settings, baselinePhast, baseline, modifications, modificationSummaries };
  });

  /** Annual energy and cost savings against baseline, keyed by scenario id ('baseline' is always zero) */
  readonly scenarioSavings: Signal<Record<string, ScenarioSavings>> = computed(() => {
    const summaries = this.scenarioSummaries();
    if (!summaries) {
      return {};
    }
    const savings: Record<string, ScenarioSavings> = { baseline: { costSavings: 0, energySavings: 0 } };
    summaries.modifications.forEach((modification, index) => {
      const summary = summaries.modificationSummaries[index]?.summary;
      if (summary) {
        savings[modification.id] = { costSavings: summary.annualCostSavings, energySavings: summary.annualEnergySavings };
      }
    });
    return savings;
  });

  readonly executiveSummaryUI: Signal<ExecutiveSummaryUI | undefined> = computed(() => {
    const summaries = this.scenarioSummaries();
    if (!summaries) {
      return undefined;
    }
    const { settings, baselinePhast, baseline, modifications, modificationSummaries } = summaries;

    const showCo2 = this.featureFlagService.showOperationalImpacts();
    const validModifications = modifications.filter((_, index) => modificationSummaries[index]);
    const mods = modificationSummaries.filter(Boolean);

    return {
      modificationNames: validModifications.map(modification => ({ id: modification.id, name: getModificationName(modification) })),
      summaryRows: this.buildSummaryRows(baseline, mods, settings, showCo2, validModifications, baselinePhast),
      eafEnergyRows: this.isEaf(settings) ? this.buildEafEnergyRows(baseline, mods) : [],
      co2Rows: showCo2 && settings.energySourceType === 'Electricity' ? this.buildCo2Rows(baseline, mods, settings) : [],
      costRows: settings.energySourceType === 'Electricity' ? this.buildCostRows(baseline, mods, settings) : [],
      notes: this.buildNotes(validModifications),
    };
  });

  private getScenarioSummary(scenario: AssessmentScenario, settings: Settings, baselineSummary?: ExecutiveSummary): ScenarioSummary | undefined {
    const phast = this.assessmentService.scenarioPhastSignal(scenario);
    const results = this.resultsService.scenarioResults(scenario);
    if (!results) {
      return undefined;
    }
    const annualEnergyUsed = results.grossHeatInput * phast.operatingHours.hoursPerYear;
    const summary: ExecutiveSummary = {
      percentSavings: 0,
      annualEnergyUsed,
      energyPerMass: this.calcEnergyPerMass(phast, settings, results.grossHeatInput),
      annualEnergySavings: 0,
      annualCost: 0,
      annualCostSavings: 0,
      implementationCosts: 0,
      paybackPeriod: 0,
      co2EmissionsOutput: results.co2EmissionsOutput,
    };
    this.calcAnnualCosts(summary, results, settings, phast);

    if (baselineSummary) {
      summary.annualCostSavings = baselineSummary.annualCost - summary.annualCost;
      summary.annualEnergySavings = baselineSummary.annualEnergyUsed - summary.annualEnergyUsed;
      summary.percentSavings = Math.round((summary.annualCostSavings * 100) / baselineSummary.annualCost) || 0;
      summary.implementationCosts = phast.implementationCost;
      summary.paybackPeriod = summary.annualCostSavings > 0 && phast.implementationCost
        ? (phast.implementationCost / summary.annualCostSavings) * 12
        : 0;
    }
    return { summary, results };
  }

  /** @returns annual energy per unit of charge feed rate, in Btu/lb or kJ/kg when the result unit is MMBtu or GJ */
  private calcEnergyPerMass(phast: PHAST, settings: Settings, grossHeatInput: number): number {
    const feedRate = (phast.losses?.chargeMaterials ?? []).reduce((sum, material) => {
      switch (material.chargeMaterialType) {
        case 'Gas': return sum + material.gasChargeMaterial.feedRate;
        case 'Solid': return sum + material.solidChargeMaterial.chargeFeedRate;
        case 'Liquid': return sum + material.liquidChargeMaterial.chargeFeedRate;
        default: return sum;
      }
    }, 0);
    const energyPerMass = (grossHeatInput / feedRate) || 0;
    if (settings.energyResultUnit === 'MMBtu') {
      return new ConvertValue(energyPerMass, 'MMBtu', 'Btu').convertedValue;
    }
    if (settings.energyResultUnit === 'GJ') {
      return new ConvertValue(energyPerMass, 'GJ', 'kJ').convertedValue;
    }
    return energyPerMass;
  }

  private calcAnnualCosts(summary: ExecutiveSummary, results: PhastResults, settings: Settings, phast: PHAST): void {
    const { operatingCosts, operatingHours } = phast;
    if (settings.energySourceType === 'Electricity') {
      if (this.isEaf(settings)) {
        const energyInput = phast.losses.energyInputEAF?.[0];
        summary.annualNaturalGasCost = results.annualEAFResults.naturalGasUsed * operatingCosts.fuelCost;
        summary.annualCarbonCoalCost = energyInput ? energyInput.coalCarbonInjection * operatingCosts.coalCarbonCost * operatingHours.hoursPerYear : 0;
        summary.annualElectrodeCost = energyInput ? energyInput.electrodeUse * operatingCosts.electrodeCost * operatingHours.hoursPerYear : 0;
        summary.annualOtherFuelCost = results.annualEAFResults.otherFuelUsed * operatingCosts.otherFuelCost;
        summary.annualElectricityCost = results.annualEAFResults.electricEnergyUsed * operatingCosts.electricityCost;
        summary.annualTotalFuelCost = summary.annualNaturalGasCost + summary.annualCarbonCoalCost + summary.annualElectrodeCost + summary.annualOtherFuelCost;
      } else {
        const totalHeatInput = (phast.losses.energyInputExhaustGasLoss ?? []).reduce((sum, loss) => sum + loss.totalHeatInput, 0);
        summary.annualElectricityCost = results.electricalHeatDelivered * operatingHours.hoursPerYear * operatingCosts.electricityCost;
        summary.annualTotalFuelCost = totalHeatInput * operatingHours.hoursPerYear * operatingCosts.fuelCost;
      }
      summary.annualCost = summary.annualTotalFuelCost + summary.annualElectricityCost;
      return;
    }

    const billedEnergyUnit = settings.unitsOfMeasure === 'Metric' ? 'GJ' : 'MMBtu';
    const annualBilledEnergy = new ConvertValue(summary.annualEnergyUsed, settings.energyResultUnit, billedEnergyUnit).convertedValue;
    if (settings.energySourceType === 'Fuel') {
      summary.annualCost = annualBilledEnergy * operatingCosts.fuelCost;
    } else if (settings.energySourceType === 'Steam') {
      summary.annualCost = annualBilledEnergy * operatingCosts.steamCost;
    }
  }

  private applyCo2Savings(baseline: ScenarioSummary, modifications: ScenarioSummary[]): void {
    modifications.forEach(({ summary, results }) => {
      if (summary.co2EmissionsOutput && baseline.summary.co2EmissionsOutput) {
        summary.co2EmissionsOutput = {
          ...summary.co2EmissionsOutput,
          emissionsSavings: this.resultsService.getCo2EmissionsSavings(baseline.results, results, 'totalEmissionOutput'),
        };
      }
    });
  }

  private buildSummaryRows(
    baseline: ScenarioSummary,
    mods: ScenarioSummary[],
    settings: Settings,
    showCo2: boolean,
    modifications: ProcessHeatingModification[],
    baselinePhast: PHAST
  ): ReportTableRow[] {
    const energyPerMassUnit = this.getEnergyPerMassUnit(settings);
    const annualEnergyUnit = `${settings.energyResultUnit}/yr`;
    const emissionsUnit = `${settings.emissionsUnit === 'Metric' ? 'tonne' : 'ton'} CO<sub>2</sub>`;
    const rows: ReportTableRow[] = [
      { ...this.row('Percent Savings', PERCENT, baseline, mods, s => s.percentSavings, 'whole', false), display: 'percent-graph' },
      this.row('Energy Intensity', energyPerMassUnit, baseline, mods, s => s.energyPerMass, 'sig5'),
    ];
    if (showCo2) {
      rows.push(
        this.row('Total CO<sub>2</sub> Emissions', emissionsUnit, baseline, mods, s => s.co2EmissionsOutput?.totalEmissionOutput, 'decimal2'),
        this.row('CO<sub>2</sub> Emissions Savings', emissionsUnit, baseline, mods, s => s.co2EmissionsOutput?.emissionsSavings, 'decimal2', false),
      );
    }
    rows.push(
      this.row('Energy Used', annualEnergyUnit, baseline, mods, s => s.annualEnergyUsed, 'sig5'),
      { ...this.row('Energy Savings', annualEnergyUnit, baseline, mods, s => s.annualEnergySavings, 'sig5', false), className: 'emphasis' },
      this.row('Cost', settings.currency, baseline, mods, s => s.annualCost, 'whole'),
      { ...this.row('Cost Savings', settings.currency, baseline, mods, s => s.annualCostSavings, 'whole', false), className: 'emphasis' },
      this.row('Implementation Costs', settings.currency, baseline, mods, s => s.implementationCosts, 'whole', false),
      { ...this.row('Simple Payback Period', 'months', baseline, mods, s => s.paybackPeriod, 'sig5', false), className: 'emphasis' },
      this.listRow('Selected Energy Projects', modifications.map(modification =>
        Object.values(modification.exploreOpportunityFlags ?? {}).filter(flag => flag?.hasOpportunity).map(flag => flag.display)
      )),
      this.listRow('Modifications', modifications.map(modification =>
        this.getModificationsMade(baselinePhast, this.assessmentService.scenarioPhastSignal(modification.id))
      )),
    );
    return rows;
  }

  private buildEafEnergyRows(baseline: ScenarioSummary, mods: ScenarioSummary[]): ReportTableRow[] {
    const unit = 'kWh/yr';
    const eaf = (field: keyof EAFResults) => (scenario: ScenarioSummary) => scenario.results.annualEAFResults?.[field];
    return [
      this.scenarioRow('Electrical', unit, baseline, mods, eaf('electricEnergyUsed'), 'whole'),
      this.scenarioRow('Natural Gas', unit, baseline, mods, eaf('naturalGasUsed'), 'whole'),
      this.scenarioRow('Coal Carbon', unit, baseline, mods, eaf('coalCarbonUsed'), 'whole'),
      this.scenarioRow('Electrode', unit, baseline, mods, eaf('electrodeEnergyUsed'), 'whole'),
      this.scenarioRow('Other Fuel', unit, baseline, mods, eaf('otherFuelUsed'), 'whole'),
    ];
  }

  private buildCo2Rows(baseline: ScenarioSummary, mods: ScenarioSummary[], settings: Settings): ReportTableRow[] {
    const unit = `${settings.emissionsUnit === 'Metric' ? 'tonne' : 'ton'} CO<sub>2</sub>`;
    const co2 = (field: keyof PhastCo2EmissionsOutput) => (scenario: ScenarioSummary) => scenario.results.co2EmissionsOutput?.[field];
    const rows = [
      this.scenarioRow('Electrical CO<sub>2</sub> Emissions', unit, baseline, mods, co2('electricityEmissionOutput'), 'decimal2'),
      this.scenarioRow(this.isEaf(settings) ? 'Natural Gas CO<sub>2</sub> Emissions' : 'Fuel CO<sub>2</sub> Emissions', unit, baseline, mods, co2('fuelEmissionOutput'), 'decimal2'),
    ];
    if (this.isEaf(settings)) {
      rows.push(
        this.scenarioRow('Coal Carbon CO<sub>2</sub> Emissions', unit, baseline, mods, co2('coalCarbonEmissionsOutput'), 'decimal2'),
        this.scenarioRow('Electrode CO<sub>2</sub> Emissions', unit, baseline, mods, co2('electrodeEmissionsOutput'), 'decimal2'),
        this.scenarioRow('Other Fuel CO<sub>2</sub> Emissions', unit, baseline, mods, co2('otherFuelEmissionsOutput'), 'decimal2'),
      );
    }
    return rows;
  }

  private buildCostRows(baseline: ScenarioSummary, mods: ScenarioSummary[], settings: Settings): ReportTableRow[] {
    const unit = settings.currency;
    const rows = [
      this.row('Electrical', unit, baseline, mods, s => s.annualElectricityCost, 'whole'),
    ];
    if (this.isEaf(settings)) {
      rows.push(
        this.row('Natural Gas', unit, baseline, mods, s => s.annualNaturalGasCost, 'whole'),
        this.row('Coal Carbon', unit, baseline, mods, s => s.annualCarbonCoalCost, 'whole'),
        this.row('Electrode', unit, baseline, mods, s => s.annualElectrodeCost, 'whole'),
        this.row('Other Fuel', unit, baseline, mods, s => s.annualOtherFuelCost, 'whole'),
      );
    } else {
      rows.push(this.row('Fuel', unit, baseline, mods, s => s.annualTotalFuelCost, 'whole'));
    }
    return rows;
  }

  /** A baseline-less row whose modification cells list one item per line. */
  private listRow(label: string, itemsByModification: string[][]): ReportTableRow {
    return {
      label,
      className: 'default',
      display: 'list',
      baseline: { value: null },
      modifications: itemsByModification.map(items => ({ value: items.length ? items.join('\n') : null })),
    };
  }

  private row(
    label: string,
    units: string,
    baseline: ScenarioSummary,
    mods: ScenarioSummary[],
    getValue: (summary: ExecutiveSummary) => number | undefined,
    format: CellFormat,
    showBaseline: boolean = true
  ): ReportTableRow {
    return this.scenarioRow(label, units, baseline, mods, scenario => getValue(scenario.summary), format, showBaseline);
  }

  private scenarioRow(
    label: string,
    units: string,
    baseline: ScenarioSummary,
    mods: ScenarioSummary[],
    getValue: (scenario: ScenarioSummary) => number | undefined,
    format: CellFormat,
    showBaseline: boolean = true
  ): ReportTableRow {
    return {
      label,
      units: units || undefined,
      className: 'default',
      baseline: showBaseline ? this.cell(getValue(baseline), format) : { value: null },
      modifications: mods.map(scenario => this.cell(getValue(scenario), format)),
    };
  }

  /** Zero and missing values render as the empty placeholder, matching legacy. */
  private cell(value: number | undefined, format: CellFormat): ReportColumnCell {
    if (!value || !Number.isFinite(value)) {
      return { value: null };
    }
    switch (format) {
      case 'sig5': return { value: Number(value.toPrecision(5)), decimalPipe: '1.0-5' };
      case 'decimal2': return { value, decimalPipe: '1.0-2' };
      default: return { value, decimalPipe: '1.0-0' };
    }
  }

  private getEnergyPerMassUnit(settings: Settings): string {
    if (settings.energyResultUnit === 'MMBtu') {
      return 'Btu/lb';
    }
    if (settings.energyResultUnit === 'GJ') {
      return 'kJ/kg';
    }
    return `${settings.energyResultUnit}/${settings.unitsOfMeasure === 'Metric' ? 'kg' : 'lb'}`;
  }

  private isEaf(settings: Settings): boolean {
    return settings.furnaceType === 'Electric Arc Furnace (EAF)';
  }

  private getModificationsMade(baseline: PHAST, modification: PHAST): string[] {
    const changes = LOSS_LABELS
      .filter(({ key }) => !isEqual(baseline.losses?.[key], modification.losses?.[key]))
      .map(({ label }) => label);
    if (!isEqual(baseline.operatingHours, modification.operatingHours) || !isEqual(baseline.operatingCosts, modification.operatingCosts)) {
      changes.push('Operations');
    }
    if (baseline.systemEfficiency !== modification.systemEfficiency) {
      changes.push('Heat System Efficiency');
    }
    return changes;
  }

  private buildNotes(modifications: ProcessHeatingModification[]): SummaryNote[] {
    return modifications.flatMap(modification =>
      NOTE_LABELS
        .filter(({ key }) => modification.notes?.[key])
        .map(({ key, label }) => ({
          modificationName: getModificationName(modification),
          lossName: label,
          note: modification.notes[key],
        }))
    );
  }
}

type CellFormat = 'sig5' | 'decimal2' | 'whole';
