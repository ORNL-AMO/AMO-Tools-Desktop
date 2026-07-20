import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, createSummaryRowBuilder, formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FSAT, FsatOutput, Modification } from '../../shared/models/fans';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FanTypes, Drives } from '../fanOptions';
import { motorEfficiencyConstants } from '../../psat/psatConstants';
import { getFsatPaybackPeriod } from './fsat-report.utils';
import { TraceData } from '../../shared/models/plotting';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';

export const FSAT_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'results', label: 'Result Data', description: 'Baseline and modification results comparison' },
  { key: 'graphs', label: 'Report Graphs', description: 'Energy distribution pie and bar charts' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

interface FsatGraphData {
  energyInput: number;
  motorLoss: number;
  fanLoss: number;
  driveLoss: number;
  usefulOutput: number;
}

@Injectable()
export class FsatReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [48, 109, 190]; // #306DBE

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment);
    const fsat = assessment.fsat;
    const modNames = fsat.modifications?.map(m => m.fsat?.name ?? '') ?? [];

    const meta: ReportMeta = {
      title: assessment.name,
      date: new Date().toISOString(),
      moduleColor: FsatReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildResultsSections(fsat, settings, modNames),
        ...this.buildGraphSections(fsat, settings),
        ...this.buildInputSummarySections(fsat, settings, modNames),
      ],
    });
  }

  private buildResultsSections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const out = fsat.outputs;
    const mods = fsat.modifications ?? [];
    const showCO2 = this.featureFlagService.showOperationalImpacts();

    const fmt = (value: number | undefined, dec = 0) =>
      value != null ? formatNumber(value, dec) : '—';

    const modCols = (key: keyof FsatOutput, dec = 0) =>
      mods.map(m => fmt(m.fsat?.outputs?.[key] as number | undefined, dec));

    const modPercentSavings = mods.map(m =>
      m.fsat?.outputs?.percentSavings != null
        ? fmt(m.fsat.outputs.percentSavings, 0) + ' %' : '—'
    );

    const modEnergySavings = mods.map(m =>
      m.fsat?.whatIfScenario ? fmt(m.fsat?.outputs?.energySavings, 0) : '—'
    );

    const modAnnualSavings = mods.map(m =>
      m.fsat?.whatIfScenario ? fmt(m.fsat?.outputs?.annualSavings, 0) : '—'
    );

    const rows: string[][] = [
      ['Percent Savings (%)', '—', ...modPercentSavings],
      ['Fan Energy Index', fmt(out?.fanEnergyIndex, 2), ...modCols('fanEnergyIndex', 2)],
      [`Fan Efficiency (%)`, fmt(out?.fanEfficiency, 1), ...modCols('fanEfficiency', 1)],
      [`Motor Rated Power (${settings.fanPowerMeasurement})`, fmt(out?.motorRatedPower, 0), ...modCols('motorRatedPower', 0)],
      [`Motor Shaft Power (${settings.fanPowerMeasurement})`, fmt(out?.motorShaftPower, 1), ...modCols('motorShaftPower', 1)],
      [`Fan Shaft Power (${settings.fanPowerMeasurement})`, fmt(out?.fanShaftPower, 1), ...modCols('fanShaftPower', 1)],
      ['Motor Efficiency (%)', fmt(out?.motorEfficiency, 1), ...modCols('motorEfficiency', 1)],
      ['Motor Power Factor (%)', fmt(out?.motorPowerFactor, 1), ...modCols('motorPowerFactor', 1)],
      ['Percent Loaded (%)', out?.loadFactor != null ? fmt(out.loadFactor * 100, 1) : '—',
        ...mods.map(m => m.fsat?.outputs?.loadFactor != null ? fmt(m.fsat.outputs.loadFactor * 100, 1) : '—')],
      ['Drive Efficiency (%)', fmt(out?.driveEfficiency, 1), ...modCols('driveEfficiency', 1)],
      ['Motor Current (amps)', fmt(out?.motorCurrent, 0), ...modCols('motorCurrent', 0)],
      ['Motor Power (kW)', fmt(out?.motorPower, 1), ...modCols('motorPower', 1)],
    ];

    if (showCO2) {
      const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
      rows.push(
        [`Annual CO2 Emissions (${emissionsUnit})`, fmt(out?.co2EmissionsOutput, 1), ...modCols('co2EmissionsOutput', 1)],
        [`Annual CO2 Emissions Savings (${emissionsUnit})`, '—',
          ...mods.map(m => m.fsat?.whatIfScenario && out?.co2EmissionsOutput != null && m.fsat?.outputs?.co2EmissionsOutput != null
            ? fmt(out.co2EmissionsOutput - m.fsat.outputs.co2EmissionsOutput, 1) : '—')],
      );
    }

    rows.push(
      ['Annual Energy (MWh)', fmt(out?.annualEnergy, 0), ...modCols('annualEnergy', 0)],
      ['Annual Energy Savings (MWh)', '—', ...modEnergySavings],
      [`Annual Cost (${settings.currency})`, fmt(out?.annualCost, 0), ...modCols('annualCost', 0)],
      [`Annual Savings (${settings.currency})`, '—', ...modAnnualSavings],
      ['Implementation Cost', '—', ...mods.map(m => m.fsat?.implementationCosts ? fmt(m.fsat.implementationCosts, 0) : '—')],
      ['Payback Period (months)', '—', ...mods.map(m => this.calcPayback(out, m))],
    );

    const emphasisRowsIndices = this.findRowIndices(rows, [
      'Annual Energy (MWh)',
      'Annual Energy Savings (MWh)',
      `Annual Cost (${settings.currency})`,
      `Annual Savings (${settings.currency})`,
    ]);

    return [{
      type: 'summary-table',
      title: 'Result Data',
      group: 'results',
      headers,
      rows,
      emphasisRowsIndices,
      pageBreakBefore: true,
    }];
  }

  private findRowIndices(rows: string[][], labels: string[]): number[] {
    return labels.map(label => rows.findIndex(r => r[0] === label)).filter(i => i !== -1);
  }

  private calcPayback(baselineOutputs: FsatOutput | undefined, mod: Modification): string {
    if (!baselineOutputs || !mod.fsat) return '—';
    return formatNumber(getFsatPaybackPeriod(baselineOutputs, mod.fsat), 1);
  }

  private buildGraphSections(fsat: FSAT, settings: Settings): ChartSection[] {
    if (!fsat.outputs || !fsat.modifications?.length) return [];

    const sections: ChartSection[] = [];
    const baseline = fsat.outputs;
    const baselineGraphData = this.getGraphData(baseline, settings);
    const baselineName = fsat.name ?? 'Baseline';

    fsat.modifications.forEach((mod: Modification) => {
      if (!mod.fsat?.valid?.isValid || !mod.fsat.outputs) return;

      const modGraphData = this.getGraphData(mod.fsat.outputs, settings);
      const modName = mod.fsat.name ?? 'Modification';

      sections.push({
        type: 'chart',
        title: `Energy Distribution — ${modName}`,
        group: 'graphs',
        pageBreakBefore: sections.length === 0,
        imageDataProvider: () => this.renderPieChart(baselineGraphData, modGraphData, baselineName, modName),
      });

      sections.push({
        type: 'chart',
        title: `Power Comparison — ${modName}`,
        group: 'graphs',
        imageDataProvider: () => this.renderBarChart(baselineGraphData, modGraphData, baselineName, modName),
      });
    });

    return sections;
  }

  private getGraphData(results: FsatOutput, settings: Settings): FsatGraphData {
    let motorShaftPower = results.motorShaftPower;
    let fanShaftPower = results.fanShaftPower;
    if (settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(fanShaftPower).from('hp').to('kW');
    }
    const motorLoss = results.motorPower * (1 - (results.motorEfficiency / 100));
    const driveLoss = motorShaftPower - fanShaftPower;
    const fanLoss = (results.motorPower - motorLoss - driveLoss) * (1 - (results.fanEfficiency / 100));
    const usefulOutput = results.motorPower - (motorLoss + driveLoss + fanLoss);
    return {
      energyInput: results.motorPower,
      motorLoss,
      driveLoss,
      fanLoss,
      usefulOutput,
    };
  }

  private renderPieChart(
    baseline: FsatGraphData,
    mod: FsatGraphData,
    baselineName: string,
    modName: string,
  ): Promise<string> {
    const labels = ['Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
    const traces = [
      {
        type: 'pie',
        labels,
        values: [baseline.motorLoss, baseline.driveLoss, baseline.fanLoss, baseline.usefulOutput],
        name: baselineName,
        domain: { x: [0, 0.45] },
        title: { text: baselineName, position: 'bottom center' },
        textinfo: 'label+percent',
      },
      {
        type: 'pie',
        labels,
        values: [mod.motorLoss, mod.driveLoss, mod.fanLoss, mod.usefulOutput],
        name: modName,
        domain: { x: [0.55, 1] },
        title: { text: modName, position: 'bottom center' },
        textinfo: 'label+percent',
      },
    ];
    const layout = {
      showlegend: true,
      legend: { orientation: 'h' },
      margin: { t: 40, b: 80, l: 20, r: 20 },
    };
    return this.chartRenderService.renderChartToImage(traces as unknown as TraceData[], layout);
  }

  private renderBarChart(
    baseline: FsatGraphData,
    mod: FsatGraphData,
    baselineName: string,
    modName: string,
  ): Promise<string> {
    const categories = ['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output'];
    const baselineValues = [baseline.energyInput, baseline.motorLoss, baseline.driveLoss, baseline.fanLoss, baseline.usefulOutput];
    const modValues = [mod.energyInput, mod.motorLoss, mod.driveLoss, mod.fanLoss, mod.usefulOutput];
    const traces = [
      { type: 'bar', x: categories, y: baselineValues, name: baselineName },
      { type: 'bar', x: categories, y: modValues, name: modName },
    ];
    const layout = {
      barmode: 'group',
      yaxis: { title: 'Power (kW)' },
      margin: { t: 40, b: 80, l: 60, r: 20 },
    };
    return this.chartRenderService.renderChartToImage(traces as unknown as TraceData[], layout);
  }

  private buildInputSummarySections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const mods = fsat.modifications ?? [];
    const row = createSummaryRowBuilder(mods);

    // Operations
    const opsRows: string[][] = [
      row('Operating Hours', fsat.fsatOperations?.operatingHours, m => m.fsat?.fsatOperations?.operatingHours),
      row('Cost ($/kWh)', fsat.fsatOperations?.cost, m => m.fsat?.fsatOperations?.cost,
        v => v != null ? formatNumber(v as number, 4) : '—'),
    ];
    if (this.featureFlagService.showOperationalImpacts()) {
      opsRows.push(
        row('Total Emission Output Rate (kg CO2/MWh)',
          fsat.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate,
          m => m.fsat?.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate,
          v => v != null ? formatNumber(v as number, 2) : '—')
      );
    }

    // Fluid (Base Gas Density)
    const fluidRows: string[][] = [
      row(`Barometric Pressure (${settings.fanBarometricPressure ?? 'psia'})`,
        fsat.baseGasDensity?.barometricPressure, m => m.fsat?.baseGasDensity?.barometricPressure),
      row('Specific Heat Ratio',
        fsat.baseGasDensity?.specificHeatRatio, m => m.fsat?.baseGasDensity?.specificHeatRatio),
      row('Gas Type',
        fsat.baseGasDensity?.gasType, m => m.fsat?.baseGasDensity?.gasType),
      row('Method to Establish Gas Density',
        fsat.baseGasDensity?.inputType, m => m.fsat?.baseGasDensity?.inputType,
        v => this.formatInputType(v as string | undefined)),
      row(`Dry Bulb Temperature (${settings.unitsOfMeasure === 'Imperial' ? '°F' : '°C'})`,
        fsat.baseGasDensity?.dryBulbTemp, m => m.fsat?.baseGasDensity?.dryBulbTemp),
    ];

    // Fan Setup
    const fanRows: string[][] = [
      row('Fan Type',
        fsat.fanSetup?.fanType, m => m.fsat?.fanSetup?.fanType,
        v => this.getFanTypeDisplay(v as number | undefined)),
      row('Fan Speed (rpm)',
        fsat.fanSetup?.fanSpeed, m => m.fsat?.fanSetup?.fanSpeed),
      row('Drive',
        fsat.fanSetup?.drive, m => m.fsat?.fanSetup?.drive,
        v => this.getDriveTypeDisplay(v as number | undefined)),
      row('Fan Efficiency (%)',
        fsat.fanSetup?.fanEfficiency, m => m.fsat?.fanSetup?.fanEfficiency,
        v => v != null ? formatNumber(v as number, 2) : '—'),
    ];

    // Motor
    const motorRows: string[][] = [
      row('Line Frequency (Hz)',
        fsat.fanMotor?.lineFrequency, m => m.fsat?.fanMotor?.lineFrequency),
      row(`Motor Rated Power (${settings.fanPowerMeasurement})`,
        fsat.fanMotor?.motorRatedPower, m => m.fsat?.fanMotor?.motorRatedPower),
      row('Motor RPM (rpm)',
        fsat.fanMotor?.motorRpm, m => m.fsat?.fanMotor?.motorRpm),
      row('Efficiency Class',
        fsat.fanMotor?.efficiencyClass, m => m.fsat?.fanMotor?.efficiencyClass,
        v => this.getEfficiencyClassDisplay(v as number | undefined)),
      row('Motor Rated Voltage (V)',
        fsat.fanMotor?.motorRatedVoltage, m => m.fsat?.fanMotor?.motorRatedVoltage),
      row('Full Load Amps (A)',
        fsat.fanMotor?.fullLoadAmps, m => m.fsat?.fanMotor?.fullLoadAmps,
        v => v != null ? formatNumber(v as number, 0) : '—'),
    ];

    // Field Data
    const fieldRows: string[][] = [
      row(`Flow Rate (${settings.fanFlowRate ?? 'acfm'})`,
        fsat.fieldData?.flowRate, m => m.fsat?.fieldData?.flowRate),
      row(`Inlet Pressure (${settings.fanPressureMeasurement ?? 'inH2O'})`,
        fsat.fieldData?.inletPressure, m => m.fsat?.fieldData?.inletPressure),
      row(`Outlet Pressure (${settings.fanPressureMeasurement ?? 'inH2O'})`,
        fsat.fieldData?.outletPressure, m => m.fsat?.fieldData?.outletPressure),
      row('Load Estimated Method',
        fsat.fieldData?.loadEstimatedMethod, m => m.fsat?.fieldData?.loadEstimatedMethod,
        v => this.formatLoadMethod(v as number | undefined)),
      row('Motor Power/Current',
        fsat.fieldData?.motorPower, m => m.fsat?.fieldData?.motorPower),
      row('Compressibility Factor',
        fsat.fieldData?.compressibilityFactor, m => m.fsat?.fieldData?.compressibilityFactor),
      row('Measured Voltage (V)',
        fsat.fieldData?.measuredVoltage, m => m.fsat?.fieldData?.measuredVoltage),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Operations', opsRows);
    addGroup('Fluid', fluidRows);
    addGroup('Fan Setup', fanRows);
    addGroup('Motor', motorRows);
    addGroup('Field Data', fieldRows);

    return [{
      type: 'summary-table',
      title: 'Input Summary',
      group: 'inputData',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore: true,
    }];
  }

  private getFanTypeDisplay(fanType: number | undefined): string {
    if (fanType == null) return '—';
    const found = FanTypes.find(t => t.value === fanType);
    return found?.display ?? '—';
  }

  private getDriveTypeDisplay(drive: number | undefined): string {
    if (drive == null) return '—';
    const found = Drives.find(d => d.value === drive);
    return found?.display ?? '—';
  }

  private getEfficiencyClassDisplay(efficiencyClass: number | undefined): string {
    if (efficiencyClass == null) return '—';
    const found = motorEfficiencyConstants.find(e => e.value === efficiencyClass);
    return found?.display ?? '—';
  }

  private formatInputType(inputType: string | undefined): string {
    if (!inputType) return '—';
    const map: Record<string, string> = {
      relativeHumidity: 'Relative Humidity',
      dewPoint: 'Dew Point',
      wetBulb: 'Wet Bulb',
      custom: 'Custom',
    };
    return map[inputType] ?? inputType;
  }

  private formatLoadMethod(method: number | undefined): string {
    if (method == null) return '—';
    return method === 0 ? 'Power' : method === 1 ? 'Current' : '—';
  }
}
