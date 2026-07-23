import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, formatNumber, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import {
  SSMT, SSMTInputs, SsmtValid, Modification, CondensingTurbine, PressureTurbine,
  HeaderWithHighestPressure, HeaderNotHighestPressure,
} from '../../shared/models/steam/ssmt';
import { SSMTOutput, SSMTLosses } from '../../shared/models/steam/steam-outputs';
import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { SsmtService } from '../ssmt.service';
import { CalculateLossesService } from '../calculate-losses.service';
import { CompareService } from '../compare.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { getSsmtPaybackPeriod } from '../../shared/payback-period.utils';
import { SsmtChartsService } from './ssmt-charts.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';

interface BaselineBundle {
  outputData: SSMTOutput;
  inputData: SSMTInputs;
  losses: SSMTLosses;
}

interface ModBundle {
  modification: Modification;
  outputData: SSMTOutput | undefined;
  inputData: SSMTInputs;
  losses: SSMTLosses | undefined;
  valid: SsmtValid;
}

export const SSMT_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'executiveSummary', label: 'Executive Summary', description: 'Baseline and modification results comparison' },
  { key: 'energySummary', label: 'Energy Summary', description: 'Annual energy, cost, and emissions summary' },
  { key: 'losses', label: 'Losses', description: 'Steam system energy loss breakdown' },
  { key: 'graphs', label: 'Report Graphs', description: 'Process usage, power generation, and energy waterfall charts' },
  { key: 'sankey', label: 'Report Sankey', description: 'Steam system energy flow diagram' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class SsmtReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly ssmtService = inject(SsmtService);
  private readonly calculateLossesService = inject(CalculateLossesService);
  private readonly compareService = inject(CompareService);
  private readonly solidLiquidMaterialDbService = inject(SolidLiquidMaterialDbService);
  private readonly flueGasMaterialDbService = inject(FlueGasMaterialDbService);
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly ssmtChartsService = inject(SsmtChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [243, 156, 18]; // #F39C12, matches the dashboard's steam tile

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    const ssmt = assessment.ssmt;

    const baseline = this.computeBaseline(ssmt, settings);
    const modBundles = this.computeModifications(ssmt, settings, baseline.outputData);

    const meta: ReportMeta = {
      title: assessment?.name ?? 'Steam System Report',
      date: new Date().toISOString(),
      moduleColor: SsmtReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildExecutiveSummarySections(ssmt, baseline, modBundles, settings),
        ...this.buildEnergySummarySections(ssmt, baseline, modBundles, settings),
        ...this.buildLossesSections(ssmt, baseline, modBundles, settings),
        ...this.buildReportGraphsSections(ssmt, baseline, modBundles, settings),
        ...this.buildSankeySections(baseline, modBundles, settings),
        ...this.buildInputSummarySections(baseline, modBundles, settings),
      ],
    });
  }

  // ---------------------------------------------------------------------------------
  // Calculation pipeline — mirrors ssmt-report.component.ts's ngOnInit exactly, since the
  // adapter only receives the Assessment and can't read that component's own fields.
  // ---------------------------------------------------------------------------------

  private computeBaseline(ssmt: SSMT, settings: Settings): BaselineBundle {
    ssmt.valid = this.ssmtService.checkValid(ssmt, settings);
    const resultData = this.ssmtService.calculateBaselineModel(ssmt, settings);
    ssmt.name = 'Baseline';
    const outputData = this.calculateResultsWithMarginalCosts(ssmt, resultData.outputData, settings);
    ssmt.outputData = outputData;
    const losses = this.calculateLossesService.calculateLosses(outputData, resultData.inputData, settings, ssmt);
    return { outputData, inputData: resultData.inputData, losses };
  }

  private computeModifications(ssmt: SSMT, settings: Settings, baselineOutput: SSMTOutput): ModBundle[] {
    return (ssmt.modifications ?? []).map(modification => {
      modification.ssmt.valid = this.ssmtService.checkValid(modification.ssmt, settings);
      const resultData = this.ssmtService.calculateModificationModel(modification.ssmt, settings, baselineOutput);
      if (!modification.ssmt.valid.isValid) {
        return { modification, outputData: undefined, inputData: resultData.inputData, losses: undefined, valid: modification.ssmt.valid };
      }
      const outputData = this.calculateResultsWithMarginalCosts(modification.ssmt, resultData.outputData, settings, baselineOutput);
      modification.ssmt.outputData = outputData;
      const losses = this.calculateLossesService.calculateLosses(outputData, resultData.inputData, settings, modification.ssmt);
      return { modification, outputData, inputData: resultData.inputData, losses, valid: modification.ssmt.valid };
    });
  }

  private calculateResultsWithMarginalCosts(ssmt: SSMT, outputData: SSMTOutput, settings: Settings, baselineResults?: SSMTOutput): SSMTOutput {
    const marginalCosts = ssmt.name === 'Baseline'
      ? this.ssmtService.calculateBaselineMarginalCosts(ssmt, outputData, settings)
      : this.ssmtService.calculateModificationMarginalCosts(ssmt, outputData, baselineResults, settings);
    outputData.marginalHPCost = marginalCosts.marginalHPCost;
    outputData.marginalMPCost = marginalCosts.marginalMPCost;
    outputData.marginalLPCost = marginalCosts.marginalLPCost;
    return outputData;
  }

  /**
   * Mirrors SettingsLabelPipe.transform, minus the Angular pipe wrapper — except for temperature
   * units, where the pipe's ℉/℃/K ligature symbols (Unicode 2100-214F block) fall outside jsPDF's
   * core-font WinAnsi/Latin-1 charset and corrupt the whole cell's text run when embedded. PSAT's
   * adapter sidesteps this entirely by interpolating the raw unit code with no symbol
   * (`Fluid Temperature (F)`); matching that here instead of trying to render the symbol.
   */
  private steamUnitLabel(value: string | undefined, per?: string): string {
    if (!value) return '';
    if (value === 'F' || value === 'C' || value === 'K') return value;
    // "H₂O" (mm/m H2O pressure units) is the only other non-WinAnsi character across all unit
    // definitions — normalize the subscript back to a plain "2" for the same reason as above.
    let display = this.convertUnitsService.getUnit(value).unit.name.display.replace('(', '').replace(')', '').replace(/₂/g, '2');
    if (per && value !== 'kWh') display += per;
    return display;
  }

  private validCell<T>(m: ModBundle, selector: (o: SSMTOutput) => T): T | undefined {
    return (m.valid.isValid && m.outputData?.boilerOutput) ? selector(m.outputData) : undefined;
  }

  // ---------------------------------------------------------------------------------
  // Executive Summary
  // ---------------------------------------------------------------------------------

  private buildExecutiveSummarySections(ssmt: SSMT, baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    if (modBundles.length === 0) return [];

    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';
    const baselineCost = baseline.outputData.operationsOutput.totalOperatingCost;

    const percentSavings = (m: ModBundle): string => {
      if (!m.valid.isValid || !m.outputData?.boilerOutput) return '—';
      const pct = this.getSavingsPercentage(baselineCost, m.outputData.operationsOutput.totalOperatingCost);
      return pct ? `${pct} %` : '—';
    };

    const costRow = (label: string, selector: (o: SSMTOutput) => number): string[] => [
      `${label} (${settings.currency}/yr)`,
      baseline.outputData.boilerOutput ? fmt(selector(baseline.outputData)) : '—',
      ...modBundles.map(m => fmt(this.validCell(m, selector))),
    ];
    const savingsRow = (selector: (o: SSMTOutput) => number): string[] => [
      'Savings',
      '—',
      ...modBundles.map(m => {
        const val = this.validCell(m, selector);
        return val != null ? fmt(selector(baseline.outputData) - val) : '—';
      }),
    ];

    const rows: string[][] = [
      ['Percent Savings (%)', '—', ...modBundles.map(percentSavings)],
      costRow('Power Cost', o => o.operationsOutput.powerGenerationCost),
      savingsRow(o => o.operationsOutput.powerGenerationCost),
      costRow('Fuel Cost', o => o.operationsOutput.boilerFuelCost),
      savingsRow(o => o.operationsOutput.boilerFuelCost),
      costRow('Make-up Water Cost', o => o.operationsOutput.makeupWaterCost),
      savingsRow(o => o.operationsOutput.makeupWaterCost),
      [`Annual Cost (${settings.currency})`, fmt(baselineCost), ...modBundles.map(m => fmt(this.validCell(m, o => o.operationsOutput.totalOperatingCost)))],
      [`Annual Savings (${settings.currency})`, '—', ...modBundles.map(m => {
        const val = this.validCell(m, o => o.operationsOutput.totalOperatingCost);
        return val != null ? fmt(baselineCost - val) : '—';
      })],
      ['Implementation Cost', '—', ...modBundles.map(m => fmt(m.modification.ssmt.operatingCosts?.implementationCosts))],
      ['Simple Payback Period (months)', '—', ...modBundles.map(m => {
        const implementationCost = m.modification.ssmt.operatingCosts?.implementationCosts;
        if (!implementationCost) return '—';
        const modCost = this.validCell(m, o => o.operationsOutput.totalOperatingCost);
        return modCost != null ? fmt(getSsmtPaybackPeriod(modCost, baselineCost, implementationCost)) : '—';
      })],
      ['Selected Energy Projects', '—', ...modBundles.map(m => this.getSelectedEnergyProjects(m.modification))],
      ['Modifications', '—', ...modBundles.map(m => {
        const list = this.getModificationsMadeList(ssmt, m.modification.ssmt);
        return list.length ? list.join(', ') : '—';
      })],
    ];

    return [{
      type: 'summary-table',
      title: 'Executive Summary',
      group: 'executiveSummary',
      headers,
      rows,
      emphasisRowsIndices: [7, 8],
      pageBreakBefore: true,
    }];
  }

  private getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    return Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
  }

  private getSelectedEnergyProjects(modification: Modification): string {
    const flags: Array<SavingsOpportunity | undefined> = [
      modification.exploreOppsShowOperationsData, modification.exploreOppsShowUnitCosts, modification.exploreOppsShowBoilerData,
      modification.exploreOppsShowCondensateHandling, modification.exploreOppsShowHeatLoss, modification.exploreOppsShowSteamUsage,
      modification.exploreOppsShowCondensingTurbine, modification.exploreOppsShowHighToLowPressureTurbine,
      modification.exploreOppsShowHighToMediumPressureTurbine, modification.exploreOppsShowMediumToLowPressureTurbine,
    ];
    const displays = flags.filter(opp => opp?.hasOpportunity).map(opp => opp!.display);
    return displays.length ? displays.join(', ') : '—';
  }

  private getModificationsMadeList(baselineSsmt: SSMT, modifiedSsmt: SSMT): string[] {
    const list: string[] = [];
    if (this.compareService.checkOperationsDifferent(baselineSsmt, modifiedSsmt)) list.push('Operations');
    if (this.compareService.checkBoilerDifferent(baselineSsmt, modifiedSsmt)) list.push('Boiler');
    if (this.compareService.checkHeaderDifferent(baselineSsmt, modifiedSsmt)) list.push('Header');
    if (this.compareService.checkTurbinesDifferent(baselineSsmt, modifiedSsmt)) list.push('Turbine');
    return list;
  }

  // ---------------------------------------------------------------------------------
  // Energy Summary
  // ---------------------------------------------------------------------------------

  private buildEnergySummarySections(ssmt: SSMT, baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    if (modBundles.length === 0) return [];

    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
    const powerUnit = this.steamUnitLabel(settings.steamPowerMeasurement);
    const massFlowUnit = this.steamUnitLabel(settings.steamMassFlowMeasurement);
    const energyPerHrUnit = this.steamUnitLabel(settings.steamEnergyMeasurement, '/hr');
    const volumeFlowUnit = this.steamUnitLabel(settings.steamVolumeFlowMeasurement);
    const volumeUnit = this.steamUnitLabel(settings.steamVolumeMeasurement);
    const numberOfHeaders = ssmt.headerInput.numberOfHeaders;
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';
    const boilerCell = (m: ModBundle, selector: (o: SSMTOutput) => number, dec = 0) =>
      (m.valid.isValid && m.outputData?.boilerOutput) ? fmt(selector(m.outputData), dec) : '—';
    const baselineBoilerCell = (selector: (o: SSMTOutput) => number, dec = 0) =>
      baseline.outputData.boilerOutput ? fmt(selector(baseline.outputData), dec) : '—';

    const rows: string[][] = [
      [`Operating Cost (${settings.currency})`, fmt(baseline.outputData.operationsOutput.totalOperatingCost),
        ...modBundles.map(m => fmt(this.validCell(m, o => o.operationsOutput.totalOperatingCost)))],
    ];
    if (showCO2) {
      rows.push(
        [`CO2 Emissions (${emissionsUnit})`, fmt(baseline.outputData.co2EmissionsOutput?.totalEmissionOutput, 2),
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.totalEmissionOutput), 2))],
        [`CO2 Emissions Savings (${emissionsUnit})`, '—',
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.emissionsSavings), 2))],
      );
    }
    rows.push(
      [`Power (${settings.currency}/yr)`, baselineBoilerCell(o => o.operationsOutput.powerGenerationCost), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.powerGenerationCost))],
      [`Demand (${powerUnit})`, baselineBoilerCell(o => o.operationsOutput.sitePowerDemand, 1), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.sitePowerDemand, 1))],
      [`Generation (${powerUnit})`, baselineBoilerCell(o => o.operationsOutput.powerGenerated, 1), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.powerGenerated, 1))],
      [`Import (${powerUnit})`, baselineBoilerCell(o => o.operationsOutput.sitePowerImport, 1), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.sitePowerImport, 1))],
      [`Fuel (${settings.currency}/yr)`, baselineBoilerCell(o => o.operationsOutput.boilerFuelCost), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.boilerFuelCost))],
      [`Total Steam Generated (${massFlowUnit}/hr)`, baselineBoilerCell(o => o.boilerOutput.steamMassFlow, 1), ...modBundles.map(m => boilerCell(m, o => o.boilerOutput.steamMassFlow, 1))],
      [`Boiler Fuel (${energyPerHrUnit})`, baselineBoilerCell(o => o.boilerOutput.fuelEnergy, 2), ...modBundles.map(m => boilerCell(m, o => o.boilerOutput.fuelEnergy, 2))],
      [`Make-up Water (${settings.currency}/yr)`, baselineBoilerCell(o => o.operationsOutput.makeupWaterCost), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.makeupWaterCost))],
      [`Flow (${volumeFlowUnit})`, baselineBoilerCell(o => o.operationsOutput.makeupWaterVolumeFlow, 2), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.makeupWaterVolumeFlow, 2))],
      [`Flow (${volumeUnit}/yr)`, baselineBoilerCell(o => o.operationsOutput.makeupWaterVolumeFlowAnnual, 2), ...modBundles.map(m => boilerCell(m, o => o.operationsOutput.makeupWaterVolumeFlowAnnual, 2))],
      [`HP Steam Cost ($/${massFlowUnit})`, baselineBoilerCell(o => o.marginalHPCost, 2), ...modBundles.map(m => boilerCell(m, o => o.marginalHPCost, 2))],
    );
    if (numberOfHeaders === 3) {
      rows.push([`MP Steam Cost ($/${massFlowUnit})`, baselineBoilerCell(o => o.marginalMPCost, 2), ...modBundles.map(m => boilerCell(m, o => o.marginalMPCost, 2))]);
    }
    if (numberOfHeaders > 1) {
      rows.push([`LP Steam Cost ($/${massFlowUnit})`, baselineBoilerCell(o => o.marginalLPCost, 2), ...modBundles.map(m => boilerCell(m, o => o.marginalLPCost, 2))]);
    }
    if (showCO2) {
      rows.push(
        [`CO2 Emissions (${emissionsUnit})`, fmt(baseline.outputData.co2EmissionsOutput?.fuelEmissionOutput, 2),
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.fuelEmissionOutput), 2))],
        ['Emissions From Fuel', fmt(baseline.outputData.co2EmissionsOutput?.fuelEmissionOutput, 2),
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.fuelEmissionOutput), 2))],
        ['Emissions From Selling Electricity', fmt(baseline.outputData.co2EmissionsOutput?.electricityEmissionsFromSelling, 2),
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.electricityEmissionsFromSelling), 2))],
        ['Emissions From Change in Electricity Imports', fmt(baseline.outputData.co2EmissionsOutput?.electricityEmissionsFromChange, 2),
          ...modBundles.map(m => fmt(this.validCell(m, o => o.co2EmissionsOutput?.electricityEmissionsFromChange), 2))],
      );
    }

    return [{
      type: 'summary-table',
      title: 'Energy Summary',
      group: 'energySummary',
      headers,
      rows,
      pageBreakBefore: true,
    }];
  }

  // ---------------------------------------------------------------------------------
  // Losses
  // ---------------------------------------------------------------------------------

  private buildLossesSections(ssmt: SSMT, baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    if (modBundles.length === 0) return [];

    const energyPerHrUnit = this.steamUnitLabel(settings.steamEnergyMeasurement, '/hr');
    const numberOfHeaders = ssmt.headerInput.numberOfHeaders;
    const fmt = (v: number | undefined) => v ? formatNumber(v, 2) : '—';
    const validLosses = modBundles.filter(m => m.valid.isValid && m.losses).map(m => m.losses as SSMTLosses);
    const anyLoss = (selector: (l: SSMTLosses) => boolean): boolean => selector(baseline.losses) || validLosses.some(selector);

    const showCondensingTurbine = anyLoss(l => l.showCondensingTurbine);
    const showHighToLowTurbine = anyLoss(l => l.showHighToLowTurbine);
    const showHighToMediumTurbine = anyLoss(l => l.showHighToMediumTurbine);
    const showMediumToLowTurbine = anyLoss(l => l.showMediumToLowTurbine);
    const showCondensingLoss = anyLoss(l => !!l.condensingLosses);
    const showLowPressureVentedSteam = anyLoss(l => !!l.lowPressureVentLoss);
    const showCondensateFlashTank = anyLoss(l => !!l.condensateFlashTankLoss);

    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const lossRow = (label: string, selector: (l: SSMTLosses) => number): string[] => [
      label,
      fmt(selector(baseline.losses)),
      ...modBundles.map(m => (m.valid.isValid && m.losses) ? fmt(selector(m.losses)) : '—'),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) => appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Input Energy', [
      lossRow('Fuel', l => l.fuelEnergy),
      lossRow('Water', l => l.makeupWaterEnergy),
    ]);

    const usefulEnergyRows: string[][] = [];
    if (showCondensingTurbine) usefulEnergyRows.push(lossRow('Condensing Turbine', l => l.condensingTurbineUsefulEnergy));
    if (numberOfHeaders > 1 && showHighToLowTurbine) usefulEnergyRows.push(lossRow('High to Low Pressure Turbine', l => l.highToLowTurbineUsefulEnergy));
    if (numberOfHeaders === 3 && showHighToMediumTurbine) usefulEnergyRows.push(lossRow('High to Medium Pressure Turbine', l => l.highToMediumTurbineUsefulEnergy));
    if (numberOfHeaders === 3 && showMediumToLowTurbine) usefulEnergyRows.push(lossRow('Medium to Low Pressure Turbine', l => l.mediumToLowTurbineUsefulEnergy));
    usefulEnergyRows.push(lossRow('Returned Steam and Condensate', l => l.returnedSteamAndCondensate));
    addGroup('Useful Energy', usefulEnergyRows);

    addGroup('Process Usage', [
      lossRow('High Pressure', l => l.highPressureProcessUsage),
      lossRow('Medium Pressure', l => l.mediumPressureProcessUsage),
      lossRow('Low Pressure', l => l.lowPressureProcessUsage),
    ]);

    addGroup('Boiler', [
      lossRow('Stack', l => l.stack),
      lossRow('Blowdown', l => l.blowdown),
    ]);

    const headerRows: string[][] = [lossRow('High Pressure Loss', l => l.highPressureHeader)];
    if (numberOfHeaders === 3) headerRows.push(lossRow('Medium Pressure Loss', l => l.mediumPressureHeader));
    if (numberOfHeaders > 1) headerRows.push(lossRow('Low Pressure Loss', l => l.lowPressureHeader));
    addGroup('Header', headerRows);

    if (showCondensingTurbine || showHighToLowTurbine || showHighToMediumTurbine || showMediumToLowTurbine || showCondensingLoss) {
      const turbineRows: string[][] = [];
      if (showCondensingTurbine) turbineRows.push(lossRow('Condensing Turbine Efficiency Loss', l => l.condensingTurbineEfficiencyLoss));
      if (numberOfHeaders === 3 && showHighToMediumTurbine) turbineRows.push(lossRow('High to Medium Turbine Efficiency Loss', l => l.highToMediumTurbineEfficiencyLoss));
      if (numberOfHeaders > 1 && showHighToLowTurbine) turbineRows.push(lossRow('High to Low Turbine Efficiency Loss', l => l.highToLowTurbineEfficiencyLoss));
      if (numberOfHeaders === 3 && showMediumToLowTurbine) turbineRows.push(lossRow('Medium to Low Turbine Efficiency Loss', l => l.mediumToLowTurbineEfficiencyLoss));
      if (showCondensingLoss) turbineRows.push(lossRow('Condensing Loss', l => l.condensingLosses));
      addGroup('Turbine', turbineRows);
    }

    addGroup('Condensate', [lossRow('Condensate Heat Loss', l => l.condensateLosses)]);

    const ventingRows: string[][] = [];
    if (showLowPressureVentedSteam) ventingRows.push(lossRow('Low Pressure Vented Steam Loss', l => l.lowPressureVentLoss));
    if (showCondensateFlashTank) ventingRows.push(lossRow('Condensate Flash Tank Loss', l => l.condensateFlashTankLoss));
    ventingRows.push(lossRow('Deaerator Vent Loss', l => l.deaeratorVentLoss));
    addGroup('Venting Losses', ventingRows);

    const nonRecoveredRows: string[][] = [lossRow('High Pressure', l => l.highPressureProcessLoss)];
    if (numberOfHeaders === 3) nonRecoveredRows.push(lossRow('Medium Pressure', l => l.mediumPressureProcessLoss));
    if (numberOfHeaders > 1) nonRecoveredRows.push(lossRow('Low Pressure', l => l.lowPressureProcessLoss));
    addGroup('Non-recovered Process Losses', nonRecoveredRows);

    return [{
      type: 'summary-table',
      title: `Losses (${energyPerHrUnit})`,
      group: 'losses',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore: true,
    }];
  }

  // ---------------------------------------------------------------------------------
  // Report Graphs
  // ---------------------------------------------------------------------------------

  /**
   * Ported from the legacy print system's ReportGraphsPrintComponent layout: one "Scenario: {mod}"
   * page per valid modification, pairing Baseline's Process Usage/Generation pies against that
   * modification's (2x2 grid), plus a separate page stacking Baseline's Energy Usage waterfall
   * above the modification's. Falls back to the print component's zero-modification layout
   * (Process Usage next to Generation, single waterfall) when there are no valid modifications.
   * xAxisRange mirrors ReportGraphsComponent.setWaterfallXAxis(): shared across every waterfall so
   * they're visually comparable, not independently scaled per variant.
   */
  private buildReportGraphsSections(ssmt: SSMT, baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): ChartSection[] {
    const validMods = modBundles.filter((m): m is ModBundle & { losses: SSMTLosses; outputData: SSMTOutput } => m.valid.isValid && !!m.losses && !!m.outputData);
    const xAxisRange = Math.max(
      baseline.losses.fuelEnergy + baseline.losses.makeupWaterEnergy,
      ...validMods.map(m => m.losses.fuelEnergy + m.losses.makeupWaterEnergy),
    );

    if (validMods.length === 0) {
      return [
        {
          type: 'chart', title: 'Baseline', group: 'graphs', pageBreakBefore: true,
          imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.ssmtChartsService.buildBaselineOnlyPieChart(ssmt, settings)),
        },
        {
          type: 'chart', title: 'Baseline Energy Usage', group: 'graphs',
          imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.ssmtChartsService.buildScenarioWaterfallChart(baseline.losses, null, 'Baseline', null, settings, xAxisRange)),
        },
      ];
    }

    const sections: ChartSection[] = [];
    validMods.forEach(m => {
      const modName = m.modification.ssmt.name;
      sections.push({
        type: 'chart', title: `Scenario: ${modName}`, group: 'graphs', pageBreakBefore: true,
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.ssmtChartsService.buildScenarioPieChart(ssmt, m.modification.ssmt, 'Baseline', modName, settings)),
      });
      sections.push({
        type: 'chart', title: `Baseline vs. ${modName} Energy Usage`, group: 'graphs',
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.ssmtChartsService.buildScenarioWaterfallChart(baseline.losses, m.losses, 'Baseline', modName, settings, xAxisRange)),
      });
    });

    return sections;
  }

  // ---------------------------------------------------------------------------------
  // Report Sankey
  // ---------------------------------------------------------------------------------

  /** Baseline + one per valid modification — invalid modifications have no losses/outputData to build a sankey from. */
  private buildSankeySections(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): ChartSection[] {
    const sections: ChartSection[] = [{
      type: 'chart',
      title: 'Baseline Steam System Sankey',
      group: 'sankey',
      pageBreakBefore: true,
      imageDataProvider: async () => {
        const image = await this.ssmtChartsService.renderSankeyAsImage(baseline.losses, baseline.outputData, settings);
        if (!image) throw new Error('Baseline Sankey unavailable — steam modeler error');
        return image;
      },
    }];

    modBundles.forEach(m => {
      if (!m.valid.isValid) return;
      sections.push({
        type: 'chart',
        title: `${m.modification.ssmt.name} Steam System Sankey`,
        group: 'sankey',
        imageDataProvider: async () => {
          const image = await this.ssmtChartsService.renderSankeyAsImage(m.losses, m.outputData, settings);
          if (!image) throw new Error(`${m.modification.ssmt.name} Sankey unavailable — steam modeler error`);
          return image;
        },
      });
    });

    return sections;
  }

  // ---------------------------------------------------------------------------------
  // Input Summary
  // ---------------------------------------------------------------------------------

  private buildInputSummarySections(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [
      this.buildOperationsSection(baseline, modBundles, settings),
      this.buildBoilerSection(baseline, modBundles, settings),
      ...this.buildHeaderSections(baseline, modBundles, settings),
      ...this.buildTurbineSections(baseline, modBundles, settings),
    ];
    return sections;
  }

  private buildOperationsSection(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection {
    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const energyUnit = this.steamUnitLabel(settings.steamEnergyMeasurement);
    const volumeUnit = this.steamUnitLabel(settings.steamVolumeMeasurement);
    const powerUnit = this.steamUnitLabel(settings.steamPowerMeasurement);
    const tempUnit = this.steamUnitLabel(settings.steamTemperatureMeasurement);
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';

    const rows: string[][] = [
      ['Annual Operating Hours', fmt(baseline.inputData.operationsInput.operatingHoursPerYear), ...modBundles.map(m => fmt(m.inputData.operationsInput.operatingHoursPerYear))],
      [`Fuel Cost ($/${energyUnit})`, fmt(baseline.inputData.operationsInput.fuelCosts, 2), ...modBundles.map(m => fmt(m.inputData.operationsInput.fuelCosts, 2))],
      ['Electricity Cost ($/kWh)', fmt(baseline.inputData.operationsInput.electricityCosts, 2), ...modBundles.map(m => fmt(m.inputData.operationsInput.electricityCosts, 2))],
      [`Make-up Water Cost ($/${volumeUnit})`, fmt(baseline.inputData.operationsInput.makeUpWaterCosts, 2), ...modBundles.map(m => fmt(m.inputData.operationsInput.makeUpWaterCosts, 2))],
      [`Site Power Import (${powerUnit})`, fmt(baseline.inputData.operationsInput.sitePowerImport, 1), ...modBundles.map(m => fmt(m.inputData.operationsInput.sitePowerImport, 1))],
    ];
    if (showCO2) {
      rows.push(
        ['Total Fuel Emissions Output Rate (kg CO2/MWh)', fmt(baseline.inputData.co2SavingsData?.totalFuelEmissionOutputRate, 2), ...modBundles.map(m => fmt(m.inputData.co2SavingsData?.totalFuelEmissionOutputRate, 2))],
        ['Total Emissions Output Rate (kg CO2/MWh)', fmt(baseline.inputData.co2SavingsData?.totalEmissionOutputRate, 2), ...modBundles.map(m => fmt(m.inputData.co2SavingsData?.totalEmissionOutputRate, 2))],
      );
    }
    rows.push([`Make-up Water Temp (${tempUnit})`, fmt(baseline.inputData.operationsInput.makeUpWaterTemperature, 1), ...modBundles.map(m => fmt(m.inputData.operationsInput.makeUpWaterTemperature, 1))]);

    return { type: 'summary-table', title: 'Operations', group: 'inputData', headers, rows, pageBreakBefore: true };
  }

  private buildBoilerSection(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection {
    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const tempUnit = this.steamUnitLabel(settings.steamTemperatureMeasurement);
    const pressureUnit = this.steamUnitLabel(settings.steamPressureMeasurement);
    const fmt = (v: number | undefined, dec = 1) => v ? formatNumber(v, dec) : '—';

    const fuelTypeLabel = (fuelType: number) => fuelType === 0 ? 'Solid/Liquid' : 'Gas';
    const yesNo = (v: boolean) => v ? 'Yes' : 'No';

    const rows: string[][] = [
      ['Fuel Type', fuelTypeLabel(baseline.inputData.boilerInput.fuelType), ...modBundles.map(m => fuelTypeLabel(m.inputData.boilerInput.fuelType))],
      ['Fuel', this.getFuelType(baseline.inputData.boilerInput.fuelType, baseline.inputData.boilerInput.fuel), ...modBundles.map(m => this.getFuelType(m.inputData.boilerInput.fuelType, m.inputData.boilerInput.fuel))],
      ['Combustion Efficiency (%)', fmt(baseline.inputData.boilerInput.combustionEfficiency), ...modBundles.map(m => fmt(m.inputData.boilerInput.combustionEfficiency))],
      ['Blowdown Rate (%)', fmt(baseline.inputData.boilerInput.blowdownRate), ...modBundles.map(m => fmt(m.inputData.boilerInput.blowdownRate))],
      [`Steam Temperature (${tempUnit})`, fmt(baseline.inputData.boilerInput.steamTemperature), ...modBundles.map(m => fmt(m.inputData.boilerInput.steamTemperature))],
      ['Is Blowdown Flashed?', yesNo(baseline.inputData.boilerInput.blowdownFlashed), ...modBundles.map(m => yesNo(m.inputData.boilerInput.blowdownFlashed))],
      ['Preheat Make-up Water?', yesNo(baseline.inputData.boilerInput.preheatMakeupWater), ...modBundles.map(m => yesNo(m.inputData.boilerInput.preheatMakeupWater))],
      [`Approach Temperature (${tempUnit})`, fmt(baseline.inputData.boilerInput.approachTemperature), ...modBundles.map(m => fmt(m.inputData.boilerInput.approachTemperature))],
      ['Deaerator Vent Rate (%)', fmt(baseline.inputData.boilerInput.deaeratorVentRate), ...modBundles.map(m => fmt(m.inputData.boilerInput.deaeratorVentRate))],
      [`Deaerator Pressure (${pressureUnit})`, fmt(baseline.inputData.boilerInput.deaeratorPressure), ...modBundles.map(m => fmt(m.inputData.boilerInput.deaeratorPressure))],
    ];

    return { type: 'summary-table', title: 'Boiler', group: 'inputData', headers, rows, pageBreakBefore: true };
  }

  /** Ported from BoilerSummaryComponent.getFuelType: fuelType 0 = Solid/Liquid, 1 = Gas; looks up the material's display name by id. */
  private getFuelType(fuelType: number, fuel: number): string {
    if (fuelType === 0) {
      return this.solidLiquidMaterialDbService.getAllMaterials().find(material => material.id === fuel)?.substance ?? '—';
    }
    return this.flueGasMaterialDbService.getAllMaterials().find(material => material.id === fuel)?.substance ?? '—';
  }

  private buildHeaderSections(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    const numberOfHeaders = baseline.inputData.headerInput.numberOfHeaders;
    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];

    const sections: SummaryTableSection[] = [{
      type: 'summary-table', title: 'Header', group: 'inputData',
      headers, rows: [['Number of Headers', String(numberOfHeaders), ...modBundles.map(m => String(m.inputData.headerInput.numberOfHeaders))]],
      pageBreakBefore: true,
    }];

    sections.push(this.buildHeaderLevelSection('High Pressure Header', 'high', baseline, modBundles, settings));
    if (numberOfHeaders === 3) sections.push(this.buildHeaderLevelSection('Medium Pressure Header', 'medium', baseline, modBundles, settings));
    if (numberOfHeaders > 1) sections.push(this.buildHeaderLevelSection('Low Pressure Header', 'low', baseline, modBundles, settings));

    return sections;
  }

  private buildHeaderLevelSection(
    title: string, level: 'high' | 'medium' | 'low', baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings,
  ): SummaryTableSection {
    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const pressureUnit = this.steamUnitLabel(settings.steamPressureMeasurement);
    const massFlowPerHrUnit = this.steamUnitLabel(settings.steamMassFlowMeasurement, '/hr');
    const tempUnit = this.steamUnitLabel(settings.steamTemperatureMeasurement);
    const fmt = (v: number | undefined, dec = 1) => v ? formatNumber(v, dec) : '—';
    const yesNo = (v: boolean) => v ? 'Yes' : 'No';

    const headerOf = (inputData: SSMTInputs): HeaderWithHighestPressure | HeaderNotHighestPressure =>
      level === 'high' ? inputData.headerInput.highPressureHeader
        : level === 'medium' ? inputData.headerInput.mediumPressureHeader
        : inputData.headerInput.lowPressureHeader;

    const baselineHeader = headerOf(baseline.inputData);
    const processSteamUsageCell = (m: ModBundle): string => {
      const header = headerOf(m.inputData) as HeaderNotHighestPressure;
      if (level === 'high' || !header.useBaselineProcessSteamUsage) return fmt(header.processSteamUsage);
      if (!m.valid.isValid || !m.outputData) return '—';
      const usage = level === 'low' ? m.outputData.lowPressureProcessSteamUsage : m.outputData.mediumPressureProcessSteamUsage;
      return usage?.massFlow != null ? `*${formatNumber(usage.massFlow, 2)}` : '—';
    };

    const rows: string[][] = [
      [`Pressure (${pressureUnit})`, fmt(baselineHeader.pressure), ...modBundles.map(m => fmt(headerOf(m.inputData).pressure))],
      [`Process Steam Usage (${massFlowPerHrUnit})`, fmt(baselineHeader.processSteamUsage), ...modBundles.map(processSteamUsageCell)],
      ['Condensation Recovery Rate (%)', fmt(baselineHeader.condensationRecoveryRate), ...modBundles.map(m => fmt(headerOf(m.inputData).condensationRecoveryRate))],
      ['Heat Loss (%)', fmt(baselineHeader.heatLoss), ...modBundles.map(m => fmt(headerOf(m.inputData).heatLoss))],
    ];

    if (level === 'high') {
      const baselineHigh = baselineHeader as HeaderWithHighestPressure;
      rows.push(
        ['Flash Condensate Return?', yesNo(baselineHigh.flashCondensateReturn), ...modBundles.map(m => yesNo((headerOf(m.inputData) as HeaderWithHighestPressure).flashCondensateReturn))],
        [`Condensate Return Temperature (${tempUnit})`, fmt(baselineHigh.condensateReturnTemperature), ...modBundles.map(m => fmt((headerOf(m.inputData) as HeaderWithHighestPressure).condensateReturnTemperature))],
      );
    } else {
      const baselineNotHigh = baselineHeader as HeaderNotHighestPressure;
      rows.push(
        ['Flash Condensate Into Header?', yesNo(baselineNotHigh.flashCondensateIntoHeader), ...modBundles.map(m => yesNo((headerOf(m.inputData) as HeaderNotHighestPressure).flashCondensateIntoHeader))],
        ['Desuperheat Steam Into Next Highest?', yesNo(baselineNotHigh.desuperheatSteamIntoNextHighest), ...modBundles.map(m => yesNo((headerOf(m.inputData) as HeaderNotHighestPressure).desuperheatSteamIntoNextHighest))],
        [`Desuperheat Steam Temperature (${tempUnit})`, fmt(baselineNotHigh.desuperheatSteamTemperature), ...modBundles.map(m => fmt((headerOf(m.inputData) as HeaderNotHighestPressure).desuperheatSteamTemperature))],
      );
    }

    return { type: 'summary-table', title, group: 'inputData', headers, rows };
  }

  private buildTurbineSections(baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings): SummaryTableSection[] {
    const numberOfHeaders = baseline.inputData.headerInput.numberOfHeaders;
    const hasTurbine = (inputData: SSMTInputs, key: 'condensingTurbine' | 'highToLowTurbine' | 'highToMediumTurbine' | 'mediumToLowTurbine') =>
      inputData.turbineInput[key].useTurbine === true;

    const showCondensingTurbine = hasTurbine(baseline.inputData, 'condensingTurbine') || modBundles.some(m => hasTurbine(m.inputData, 'condensingTurbine'));
    const showHighToLowTurbine = numberOfHeaders > 1 && (hasTurbine(baseline.inputData, 'highToLowTurbine') || modBundles.some(m => m.inputData.headerInput.numberOfHeaders > 1 && hasTurbine(m.inputData, 'highToLowTurbine')));
    const showHighToMediumTurbine = numberOfHeaders === 3 && (hasTurbine(baseline.inputData, 'highToMediumTurbine') || modBundles.some(m => m.inputData.headerInput.numberOfHeaders === 3 && hasTurbine(m.inputData, 'highToMediumTurbine')));
    const showMediumToLowTurbine = numberOfHeaders === 3 && (hasTurbine(baseline.inputData, 'mediumToLowTurbine') || modBundles.some(m => m.inputData.headerInput.numberOfHeaders === 3 && hasTurbine(m.inputData, 'mediumToLowTurbine')));

    const sections: SummaryTableSection[] = [];
    if (showCondensingTurbine) sections.push(this.buildTurbineLevelSection('Condensing Turbine', 'condensingTurbine', baseline, modBundles, settings));
    if (showHighToLowTurbine) sections.push(this.buildTurbineLevelSection('High To Low Pressure Turbine', 'highToLowTurbine', baseline, modBundles, settings));
    if (showHighToMediumTurbine) sections.push(this.buildTurbineLevelSection('High To Medium Pressure Turbine', 'highToMediumTurbine', baseline, modBundles, settings));
    if (showMediumToLowTurbine) sections.push(this.buildTurbineLevelSection('Medium To Low Pressure Turbine', 'mediumToLowTurbine', baseline, modBundles, settings));
    return sections;
  }

  private buildTurbineLevelSection(
    title: string, key: 'condensingTurbine' | 'highToLowTurbine' | 'highToMediumTurbine' | 'mediumToLowTurbine',
    baseline: BaselineBundle, modBundles: ModBundle[], settings: Settings,
  ): SummaryTableSection {
    const headers = ['', 'Baseline', ...modBundles.map(m => m.modification.ssmt.name)];
    const isCondensing = key === 'condensingTurbine';
    const massFlowPerHrUnit = this.steamUnitLabel(settings.steamMassFlowMeasurement, '/hr');
    const vacuumPressureUnit = this.steamUnitLabel(settings.steamVacuumPressure);
    const fmt = (v: number | undefined, dec = 1) => v ? formatNumber(v, dec) : '—';

    const turbineOf = (inputData: SSMTInputs): CondensingTurbine | PressureTurbine => inputData.turbineInput[key];
    const cell = (t: CondensingTurbine | PressureTurbine, selector: (t: CondensingTurbine | PressureTurbine) => number | undefined, dec = 1): string =>
      t.useTurbine ? fmt(selector(t), dec) : '—';

    const operationTypeLabel = (t: CondensingTurbine | PressureTurbine): string => {
      if (!t.useTurbine) return '—';
      if (isCondensing) return t.operationType === 0 ? 'Fixed Flow' : 'Fixed Power';
      return ['Steam Flow', 'Power Generation', 'Balance Header', 'Power Range', 'Flow Range'][t.operationType] ?? '—';
    };

    const baselineTurbine = turbineOf(baseline.inputData);

    const rows: string[][] = [
      ['Isentropic Efficiency (%)', cell(baselineTurbine, t => t.isentropicEfficiency), ...modBundles.map(m => cell(turbineOf(m.inputData), t => t.isentropicEfficiency))],
      ['Generation Efficiency (%)', cell(baselineTurbine, t => t.generationEfficiency), ...modBundles.map(m => cell(turbineOf(m.inputData), t => t.generationEfficiency))],
    ];

    if (isCondensing) {
      rows.push([`Condenser Pressure (${vacuumPressureUnit})`, cell(baselineTurbine as CondensingTurbine, t => (t as CondensingTurbine).condenserPressure),
        ...modBundles.map(m => cell(turbineOf(m.inputData) as CondensingTurbine, t => (t as CondensingTurbine).condenserPressure))]);
    }

    rows.push(['Operation Type', operationTypeLabel(baselineTurbine), ...modBundles.map(m => operationTypeLabel(turbineOf(m.inputData)))]);

    if (isCondensing) {
      rows.push([`Operation Value (${massFlowPerHrUnit} or kW)`,
        cell(baselineTurbine, t => (t as CondensingTurbine).operationValue),
        ...modBundles.map(m => cell(turbineOf(m.inputData), t => (t as CondensingTurbine).operationValue))]);
    } else {
      rows.push(
        [`Operation Value 1 (${massFlowPerHrUnit} or kW)`, cell(baselineTurbine, t => (t as PressureTurbine).operationValue1), ...modBundles.map(m => cell(turbineOf(m.inputData), t => (t as PressureTurbine).operationValue1))],
        [`Operation Value 2 (${massFlowPerHrUnit} or kW)`, cell(baselineTurbine, t => (t as PressureTurbine).operationValue2), ...modBundles.map(m => cell(turbineOf(m.inputData), t => (t as PressureTurbine).operationValue2))],
      );
    }

    return { type: 'summary-table', title, group: 'inputData', headers, rows };
  }
}
