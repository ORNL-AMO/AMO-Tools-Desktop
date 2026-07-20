import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
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
  private readonly plotlyService = inject(PlotlyService);

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
      ['Payback Period (months)', '—', ...mods.map(m => out && m.fsat ? formatNumber(getFsatPaybackPeriod(out, m.fsat), 1) : '—')],
    );

    const energyStartIndex = rows.findIndex(r => r[0] === 'Annual Energy (MWh)');

    return [{
      type: 'summary-table',
      title: 'Result Data',
      group: 'results',
      headers,
      rows,
      emphasisRowsIndices: energyStartIndex >= 0
        ? [energyStartIndex, energyStartIndex + 1, energyStartIndex + 2, energyStartIndex + 3]
        : [],
      pageBreakBefore: true,
    }];
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

  private async renderPieChart(
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
    return this.renderChart(traces, layout);
  }

  private async renderBarChart(
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
    return this.renderChart(traces, layout);
  }

  private async renderChart(traces: object[], layout: object): Promise<string> {
    const width = 1400;
    const height = 700;
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${width}px;height:${height}px`;
    document.body.appendChild(div);
    const p = await this.plotlyService.getPlotly();
    try {
      await p.newPlot(div, traces, layout, { staticPlot: true, displaylogo: false });
      return await p.toImage(div, { format: 'jpeg', width, height });
    } finally {
      p.purge(div);
      document.body.removeChild(div);
    }
  }

  private buildInputSummarySections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const mods = fsat.modifications ?? [];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    // Operations
    const opsRows: string[][] = [
      ['Operating Hours', String(fsat.fsatOperations?.operatingHours ?? '—'),
        ...mods.map(m => String(m.fsat?.fsatOperations?.operatingHours ?? '—'))],
      ['Cost ($/kWh)', fsat.fsatOperations?.cost != null ? formatNumber(fsat.fsatOperations.cost, 4) : '—',
        ...mods.map(m => m.fsat?.fsatOperations?.cost != null ? formatNumber(m.fsat.fsatOperations.cost, 4) : '—')],
    ];
    if (this.featureFlagService.showOperationalImpacts()) {
      opsRows.push(
        ['Total Emission Output Rate (kg CO2/MWh)',
          fsat.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate != null
            ? formatNumber(fsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate, 2) : '—',
          ...mods.map(m => m.fsat?.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate != null
            ? formatNumber(m.fsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate, 2) : '—')]
      );
    }
    addGroup('Operations', opsRows);

    // Fluid (Base Gas Density)
    const fluidRows: string[][] = [
      [`Barometric Pressure (${settings.fanBarometricPressure ?? 'psia'})`,
        String(fsat.baseGasDensity?.barometricPressure ?? '—'),
        ...mods.map(m => String(m.fsat?.baseGasDensity?.barometricPressure ?? '—'))],
      ['Specific Heat Ratio',
        String(fsat.baseGasDensity?.specificHeatRatio ?? '—'),
        ...mods.map(m => String(m.fsat?.baseGasDensity?.specificHeatRatio ?? '—'))],
      ['Gas Type',
        fsat.baseGasDensity?.gasType ?? '—',
        ...mods.map(m => m.fsat?.baseGasDensity?.gasType ?? '—')],
      ['Method to Establish Gas Density',
        this.formatInputType(fsat.baseGasDensity?.inputType),
        ...mods.map(m => this.formatInputType(m.fsat?.baseGasDensity?.inputType))],
      [`Dry Bulb Temperature (${settings.unitsOfMeasure === 'Imperial' ? '°F' : '°C'})`,
        String(fsat.baseGasDensity?.dryBulbTemp ?? '—'),
        ...mods.map(m => String(m.fsat?.baseGasDensity?.dryBulbTemp ?? '—'))],
    ];
    addGroup('Fluid', fluidRows);

    // Fan Setup
    const fanRows: string[][] = [
      ['Fan Type',
        this.getFanTypeDisplay(fsat.fanSetup?.fanType),
        ...mods.map(m => this.getFanTypeDisplay(m.fsat?.fanSetup?.fanType))],
      ['Fan Speed (rpm)',
        String(fsat.fanSetup?.fanSpeed ?? '—'),
        ...mods.map(m => String(m.fsat?.fanSetup?.fanSpeed ?? '—'))],
      ['Drive',
        this.getDriveTypeDisplay(fsat.fanSetup?.drive),
        ...mods.map(m => this.getDriveTypeDisplay(m.fsat?.fanSetup?.drive))],
      ['Fan Efficiency (%)',
        fsat.fanSetup?.fanEfficiency != null ? formatNumber(fsat.fanSetup.fanEfficiency, 2) : '—',
        ...mods.map(m => m.fsat?.fanSetup?.fanEfficiency != null ? formatNumber(m.fsat.fanSetup.fanEfficiency, 2) : '—')],
    ];
    addGroup('Fan Setup', fanRows);

    // Motor
    const motorRows: string[][] = [
      ['Line Frequency (Hz)',
        String(fsat.fanMotor?.lineFrequency ?? '—'),
        ...mods.map(m => String(m.fsat?.fanMotor?.lineFrequency ?? '—'))],
      [`Motor Rated Power (${settings.fanPowerMeasurement})`,
        String(fsat.fanMotor?.motorRatedPower ?? '—'),
        ...mods.map(m => String(m.fsat?.fanMotor?.motorRatedPower ?? '—'))],
      ['Motor RPM (rpm)',
        String(fsat.fanMotor?.motorRpm ?? '—'),
        ...mods.map(m => String(m.fsat?.fanMotor?.motorRpm ?? '—'))],
      ['Efficiency Class',
        this.getEfficiencyClassDisplay(fsat.fanMotor?.efficiencyClass),
        ...mods.map(m => this.getEfficiencyClassDisplay(m.fsat?.fanMotor?.efficiencyClass))],
      ['Motor Rated Voltage (V)',
        String(fsat.fanMotor?.motorRatedVoltage ?? '—'),
        ...mods.map(m => String(m.fsat?.fanMotor?.motorRatedVoltage ?? '—'))],
      ['Full Load Amps (A)',
        fsat.fanMotor?.fullLoadAmps != null ? formatNumber(fsat.fanMotor.fullLoadAmps, 0) : '—',
        ...mods.map(m => m.fsat?.fanMotor?.fullLoadAmps != null ? formatNumber(m.fsat.fanMotor.fullLoadAmps, 0) : '—')],
    ];
    addGroup('Motor', motorRows);

    // Field Data
    const fieldRows: string[][] = [
      [`Flow Rate (${settings.fanFlowRate ?? 'acfm'})`,
        String(fsat.fieldData?.flowRate ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.flowRate ?? '—'))],
      [`Inlet Pressure (${settings.fanPressureMeasurement ?? 'inH2O'})`,
        String(fsat.fieldData?.inletPressure ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.inletPressure ?? '—'))],
      [`Outlet Pressure (${settings.fanPressureMeasurement ?? 'inH2O'})`,
        String(fsat.fieldData?.outletPressure ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.outletPressure ?? '—'))],
      ['Load Estimated Method',
        this.formatLoadMethod(fsat.fieldData?.loadEstimatedMethod),
        ...mods.map(m => this.formatLoadMethod(m.fsat?.fieldData?.loadEstimatedMethod))],
      ['Motor Power/Current',
        String(fsat.fieldData?.motorPower ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.motorPower ?? '—'))],
      ['Compressibility Factor',
        String(fsat.fieldData?.compressibilityFactor ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.compressibilityFactor ?? '—'))],
      ['Measured Voltage (V)',
        String(fsat.fieldData?.measuredVoltage ?? '—'),
        ...mods.map(m => String(m.fsat?.fieldData?.measuredVoltage ?? '—'))],
    ];
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
