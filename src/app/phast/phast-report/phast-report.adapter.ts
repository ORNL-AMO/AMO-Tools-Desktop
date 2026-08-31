import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { buildFacilityInfoSections, decodeHtmlEntities, findRowIndices, formatNumber, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection, TextSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import {
  ExecutiveSummary, Modification, PHAST, PhastResults, PhastValid, ShowResultsCategories,
} from '../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../shared/models/phast/designedEnergy';
import { ChargeMaterial } from '../../shared/models/phast/losses/chargeMaterial';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss } from '../../shared/models/phast/losses/coolingLoss';
import { FlueGas } from '../../shared/models/phast/losses/flueGas';
import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { PhastResultsService } from '../phast-results.service';
import { PhastValidService } from '../phast-valid.service';
import { PhastCompareService } from '../phast-compare.service';
import { ExecutiveSummaryService } from './executive-summary.service';
import { ConvertPhastService } from '../convert-phast.service';
import { MeteredEnergyService } from '../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../designed-energy/designed-energy.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLoadMaterialDbService } from '../../indexedDb/solid-load-material-db.service';
import { GasLoadMaterialDbService } from '../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../indexedDb/liquid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';
import { AtmosphereDbService } from '../../indexedDb/atmosphere-db.service';
import { PhastChartsService } from './phast-charts.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';

interface ScenarioBundle {
  name: string;
  phast: PHAST;
  modification?: Modification;
  results: PhastResults;
  valid: PhastValid;
}

interface MaterialLookups {
  solidMaterials: Array<{ id?: number; substance?: string }>;
  gasMaterials: Array<{ id?: number; substance?: string }>;
  liquidMaterials: Array<{ id?: number; substance?: string }>;
  wallSurfaces: Array<{ id?: number; surface?: string }>;
  atmosphereGases: Array<{ id?: number; substance?: string }>;
}

export const PHAST_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'executiveSummary', label: 'Executive Summary', description: 'Baseline and modification results comparison' },
  { key: 'energySummary', label: 'Energy Summary', description: 'Summary of energy sources used and PHA calculation comparisons' },
  { key: 'results', label: 'Result Data', description: 'Hourly energy loss and use breakdown' },
  { key: 'graphs', label: 'Report Graphs', description: 'Energy loss distribution pie and bar charts' },
  { key: 'sankey', label: 'Sankey', description: 'Furnace energy flow diagram' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class PhastReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly phastResultsService = inject(PhastResultsService);
  private readonly phastValidService = inject(PhastValidService);
  private readonly phastCompareService = inject(PhastCompareService);
  private readonly executiveSummaryService = inject(ExecutiveSummaryService);
  private readonly convertPhastService = inject(ConvertPhastService);
  private readonly meteredEnergyService = inject(MeteredEnergyService);
  private readonly designedEnergyService = inject(DesignedEnergyService);
  private readonly solidLiquidMaterialDbService = inject(SolidLiquidMaterialDbService);
  private readonly flueGasMaterialDbService = inject(FlueGasMaterialDbService);
  private readonly solidLoadMaterialDbService = inject(SolidLoadMaterialDbService);
  private readonly gasLoadMaterialDbService = inject(GasLoadMaterialDbService);
  private readonly liquidLoadMaterialDbService = inject(LiquidLoadMaterialDbService);
  private readonly wallLossesSurfaceDbService = inject(WallLossesSurfaceDbService);
  private readonly atmosphereDbService = inject(AtmosphereDbService);
  private readonly phastChartsService = inject(PhastChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [192, 57, 43]; // #C0392B

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    const phast = assessment.phast;
    const resultCats = this.phastResultsService.getResultCategories(settings);

    const baseline = this.computeScenario(phast, phast.name || 'Baseline', settings);
    const modBundles = (phast.modifications ?? []).map(mod => this.computeScenario(mod.phast, mod.phast.name, settings, mod));

    const meta: ReportMeta = {
      title: assessment?.name ?? 'Process Heating Report',
      date: new Date().toISOString(),
      moduleColor: PhastReportAdapter.ACCENT_COLOR,
    };

    return combineLatest([
      this.solidLoadMaterialDbService.getAllWithObservable(),
      this.gasLoadMaterialDbService.getAllWithObservable(),
      this.liquidLoadMaterialDbService.getAllWithObservable(),
      this.wallLossesSurfaceDbService.getAllWithObservable(),
      this.atmosphereDbService.getAllWithObservable(),
    ]).pipe(
      map(([solidMaterials, gasMaterials, liquidMaterials, wallSurfaces, atmosphereGases]): ReportDocument => {
        const lookups: MaterialLookups = { solidMaterials, gasMaterials, liquidMaterials, wallSurfaces, atmosphereGases };
        return {
          meta,
          sections: [
            ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
            ...this.buildExecutiveSummarySections(phast, baseline, modBundles, settings),
            ...this.buildEnergySummarySections(phast, baseline, settings),
            ...this.buildResultsSections(baseline, modBundles, settings, resultCats),
            ...this.buildReportGraphsSections(baseline, modBundles, settings, resultCats),
            ...this.buildSankeySections(baseline, modBundles, settings),
            ...this.buildInputSummarySections(phast, baseline, modBundles, settings, resultCats, lookups),
          ],
        };
      }),
    );
  }

  private computeScenario(phast: PHAST, name: string, settings: Settings, modification?: Modification): ScenarioBundle {
    const valid = this.phastValidService.checkValid(phast, settings);
    phast.valid = valid;
    const results = this.phastResultsService.getResults(phast, settings);
    return { name, phast, modification, results, valid };
  }

  private fmtUSD(v: number | undefined): string {
    return v ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v) : '—';
  }

  // ---------------------------------------------------------------------
  // Executive Summary
  // ---------------------------------------------------------------------

  private buildExecutiveSummarySections(phast: PHAST, baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings): (SummaryTableSection | TextSection)[] {
    if (modBundles.length === 0) return [];

    const baselineSummary = this.executiveSummaryService.getSummary(phast, false, settings, phast, undefined, baseline.results);
    const modSummaries = modBundles.map(m => {
      const summary = this.executiveSummaryService.getSummary(m.phast, true, settings, phast, baselineSummary, m.results);
      if (summary.co2EmissionsOutput && baselineSummary.co2EmissionsOutput) {
        summary.co2EmissionsOutput.emissionsSavings = baselineSummary.co2EmissionsOutput.totalEmissionOutput - summary.co2EmissionsOutput.totalEmissionOutput;
      }
      return summary;
    });

    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const isEAF = settings.furnaceType === 'Electric Arc Furnace (EAF)';
    const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
    const timeUnit = `${settings.energyResultUnit}/yr`;
    const energyUnit = this.getEnergyPerMassUnit(settings);
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';

    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const rows: string[][] = [
      ['Percent Savings (%)', '—', ...modSummaries.map(s => s.percentSavings ? `${fmt(s.percentSavings)} %` : '—')],
      [`Energy Intensity (${energyUnit})`, fmt(baselineSummary.energyPerMass, 2), ...modSummaries.map(s => fmt(s.energyPerMass, 2))],
    ];
    if (showCO2) {
      rows.push(
        [`Total CO2 Emissions (${emissionsUnit})`, fmt(baselineSummary.co2EmissionsOutput?.totalEmissionOutput, 2), ...modSummaries.map(s => fmt(s.co2EmissionsOutput?.totalEmissionOutput, 2))],
        [`CO2 Emissions Savings (${emissionsUnit})`, '—', ...modSummaries.map(s => fmt(s.co2EmissionsOutput?.emissionsSavings, 2))],
      );
    }
    rows.push(
      [`Energy Used (${timeUnit})`, fmt(baselineSummary.annualEnergyUsed, 2), ...modSummaries.map(s => fmt(s.annualEnergyUsed, 2))],
      [`Energy Savings (${timeUnit})`, '—', ...modSummaries.map(s => fmt(s.annualEnergySavings, 2))],
      [`Cost (${settings.currency})`, fmt(baselineSummary.annualCost), ...modSummaries.map(s => fmt(s.annualCost))],
      [`Cost Savings (${settings.currency})`, '—', ...modSummaries.map(s => fmt(s.annualCostSavings))],
      [`Implementation Costs (${settings.currency})`, '—', ...modSummaries.map(s => fmt(s.implementationCosts))],
      ['Simple Payback Period (months)', '—', ...modSummaries.map(s => fmt(s.paybackPeriod, 1))],
      ['Selected Energy Projects', '—', ...modBundles.map(m => this.getSelectedEnergyProjects(m.modification))],
      ['Modifications', '—', ...modBundles.map(m => {
        const list = this.phastCompareService.getBadges(phast, m.phast).map(b => b.modName);
        return list.length ? list.join(', ') : '—';
      })],
    );

    const emphasisRowsIndices = findRowIndices(rows, [`Energy Used (${timeUnit})`, `Energy Savings (${timeUnit})`]);

    const sections: (SummaryTableSection | TextSection)[] = [{
      type: 'summary-table', title: 'Executive Summary', group: 'executiveSummary',
      headers, rows, emphasisRowsIndices, pageBreakBefore: true,
    }];

    if (isEAF) {
      sections.push(this.buildEAFEnergyUsedSection(baseline, modBundles, headers));
    }
    if (settings.energySourceType === 'Electricity') {
      if (showCO2) {
        sections.push(this.buildEmissionsBreakdownSection(baseline, modBundles, settings, isEAF, headers));
      }
      sections.push(this.buildCostBreakdownSection(baselineSummary, modSummaries, isEAF, headers));
    }

    const notes = this.executiveSummaryService.buildSummaryNotes(phast.modifications ?? []);
    if (notes.length) {
      sections.push({
        type: 'text', group: 'executiveSummary', title: 'Modification Notes',
        content: notes.map(n => `${n.modificationName} — ${n.lossName}: ${n.note}`).join('\n'),
      });
    }

    return sections;
  }

  private getEnergyPerMassUnit(settings: Settings): string {
    if (settings.energyResultUnit === 'MMBtu') return 'Btu/lb';
    if (settings.energyResultUnit === 'GJ') return 'kJ/kg';
    return settings.unitsOfMeasure === 'Metric' ? `${settings.energyResultUnit}/kg` : `${settings.energyResultUnit}/lb`;
  }

  private getSelectedEnergyProjects(modification: Modification | undefined): string {
    if (!modification) return '—';
    const flags: Array<SavingsOpportunity | undefined> = [
      modification.exploreOppsShowFlueGas, modification.exploreOppsShowAirTemp, modification.exploreOppsShowMaterial,
      modification.exploreOppsShowAllTimeOpen, modification.exploreOppsShowOpening, modification.exploreOppsShowAllEmissivity,
      modification.exploreOppsShowCooling, modification.exploreOppsShowAtmosphere, modification.exploreOppsShowOperations,
      modification.exploreOppsShowLeakage, modification.exploreOppsShowSlag, modification.exploreOppsShowEfficiencyData,
      modification.exploreOppsShowWall, modification.exploreOppsShowAllTemp, modification.exploreOppsShowFixtures,
    ];
    const displays = flags.filter(opp => opp?.hasOpportunity).map(opp => decodeHtmlEntities(opp!.display));
    return displays.length ? displays.join(', ') : '—';
  }

  private buildEAFEnergyUsedSection(baseline: ScenarioBundle, modBundles: ScenarioBundle[], headers: string[]): SummaryTableSection {
    const fmt = (v: number | undefined) => v ? formatNumber(v, 0) : '—';
    const rows: string[][] = [
      ['Electrical (kWh/yr)', fmt(baseline.results.annualEAFResults?.electricEnergyUsed), ...modBundles.map(m => fmt(m.results.annualEAFResults?.electricEnergyUsed))],
      ['Natural Gas (kWh/yr)', fmt(baseline.results.annualEAFResults?.naturalGasUsed), ...modBundles.map(m => fmt(m.results.annualEAFResults?.naturalGasUsed))],
      ['Coal Carbon (kWh/yr)', fmt(baseline.results.annualEAFResults?.coalCarbonUsed), ...modBundles.map(m => fmt(m.results.annualEAFResults?.coalCarbonUsed))],
      ['Electrode (kWh/yr)', fmt(baseline.results.annualEAFResults?.electrodeEnergyUsed), ...modBundles.map(m => fmt(m.results.annualEAFResults?.electrodeEnergyUsed))],
      ['Other Fuel (kWh/yr)', fmt(baseline.results.annualEAFResults?.otherFuelUsed), ...modBundles.map(m => fmt(m.results.annualEAFResults?.otherFuelUsed))],
    ];
    return { type: 'summary-table', title: 'Annual Electrical and Chemical Energy Used', group: 'executiveSummary', headers, rows };
  }

  private buildEmissionsBreakdownSection(baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings, isEAF: boolean, headers: string[]): SummaryTableSection {
    const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
    const fmt = (v: number | undefined) => v != null ? formatNumber(v, 2) : '—';
    const rows: string[][] = [
      [`Electrical CO2 Emissions (${emissionsUnit})`, fmt(baseline.results.co2EmissionsOutput?.electricityEmissionOutput), ...modBundles.map(m => fmt(m.results.co2EmissionsOutput?.electricityEmissionOutput))],
      [`${isEAF ? 'Natural Gas' : 'Fuel'} CO2 Emissions (${emissionsUnit})`, fmt(baseline.results.co2EmissionsOutput?.fuelEmissionOutput), ...modBundles.map(m => fmt(m.results.co2EmissionsOutput?.fuelEmissionOutput))],
    ];
    if (isEAF) {
      rows.push(
        [`Coal Carbon CO2 Emissions (${emissionsUnit})`, fmt(baseline.results.co2EmissionsOutput?.coalCarbonEmissionsOutput), ...modBundles.map(m => fmt(m.results.co2EmissionsOutput?.coalCarbonEmissionsOutput))],
        [`Electrode CO2 Emissions (${emissionsUnit})`, fmt(baseline.results.co2EmissionsOutput?.electrodeEmissionsOutput), ...modBundles.map(m => fmt(m.results.co2EmissionsOutput?.electrodeEmissionsOutput))],
        [`Other Fuel CO2 Emissions (${emissionsUnit})`, fmt(baseline.results.co2EmissionsOutput?.otherFuelEmissionsOutput), ...modBundles.map(m => fmt(m.results.co2EmissionsOutput?.otherFuelEmissionsOutput))],
      );
    }
    return { type: 'summary-table', title: 'Annual Emissions', group: 'executiveSummary', headers, rows };
  }

  private buildCostBreakdownSection(baselineSummary: ExecutiveSummary, modSummaries: ExecutiveSummary[], isEAF: boolean, headers: string[]): SummaryTableSection {
    const rows: string[][] = [
      ['Electrical', this.fmtUSD(baselineSummary.annualElectricityCost), ...modSummaries.map(s => this.fmtUSD(s.annualElectricityCost))],
    ];
    if (isEAF) {
      rows.push(['Natural Gas', this.fmtUSD(baselineSummary.annualNaturalGasCost), ...modSummaries.map(s => this.fmtUSD(s.annualNaturalGasCost))]);
    } else {
      rows.push(['Fuel', this.fmtUSD(baselineSummary.annualTotalFuelCost), ...modSummaries.map(s => this.fmtUSD(s.annualTotalFuelCost))]);
    }
    if (isEAF) {
      rows.push(
        ['Coal Carbon', this.fmtUSD(baselineSummary.annualCarbonCoalCost), ...modSummaries.map(s => this.fmtUSD(s.annualCarbonCoalCost))],
        ['Electrode', this.fmtUSD(baselineSummary.annualElectrodeCost), ...modSummaries.map(s => this.fmtUSD(s.annualElectrodeCost))],
        ['Other Fuel', this.fmtUSD(baselineSummary.annualOtherFuelCost), ...modSummaries.map(s => this.fmtUSD(s.annualOtherFuelCost))],
      );
    }
    return { type: 'summary-table', title: 'Annual Costs', group: 'executiveSummary', headers, rows };
  }

  // ---------------------------------------------------------------------
  // Energy Summary (baseline only — matches on-screen energy-used tab)
  // ---------------------------------------------------------------------

  private getEnergyUsedUnits(settings: Settings): { baseEnergyUnit: string; energyCostUnit: string; energyPerTimeUnit: string; energyPerMassUnit: string } {
    const baseEnergyUnit = (settings.energyResultUnit !== 'kWh' && settings.energySourceType !== 'Electricity')
      ? `${settings.energyResultUnit}/hr` : settings.energyResultUnit;
    const energyCostUnit = settings.unitsOfMeasure === 'Metric' ? '/GJ' : '/MMBtu';
    const energyPerTimeUnit = `${settings.energyResultUnit}/kWh`;
    const energyPerMassUnit = this.getEnergyPerMassUnit(settings);
    return { baseEnergyUnit, energyCostUnit, energyPerTimeUnit, energyPerMassUnit };
  }

  private buildEnergySummarySections(phast: PHAST, baseline: ScenarioBundle, settings: Settings): SummaryTableSection[] {
    const phastResults = baseline.results;
    const energyUsed = this.phastResultsService.getEnergyUseReportData(phast, phastResults, settings);
    const calculatedResults = this.phastResultsService.calculatedByPhast(phast, settings);

    let meteredResults: MeteredEnergyResults | undefined;
    if (phast.meteredEnergy?.meteredEnergyElectricity || phast.meteredEnergy?.meteredEnergySteam || phast.meteredEnergy?.meteredEnergyFuel) {
      meteredResults = this.meteredEnergyService.calculateMeteredEnergy(phast, settings);
    }
    let designedResults: DesignedEnergyResults | undefined;
    if (phast.designedEnergy) {
      designedResults = this.designedEnergyService.calculateDesignedEnergy(phast, settings);
    }

    const units = this.getEnergyUsedUnits(settings);
    const fmt = (v: number | undefined, dec = 2) => v ? formatNumber(v, dec) : '—';
    const withUnit = (v: number | undefined, unit: string, dec = 2) => v ? `${fmt(v, dec)} ${unit}` : '—';

    const sourcesHeaders = ['Energy Name', 'Energy Used', 'Heating Value (HHV)', 'Cost per Unit'];
    const sourcesRows: string[][] = [
      [energyUsed.fuelName || 'Fuel', withUnit(energyUsed.fuelEnergyUsed, units.baseEnergyUnit),
        withUnit(energyUsed.fuelHeatingValue, units.energyPerMassUnit), `${this.fmtUSD(phast.operatingCosts?.fuelCost)} ${units.energyCostUnit}`],
    ];
    if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
      sourcesRows.push(
        ['Coal Carbon', withUnit(phastResults.hourlyEAFResults?.coalCarbonUsed, units.baseEnergyUnit),
          withUnit(phastResults.hourlyEAFResults?.coalHeatingValue, units.energyPerMassUnit), `${this.fmtUSD(phast.operatingCosts?.coalCarbonCost)} ${units.energyCostUnit}`],
        ['Electrode', withUnit(phastResults.hourlyEAFResults?.electrodeEnergyUsed, units.baseEnergyUnit),
          withUnit(phastResults.hourlyEAFResults?.electrodeHeatingValue, units.energyPerMassUnit), `${this.fmtUSD(phast.operatingCosts?.electrodeCost)} ${units.energyCostUnit}`],
        ['Other Fuels', withUnit(phastResults.hourlyEAFResults?.otherFuelUsed, units.baseEnergyUnit), '—', `${this.fmtUSD(phast.operatingCosts?.otherFuelCost)} ${units.energyCostUnit}`],
      );
    }
    if (settings.energySourceType === 'Electricity') {
      const electricityHeatingValue = 9800 * this.btuConversionFactor(settings);
      sourcesRows.push(['Electricity', withUnit(energyUsed.electricEnergyUsed, 'kW'), `${fmt(electricityHeatingValue, 2)} ${units.energyPerTimeUnit}`, `${this.fmtUSD(phast.operatingCosts?.electricityCost)} /kWh`]);
    }
    const steamHeatingValue = phast.meteredEnergy?.meteredEnergySteam?.totalHeatSteam;
    sourcesRows.push(['Steam', withUnit(energyUsed.steamEnergyUsed, units.baseEnergyUnit), withUnit(steamHeatingValue, units.energyPerMassUnit), `${this.fmtUSD(phast.operatingCosts?.steamCost)} ${units.energyCostUnit}`]);

    const sourcesSection: SummaryTableSection = {
      type: 'summary-table', title: 'Summary of Energy Sources Used', group: 'energySummary', headers: sourcesHeaders, rows: sourcesRows, pageBreakBefore: true,
    };

    const compareHeaders = ['', 'Calculated By PHA', 'Metered Comparison', 'Design Comparison'];
    const compareRows: string[][] = [
      ['Energy Used', withUnit(calculatedResults.fuelEnergyUsed, units.baseEnergyUnit), withUnit(meteredResults?.metered.hourlyEnergy, units.baseEnergyUnit), withUnit(designedResults?.designed.hourlyEnergy, units.baseEnergyUnit)],
      ['Energy Intensity for Charge Materials', withUnit(calculatedResults.energyIntensity, units.energyPerMassUnit), withUnit(meteredResults?.metered.energyIntensity, units.energyPerMassUnit), withUnit(designedResults?.designed.energyIntensity, units.energyPerMassUnit)],
      ['Auxiliary Electricity Used', withUnit(calculatedResults.electricityUsed, 'kW'), withUnit(meteredResults?.metered.hourlyElectricity, 'kW/hr'), withUnit(designedResults?.designed.hourlyElectricity, 'kW/hr')],
    ];
    const compareSection: SummaryTableSection = {
      type: 'summary-table', title: 'Compare PHA Calculations', group: 'energySummary', headers: compareHeaders, rows: compareRows,
    };

    return [sourcesSection, compareSection];
  }

  /** Btu→energyResultUnit conversion factor for the fixed 9800 Btu/kWh electricity heating value constant used on-screen. */
  private btuConversionFactor(settings: Settings): number {
    if (settings.energyResultUnit === 'MMBtu') return 1 / 1000000;
    if (settings.energyResultUnit === 'GJ') return 1.05506e-6;
    if (settings.energyResultUnit === 'kWh') return 1 / 3412.14;
    return 1;
  }

  // ---------------------------------------------------------------------
  // Result Data
  // ---------------------------------------------------------------------

  private buildResultsSections(baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings, resultCats: ShowResultsCategories): SummaryTableSection[] {
    const decimalMax = (settings.energyResultUnit === 'MMBtu' || settings.energyResultUnit === 'GJ' || settings.energyResultUnit === 'kWh') ? 2 : 0;
    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const isEAF = settings.furnaceType === 'Electric Arc Furnace (EAF)';

    const baselineResults = isEAF ? this.convertPhastService.convertEAFEnergyUsed(baseline.results, settings) : baseline.results;
    const modResults = modBundles.map(m => isEAF ? this.convertPhastService.convertEAFEnergyUsed(m.results, settings) : m.results);
    modResults.forEach(r => {
      if (r.co2EmissionsOutput && baselineResults.co2EmissionsOutput) {
        r.co2EmissionsOutput.emissionsSavings = baselineResults.co2EmissionsOutput.hourlyTotalEmissionOutput - r.co2EmissionsOutput.hourlyTotalEmissionOutput;
      }
    });

    const scenarios = [baselineResults, ...modResults];
    const headers = ['Hourly Energy Loss/Use', 'Baseline', ...modBundles.map(m => m.name)];
    const fmt = (v: number | undefined, dec = decimalMax) => v ? formatNumber(v, dec) : '—';
    const row = (label: string, selector: (r: PhastResults) => number | undefined, dec = decimalMax): string[] =>
      [label, ...scenarios.map(r => fmt(selector(r), dec))];
    const pctRow = (label: string, selector: (r: PhastResults) => number | undefined, dec = 1): string[] =>
      [label, ...scenarios.map(r => { const v = selector(r); return v ? `${formatNumber(v, dec)}%` : '—'; })];

    const rows: string[][] = [
      row('Charge Materials', r => r.totalChargeMaterialLoss),
      row('Fixtures, trays etc.', r => r.totalFixtureLoss),
      row('Wall Losses', r => r.totalWallLoss),
      row('Cooling Losses', r => r.totalCoolingLoss),
      row('Atmosphere Losses', r => r.totalAtmosphereLoss),
      row('Opening Losses', r => r.totalOpeningLoss),
      row('Leakage Losses', r => r.totalLeakageLoss),
      row('Extended Surface Losses', r => r.totalExtSurfaceLoss),
    ];
    if (resultCats.showAuxPower) rows.push(row('Aux Power Losses', r => r.totalAuxPower));
    if (resultCats.showSlag) rows.push(row('Slag Losses', r => r.totalSlag));
    rows.push(
      row('Other Losses', r => r.totalOtherLoss),
      row('Total Available Heat Required', r => r.totalInput),
    );
    if (resultCats.showFlueGas) {
      rows.push(
        pctRow('Available Heat (%)', r => r.flueGasAvailableHeat),
        row('Flue Gas Losses', r => r.flueGasSystemLosses),
      );
    }
    rows.push(row('Exothermic Heat from Process', r => r.exothermicHeat));
    if (resultCats.showEnInput2) {
      rows.push(
        pctRow('Fuel Input Available Heat', r => r.availableHeatPercent, 0),
        row('Exhaust Gas Losses', r => r.totalExhaustGas),
      );
    }
    if (resultCats.showExGas) {
      rows.push(row('Exhaust Gas Losses', r => r.totalExhaustGasEAF));
    }
    if (resultCats.showSystemEff) {
      rows.push(
        pctRow('System Efficiency', r => r.heatingSystemEfficiency, 0),
        row('Total System Losses', r => r.totalSystemLosses),
      );
    }
    if (resultCats.showHeatDelivered) {
      rows.push(row('Fuel Heat Delivered', r => r.energyInputHeatDelivered));
    }
    if (resultCats.showEnInput2) {
      rows.push(row('Total Additional Fuel Heat', r => r.totalAdditionalFuelHeat));
    }
    if (resultCats.showElectricalDelivered && isEAF) {
      rows.push(row('Electrical Heat Delivered', r => r.energyInputHeatDelivered));
    }
    if (resultCats.showChemicalEnergyDelivered) {
      rows.push(row('Chemical Energy Delivered', r => r.energyInputTotalChemEnergy));
    }
    if (resultCats.showElectricalDelivered && !isEAF) {
      rows.push(row('Electrical Heat Delivered', r => r.electricalHeatDelivered));
    }
    if (resultCats.showEnInput2) {
      rows.push(
        row('Electrical Heater Losses', r => r.electricalHeaterLosses),
        row('Total Provided Electrical Heat', r => r.totalProvidedElectricalHeat),
      );
    }
    rows.push(row('Gross Heat Input', r => r.grossHeatInput));
    const emphasisRowsIndices = findRowIndices(rows, ['Gross Heat Input']);

    if (showCO2) {
      rows.push(row('CO2 Emissions', r => r.co2EmissionsOutput?.hourlyTotalEmissionOutput, 2));
      if (modResults.length > 0) {
        rows.push(['CO2 Emissions Savings', '—', ...modResults.map(r => fmt(r.co2EmissionsOutput?.emissionsSavings, 2))]);
      }
    }

    return [{
      type: 'summary-table', title: 'Result Data', group: 'results', headers, rows, emphasisRowsIndices, pageBreakBefore: true,
    }];
  }

  // ---------------------------------------------------------------------
  // Report Graphs
  // ---------------------------------------------------------------------

  /**
   * One "2 pies + 1 bar" group per modification (loss-distribution pies, heat-delivered pies if
   * present, comparison bar) so they paginate together instead of each chart claiming its own page —
   * only the very first chart in the whole group forces a page break, matching PSAT's convention.
   */
  private buildReportGraphsSections(baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings, resultCats: ShowResultsCategories): ChartSection[] {
    const lossUnit = settings.unitsOfMeasure === 'Metric' ? 'GJ/hr' : 'MMBtu/hr';
    const scenarios = [baseline, ...modBundles];
    const chartData = scenarios.map(s => ({
      name: s.name,
      valuesAndLabels: this.phastChartsService.getLossValuesAndLabels(s.results, resultCats),
      deliverValuesLabels: this.phastChartsService.getDeliverValuesAndLabels(s.results),
      valid: s.valid,
    }));

    const baselineData = chartData[0];
    const sections: ChartSection[] = [];

    if (!baselineData.valid.isValid) return sections;

    const validMods = modBundles
      .map((m, i) => ({ mod: m, data: chartData[i + 1] }))
      .filter(({ data }) => data.valid.isValid);

    if (validMods.length === 0) {
      const cells = [{ valuesAndLabels: baselineData.valuesAndLabels, unit: lossUnit, label: 'Loss Distribution' }];
      if (baselineData.deliverValuesLabels.length) {
        cells.push({ valuesAndLabels: baselineData.deliverValuesLabels, unit: 'kW', label: 'Heat Delivered' });
      }
      sections.push({
        type: 'chart', title: `${baselineData.name} Energy Distribution`, group: 'graphs', pageBreakBefore: true,
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.phastChartsService.buildPieChart(cells)),
      });
      return sections;
    }

    validMods.forEach(({ mod, data }, i) => {
      sections.push({
        type: 'chart', title: `Loss Distribution — Baseline vs. ${mod.name}`, group: 'graphs', pageBreakBefore: i === 0,
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.phastChartsService.buildPieChart([
          { valuesAndLabels: baselineData.valuesAndLabels, unit: lossUnit, label: 'Baseline' },
          { valuesAndLabels: data.valuesAndLabels, unit: lossUnit, label: mod.name },
        ])),
      });
      if (baselineData.deliverValuesLabels.length || data.deliverValuesLabels.length) {
        sections.push({
          type: 'chart', title: `Heat Delivered — Baseline vs. ${mod.name}`, group: 'graphs',
          imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.phastChartsService.buildPieChart([
            { valuesAndLabels: baselineData.deliverValuesLabels, unit: 'kW', label: 'Baseline' },
            { valuesAndLabels: data.deliverValuesLabels, unit: 'kW', label: mod.name },
          ])),
        });
      }
      sections.push({
        type: 'chart', title: `Baseline vs. ${mod.name} Loss Comparison`, group: 'graphs',
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.phastChartsService.buildLossBarChart([
          { name: 'Baseline', labels: baselineData.valuesAndLabels.map(v => v.label), values: baselineData.valuesAndLabels.map(v => v.value) },
          { name: mod.name, labels: data.valuesAndLabels.map(v => v.label), values: data.valuesAndLabels.map(v => v.value) },
        ], lossUnit)),
      });
    });

    return sections;
  }

  // ---------------------------------------------------------------------
  // Sankey
  // ---------------------------------------------------------------------

  private buildSankeySections(baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings): ChartSection[] {
    const sections: ChartSection[] = [{
      type: 'chart', title: `${baseline.name} Sankey`, group: 'sankey', pageBreakBefore: true, aspectRatio: 1400 / 500,
      imageDataProvider: async () => {
        if (!baseline.valid.isValid) throw new Error('Baseline Sankey unavailable — assessment invalid');
        return this.phastChartsService.renderSankeyAsImage(baseline.phast, settings);
      },
    }];

    modBundles.forEach(m => {
      sections.push({
        type: 'chart', title: `${m.name} Sankey`, group: 'sankey', aspectRatio: 1400 / 500,
        imageDataProvider: async () => {
          if (!m.valid.isValid) throw new Error(`${m.name} Sankey unavailable — assessment invalid`);
          return this.phastChartsService.renderSankeyAsImage(m.phast, settings);
        },
      });
    });

    return sections;
  }

  // ---------------------------------------------------------------------
  // Input Summary
  // ---------------------------------------------------------------------

  private getMaterialName(materials: Array<{ id?: number; substance?: string }>, id: number | undefined): string {
    if (!id) return '—';
    return materials.find(m => m.id === id)?.substance ?? '—';
  }

  private getSurfaceName(surfaces: Array<{ id?: number; surface?: string }>, id: number | undefined): string {
    if (!id) return '—';
    return surfaces.find(s => s.id === id)?.surface ?? '—';
  }

  /** Generic per-entry loss-array table builder used by the simpler (flat-field) loss categories. */
  private buildLossEntrySections<T>(
    title: string, baseline: ScenarioBundle, modBundles: ScenarioBundle[],
    lossesSelector: (phast: PHAST) => T[] | undefined,
    fields: Array<{ label: string; selector: (entry: T) => string | number | boolean | undefined; dec?: number; isPercent?: boolean }>,
  ): SummaryTableSection[] {
    const baseLosses = lossesSelector(baseline.phast) ?? [];
    if (!baseLosses.length) return [];
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];

    const fmtVal = (entry: T | undefined, field: typeof fields[number]): string => {
      if (entry == null) return '—';
      const v = field.selector(entry);
      if (v == null || v === '') return '—';
      if (typeof v === 'boolean') return v ? 'Yes' : 'No';
      if (typeof v === 'number') return field.isPercent ? `${formatNumber(v, field.dec ?? 2)}%` : formatNumber(v, field.dec ?? 2);
      return String(v);
    };

    return baseLosses.map((entry, i) => {
      const modEntries = modBundles.map(m => (lossesSelector(m.phast) ?? [])[i]);
      const rows: string[][] = fields.map(f => [f.label, fmtVal(entry, f), ...modEntries.map(e => fmtVal(e, f))]);
      return { type: 'summary-table', title: baseLosses.length > 1 ? `${title} ${i + 1}` : title, group: 'inputData', headers, rows };
    });
  }

  private chargeMaterialFields(loss: ChargeMaterial | undefined, lookups: MaterialLookups) {
    if (!loss) return undefined;
    if (loss.chargeMaterialType === 'Gas') {
      const g = loss.gasChargeMaterial;
      return {
        type: 'Gas', materialName: this.getMaterialName(lookups.gasMaterials, g?.materialId),
        reactionType: g?.thermicReactionType !== 0 ? 'Exothermic' : 'Endothermic',
        specificHeatGas: g?.specificHeatGas, specificHeatVapor: g?.specificHeatVapor, feedRate: g?.feedRate,
        percentVapor: g?.percentVapor, initialTemp: g?.initialTemperature, dischargeTemp: g?.dischargeTemperature,
        percentReacted: g?.percentReacted, reactionHeat: g?.reactionHeat, heatRequired: g?.heatRequired, additionalHeat: g?.additionalHeat,
        specificHeatSolid: undefined as number | undefined, specificHeatLiquid: undefined as number | undefined,
        latentHeat: undefined as number | undefined, meltingPoint: undefined as number | undefined,
        waterContentCharged: undefined as number | undefined, waterContentDischarged: undefined as number | undefined,
        waterVaporDischargeTemp: undefined as number | undefined, vaporizingTemperature: undefined as number | undefined, chargeMelted: undefined as number | undefined,
      };
    }
    if (loss.chargeMaterialType === 'Solid') {
      const s = loss.solidChargeMaterial;
      return {
        type: 'Solid', materialName: this.getMaterialName(lookups.solidMaterials, s?.materialId),
        reactionType: s?.thermicReactionType !== 0 ? 'Exothermic' : 'Endothermic',
        specificHeatSolid: s?.specificHeatSolid, specificHeatLiquid: s?.specificHeatLiquid, latentHeat: s?.latentHeat, meltingPoint: s?.meltingPoint,
        feedRate: s?.chargeFeedRate, initialTemp: s?.initialTemperature, dischargeTemp: s?.dischargeTemperature,
        percentReacted: s?.chargeReacted, chargeMelted: s?.chargeMelted, reactionHeat: s?.reactionHeat, heatRequired: s?.heatRequired, additionalHeat: s?.additionalHeat,
        waterContentCharged: s?.waterContentCharged, waterContentDischarged: s?.waterContentDischarged, waterVaporDischargeTemp: s?.waterVaporDischargeTemperature,
        specificHeatGas: undefined as number | undefined, specificHeatVapor: undefined as number | undefined,
        percentVapor: undefined as number | undefined, vaporizingTemperature: undefined as number | undefined,
      };
    }
    if (loss.chargeMaterialType === 'Liquid') {
      const l = loss.liquidChargeMaterial;
      return {
        type: 'Liquid', materialName: this.getMaterialName(lookups.liquidMaterials, l?.materialId),
        reactionType: l?.thermicReactionType !== 0 ? 'Exothermic' : 'Endothermic',
        specificHeatLiquid: l?.specificHeatLiquid, specificHeatVapor: l?.specificHeatVapor, vaporizingTemperature: l?.vaporizingTemperature,
        feedRate: l?.chargeFeedRate, percentVapor: l?.percentVaporized, initialTemp: l?.initialTemperature, dischargeTemp: l?.dischargeTemperature,
        percentReacted: l?.percentReacted, reactionHeat: l?.reactionHeat, heatRequired: l?.heatRequired, additionalHeat: l?.additionalHeat, latentHeat: l?.latentHeat,
        specificHeatSolid: undefined as number | undefined, specificHeatGas: undefined as number | undefined, meltingPoint: undefined as number | undefined,
        waterContentCharged: undefined as number | undefined, waterContentDischarged: undefined as number | undefined,
        waterVaporDischargeTemp: undefined as number | undefined, chargeMelted: undefined as number | undefined,
      };
    }
    return undefined;
  }

  private buildChargeMaterialSections(baseline: ScenarioBundle, modBundles: ScenarioBundle[], lookups: MaterialLookups): SummaryTableSection[] {
    const baseLosses = baseline.phast.losses?.chargeMaterials ?? [];
    if (!baseLosses.length) return [];
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';

    return baseLosses.map((loss, i) => {
      const baseData = this.chargeMaterialFields(loss, lookups);
      const modData = modBundles.map(m => this.chargeMaterialFields(m.phast.losses?.chargeMaterials?.[i], lookups));
      const cell = (selector: (d: NonNullable<typeof baseData>) => string | number | undefined, dec?: number): string[] => {
        const val = (d: typeof baseData): string => {
          if (!d) return '—';
          const v = selector(d);
          if (v == null) return '—';
          return typeof v === 'number' ? fmt(v, dec) : v;
        };
        return [val(baseData), ...modData.map(val)];
      };

      const rows: string[][] = [
        ['Material Type', ...cell(d => d.type)],
        ['Material Name', ...cell(d => d.materialName)],
        ['Reaction Type', ...cell(d => d.reactionType)],
      ];
      if (baseData?.type === 'Gas') rows.push(['Specific Heat (Gas)', ...cell(d => d.specificHeatGas, 4)]);
      if (baseData?.type === 'Solid') rows.push(['Specific Heat (Solid)', ...cell(d => d.specificHeatSolid, 4)]);
      if (baseData?.type === 'Solid' || baseData?.type === 'Liquid') rows.push(['Specific Heat (Liquid)', ...cell(d => d.specificHeatLiquid, 4)]);
      if (baseData?.type === 'Gas' || baseData?.type === 'Liquid') rows.push(['Specific Heat (Vapor)', ...cell(d => d.specificHeatVapor, 4)]);
      if (baseData?.type === 'Liquid') rows.push(['Vaporizing Temperature', ...cell(d => d.vaporizingTemperature, 1)]);
      if (baseData?.type === 'Solid') rows.push(['Melting Point', ...cell(d => d.meltingPoint, 1)]);
      if (baseData?.type === 'Solid' || baseData?.type === 'Liquid') rows.push(['Latent Heat', ...cell(d => d.latentHeat, 2)]);
      rows.push(
        ['Feed Rate', ...cell(d => d.feedRate, 2)],
        ['Initial Temperature', ...cell(d => d.initialTemp, 1)],
        ['Discharge Temperature', ...cell(d => d.dischargeTemp, 1)],
      );
      if (baseData?.type === 'Solid') {
        rows.push(
          ['Water Content Charged (%)', ...cell(d => d.waterContentCharged, 2)],
          ['Water Content Discharged (%)', ...cell(d => d.waterContentDischarged, 2)],
          ['Water Vapor Discharge Temperature', ...cell(d => d.waterVaporDischargeTemp, 1)],
          ['Charge Melted (%)', ...cell(d => d.chargeMelted, 2)],
        );
      }
      if (baseData?.type === 'Gas' || baseData?.type === 'Liquid') {
        rows.push(['% Vaporized', ...cell(d => d.percentVapor, 2)]);
      }
      rows.push(
        ['% Reacted', ...cell(d => d.percentReacted, 2)],
        ['Reaction Heat', ...cell(d => d.reactionHeat, 2)],
        ['Additional Heat Required', ...cell(d => d.additionalHeat, 2)],
        ['Heat Required', ...cell(d => d.heatRequired, 2)],
      );

      return { type: 'summary-table', title: baseLosses.length > 1 ? `Charge Material ${i + 1}` : 'Charge Material', group: 'inputData', headers, rows };
    });
  }

  private coolingFields(entry: CoolingLoss | undefined) {
    if (!entry) return undefined;
    const isGas = entry.coolingLossType === 'Gas';
    const gas = entry.gasCoolingLoss;
    const liquid = entry.liquidCoolingLoss;
    return {
      coolingMedium: entry.coolingMedium,
      specificHeat: isGas ? gas?.specificHeat : liquid?.specificHeat,
      flowRate: isGas ? gas?.flowRate : liquid?.flowRate,
      density: isGas ? (gas as GasCoolingLoss)?.gasDensity : (liquid as LiquidCoolingLoss)?.density,
      initialTemperature: isGas ? gas?.initialTemperature : liquid?.initialTemperature,
      outletTemperature: isGas ? (gas?.outletTemperature ?? gas?.finalTemperature) : (liquid?.finalTemperature ?? liquid?.outletTemperature),
      correctionFactor: isGas ? gas?.correctionFactor : liquid?.correctionFactor,
    };
  }

  private buildCoolingSections(baseline: ScenarioBundle, modBundles: ScenarioBundle[]): SummaryTableSection[] {
    const baseLosses = baseline.phast.losses?.coolingLosses ?? [];
    if (!baseLosses.length) return [];
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';

    return baseLosses.map((loss, i) => {
      const baseData = this.coolingFields(loss);
      const modData = modBundles.map(m => this.coolingFields(m.phast.losses?.coolingLosses?.[i]));
      const cell = (selector: (d: NonNullable<typeof baseData>) => string | number | undefined, dec?: number): string[] => {
        const val = (d: typeof baseData): string => {
          if (!d) return '—';
          const v = selector(d);
          if (v == null) return '—';
          return typeof v === 'number' ? fmt(v, dec) : v;
        };
        return [val(baseData), ...modData.map(val)];
      };
      const rows: string[][] = [
        ['Cooling Medium', ...cell(d => d.coolingMedium)],
        ['Specific Heat', ...cell(d => d.specificHeat, 4)],
        ['Flow Rate', ...cell(d => d.flowRate, 2)],
        ['Density', ...cell(d => d.density, 4)],
        ['Inlet Temperature', ...cell(d => d.initialTemperature, 1)],
        ['Outlet Temperature', ...cell(d => d.outletTemperature, 1)],
        ['Correction Factor', ...cell(d => d.correctionFactor, 2)],
      ];
      return { type: 'summary-table', title: baseLosses.length > 1 ? `Cooling Loss ${i + 1}` : 'Cooling Loss', group: 'inputData', headers, rows };
    });
  }

  private flueGasFields(loss: FlueGas | undefined) {
    if (!loss) return undefined;
    const byMass = loss.flueGasType === 'By Mass';
    const data = byMass ? loss.flueGasByMass : loss.flueGasByVolume;
    const fuelName = byMass
      ? this.solidLiquidMaterialDbService.getById(loss.flueGasByMass?.gasTypeId)?.substance
      : this.flueGasMaterialDbService.getById(loss.flueGasByVolume?.gasTypeId)?.substance;
    return {
      type: byMass ? 'Solid/Liquid' : 'Gas',
      fuelName,
      excessAirMethod: data?.oxygenCalculationMethod,
      oxygenInFlueGas: data?.o2InFlueGas,
      excessAir: data?.excessAirPercentage,
      flueGasTemp: data?.flueGasTemperature,
      combustionAirTemp: data?.combustionAirTemperature,
      fuelTemperature: data?.fuelTemperature,
      moistureInAir: data?.moistureInAirCombustion,
      ashDischargeTemp: byMass ? loss.flueGasByMass?.ashDischargeTemperature : undefined,
      unburnedCarbon: byMass ? loss.flueGasByMass?.unburnedCarbonInAsh : undefined,
    };
  }

  private buildFlueGasSections(baseline: ScenarioBundle, modBundles: ScenarioBundle[]): SummaryTableSection[] {
    const baseLosses = baseline.phast.losses?.flueGasLosses ?? [];
    if (!baseLosses.length) return [];
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';

    return baseLosses.map((loss, i) => {
      const baseData = this.flueGasFields(loss);
      const modData = modBundles.map(m => this.flueGasFields(m.phast.losses?.flueGasLosses?.[i]));
      const cell = (selector: (d: NonNullable<typeof baseData>) => string | number | undefined, dec?: number): string[] => {
        const val = (d: typeof baseData): string => {
          if (!d) return '—';
          const v = selector(d);
          if (v == null) return '—';
          return typeof v === 'number' ? fmt(v, dec) : v;
        };
        return [val(baseData), ...modData.map(val)];
      };
      const rows: string[][] = [
        ['Type', ...cell(d => d.type)],
        ['Fuel', ...cell(d => d.fuelName)],
        ['Flue Gas Temperature', ...cell(d => d.flueGasTemp, 1)],
        ['Excess Air Calculation Method', ...cell(d => d.excessAirMethod)],
        ['Oxygen in Flue Gas (%)', ...cell(d => d.oxygenInFlueGas, 2)],
        ['Excess Air (%)', ...cell(d => d.excessAir, 2)],
        ['Combustion Air Temperature', ...cell(d => d.combustionAirTemp, 1)],
        ['Fuel Temperature', ...cell(d => d.fuelTemperature, 1)],
        ['Moisture in Combustion Air (%)', ...cell(d => d.moistureInAir, 2)],
      ];
      if (baseData?.type === 'Solid/Liquid') {
        rows.push(
          ['Ash Discharge Temperature', ...cell(d => d.ashDischargeTemp, 1)],
          ['Unburned Carbon in Ash (%)', ...cell(d => d.unburnedCarbon, 2)],
        );
      }
      return { type: 'summary-table', title: baseLosses.length > 1 ? `Flue Gas ${i + 1}` : 'Flue Gas', group: 'inputData', headers, rows };
    });
  }

  private buildSystemEfficiencySection(baseline: ScenarioBundle, modBundles: ScenarioBundle[]): SummaryTableSection[] {
    if (!baseline.phast.systemEfficiency) return [];
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const fmt = (v: number | undefined) => v ? `${formatNumber(v, 1)}%` : '—';
    return [{
      type: 'summary-table', title: 'System Efficiency', group: 'inputData', headers,
      rows: [['System Efficiency', fmt(baseline.phast.systemEfficiency), ...modBundles.map(m => fmt(m.phast.systemEfficiency))]],
    }];
  }

  private buildOperationDataSection(phast: PHAST, baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings): SummaryTableSection {
    const headers = ['', 'Baseline', ...modBundles.map(m => m.name)];
    const isEAF = settings.furnaceType === 'Electric Arc Furnace (EAF)';
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';
    const energyCostUnit = settings.unitsOfMeasure === 'Metric' ? '/GJ' : '/MMBtu';

    const rows: string[][] = [
      ['Energy Source Type', settings.energySourceType ?? '—', ...modBundles.map(() => settings.energySourceType ?? '—')],
      ['Furnace Type', settings.furnaceType ?? '—', ...modBundles.map(() => settings.furnaceType ?? '—')],
      ['Operating Hours (hrs/yr)', fmt(baseline.phast.operatingHours?.hoursPerYear), ...modBundles.map(m => fmt(m.phast.operatingHours?.hoursPerYear))],
      [`Fuel Cost (${energyCostUnit})`, this.fmtUSD(baseline.phast.operatingCosts?.fuelCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.fuelCost))],
    ];
    if (isEAF) {
      rows.push(
        [`Coal Carbon Cost (${energyCostUnit})`, this.fmtUSD(baseline.phast.operatingCosts?.coalCarbonCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.coalCarbonCost))],
        [`Electrode Cost (${energyCostUnit})`, this.fmtUSD(baseline.phast.operatingCosts?.electrodeCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.electrodeCost))],
        [`Other Fuel Cost (${energyCostUnit})`, this.fmtUSD(baseline.phast.operatingCosts?.otherFuelCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.otherFuelCost))],
      );
    }
    rows.push(
      [`Steam Cost (${energyCostUnit})`, this.fmtUSD(baseline.phast.operatingCosts?.steamCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.steamCost))],
      ['Electricity Cost ($/kWh)', this.fmtUSD(baseline.phast.operatingCosts?.electricityCost), ...modBundles.map(m => this.fmtUSD(m.phast.operatingCosts?.electricityCost))],
    );

    return { type: 'summary-table', title: 'Operation Data', group: 'inputData', headers, rows };
  }

  private buildInputSummarySections(
    phast: PHAST, baseline: ScenarioBundle, modBundles: ScenarioBundle[], settings: Settings,
    resultCats: ShowResultsCategories, lookups: MaterialLookups,
  ): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [
      ...this.buildChargeMaterialSections(baseline, modBundles, lookups),
      ...this.buildLossEntrySections('Fixture Loss', baseline, modBundles, p => p.losses?.fixtureLosses, [
        { label: 'Material Name', selector: e => this.getMaterialName(lookups.solidMaterials, e.materialName) },
        { label: 'Specific Heat', selector: e => e.specificHeat, dec: 4 },
        { label: 'Fixture Weight Feed Rate', selector: e => e.feedRate, dec: 2 },
        { label: 'Initial Temperature', selector: e => e.initialTemperature, dec: 1 },
        { label: 'Final Temperature', selector: e => e.finalTemperature, dec: 1 },
        { label: 'Correction Factor', selector: e => e.correctionFactor, dec: 2 },
      ]),
      ...this.buildLossEntrySections('Wall Loss', baseline, modBundles, p => p.losses?.wallLosses, [
        { label: 'Average Surface Temperature', selector: e => e.surfaceTemperature, dec: 1 },
        { label: 'Ambient Temperature', selector: e => e.ambientTemperature, dec: 1 },
        { label: 'Wind Velocity', selector: e => e.windVelocity, dec: 2 },
        { label: 'Surface Shape/Orientation', selector: e => this.getSurfaceName(lookups.wallSurfaces, e.surfaceShape) },
        { label: 'Surface Shape/Orientation Factor', selector: e => e.conditionFactor, dec: 2 },
        { label: 'Surface Emissivity', selector: e => e.surfaceEmissivity, dec: 2 },
        { label: 'Total Outside Surface Area', selector: e => e.surfaceArea, dec: 2 },
        { label: 'Correction Factor', selector: e => e.correctionFactor, dec: 2 },
      ]),
      ...this.buildCoolingSections(baseline, modBundles),
      ...this.buildLossEntrySections('Atmosphere Loss', baseline, modBundles, p => p.losses?.atmosphereLosses, [
        { label: 'Atmosphere Gas', selector: e => this.getMaterialName(lookups.atmosphereGases, e.atmosphereGas) },
        { label: 'Specific Heat', selector: e => e.specificHeat, dec: 4 },
        { label: 'Inlet Temperature', selector: e => e.inletTemperature, dec: 1 },
        { label: 'Outlet Temperature', selector: e => e.outletTemperature, dec: 1 },
        { label: 'Flow Rate', selector: e => e.flowRate, dec: 2 },
        { label: 'Correction Factor', selector: e => e.correctionFactor, dec: 2 },
      ]),
      ...this.buildLossEntrySections('Opening Loss', baseline, modBundles, p => p.losses?.openingLosses, [
        { label: 'Opening Type', selector: e => e.openingType },
        { label: 'Number of Openings', selector: e => e.numberOfOpenings, dec: 0 },
        { label: 'Furnace Wall Thickness', selector: e => e.thickness, dec: 2 },
        { label: 'Length of Opening', selector: e => e.lengthOfOpening, dec: 2 },
        { label: 'Height of Opening', selector: e => e.heightOfOpening, dec: 2 },
        { label: 'Total Area of Openings', selector: e => e.openingTotalArea, dec: 2 },
        { label: 'View Factor', selector: e => e.viewFactor, dec: 2 },
        { label: 'Avg. Zone or Radiation Source Temp.', selector: e => e.insideTemperature, dec: 1 },
        { label: 'Ambient Temperature', selector: e => e.ambientTemperature, dec: 1 },
        { label: 'Emissivity', selector: e => e.emissivity, dec: 2 },
        { label: '% Time Open', selector: e => e.percentTimeOpen, dec: 1 },
      ]),
      ...this.buildLossEntrySections('Gas Leakage Loss', baseline, modBundles, p => p.losses?.leakageLosses, [
        { label: 'Furnace Draft Pressure', selector: e => e.draftPressure, dec: 4 },
        { label: 'Opening Area', selector: e => e.openingArea, dec: 2 },
        { label: 'Leakage Gas Temperature', selector: e => e.leakageGasTemperature, dec: 1 },
        { label: 'Specific Gravity', selector: e => e.specificGravity, dec: 2 },
        { label: 'Ambient Temperature', selector: e => e.ambientTemperature, dec: 1 },
      ]),
      ...this.buildLossEntrySections('Extended Surface Loss', baseline, modBundles, p => p.losses?.extendedSurfaces, [
        { label: 'Surface Area', selector: e => e.surfaceArea, dec: 2 },
        { label: 'Surface Temperature', selector: e => e.surfaceTemperature, dec: 1 },
        { label: 'Ambient Temperature', selector: e => e.ambientTemperature, dec: 1 },
        { label: 'Surface Emissivity', selector: e => e.surfaceEmissivity, dec: 2 },
      ]),
      ...this.buildLossEntrySections('Other Loss', baseline, modBundles, p => p.losses?.otherLosses, [
        { label: 'Description', selector: e => e.description },
        { label: 'Heat Loss', selector: e => e.heatLoss, dec: 2 },
      ]),
    ];

    if (resultCats.showAuxPower) {
      sections.push(...this.buildLossEntrySections('Auxiliary Power', baseline, modBundles, p => p.losses?.auxiliaryPowerLosses, [
        { label: 'Motor Phase', selector: e => e.motorPhase },
        { label: 'Supply Voltage', selector: e => e.supplyVoltage, dec: 1 },
        { label: 'Average Current', selector: e => e.avgCurrent, dec: 2 },
        { label: 'Power Factor', selector: e => e.powerFactor, dec: 2 },
        { label: 'Operating Time (%)', selector: e => e.operatingTime, dec: 1 },
      ]));
    }
    if (resultCats.showFlueGas) {
      sections.push(...this.buildFlueGasSections(baseline, modBundles));
    }
    if (resultCats.showSlag) {
      sections.push(...this.buildLossEntrySections('Slag', baseline, modBundles, p => p.losses?.slagLosses, [
        { label: 'Weight', selector: e => e.weight, dec: 2 },
        { label: 'Inlet Temperature', selector: e => e.inletTemperature, dec: 1 },
        { label: 'Outlet Temperature', selector: e => e.outletTemperature, dec: 1 },
        { label: 'Specific Heat', selector: e => e.specificHeat, dec: 4 },
        { label: 'Correction Factor', selector: e => e.correctionFactor, dec: 2 },
      ]));
    }
    if (resultCats.showExGas) {
      sections.push(...this.buildLossEntrySections('Exhaust Gas', baseline, modBundles, p => p.losses?.exhaustGasEAF, [
        { label: 'Off (Exhaust) Gas Temperature', selector: e => e.offGasTemp, dec: 1 },
        { label: 'CO (%)', selector: e => e.CO, dec: 2 },
        { label: 'H2 (%)', selector: e => e.H2, dec: 2 },
        { label: 'Combustible Gas as CH4 (%)', selector: e => e.combustibleGases, dec: 2 },
        { label: 'Total Volumetric Flow Rate', selector: e => e.vfr, dec: 2 },
        { label: 'Dust Loading', selector: e => e.dustLoading, dec: 2 },
      ]));
    }
    if (resultCats.showEnInput2) {
      sections.push(...this.buildLossEntrySections('Energy Input (Exhaust Gas)', baseline, modBundles, p => p.losses?.energyInputExhaustGasLoss, [
        { label: 'Electrical Heater Efficiency (%)', selector: e => e.electricalHeaterEfficiency, dec: 1 },
        { label: 'Total Additional Fuel Heat', selector: e => e.totalHeatInput, dec: 2 },
        { label: 'Available Heat of Fuel (%)', selector: e => e.availableHeat, dec: 1 },
      ]));
    }
    if (resultCats.showEnInput1) {
      sections.push(...this.buildLossEntrySections('Energy Input (EAF)', baseline, modBundles, p => p.losses?.energyInputEAF, [
        { label: 'Natural Gas Heat Input', selector: e => e.naturalGasHeatInput, dec: 2 },
        { label: 'Flow Rate Input', selector: e => e.flowRateInput, dec: 2 },
        { label: 'Coal Carbon Injection', selector: e => e.coalCarbonInjection, dec: 2 },
        { label: 'Coal Heating Value', selector: e => e.coalHeatingValue, dec: 2 },
        { label: 'Electrode Use', selector: e => e.electrodeUse, dec: 2 },
        { label: 'Electrode Heating Value', selector: e => e.electrodeHeatingValue, dec: 2 },
        { label: 'Other Fuels', selector: e => e.otherFuels, dec: 2 },
        { label: 'Electricity Input', selector: e => e.electricityInput, dec: 2 },
      ]));
    }
    if (resultCats.showSystemEff) {
      sections.push(...this.buildSystemEfficiencySection(baseline, modBundles));
    }
    sections.push(this.buildOperationDataSection(phast, baseline, modBundles, settings));

    sections.forEach((section, i) => { section.pageBreakBefore = i === 0; });
    return sections;
  }
}
