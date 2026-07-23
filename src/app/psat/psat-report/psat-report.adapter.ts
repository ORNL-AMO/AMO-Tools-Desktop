import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, createSummaryRowBuilder, formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Modification, PSAT, PsatOutputs } from '../../shared/models/psat';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';
import { PsatChartsService, PsatChartConfig } from '../services/psat-charts.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { getPsatPaybackPeriod } from './psat-report.utils';

export const PSAT_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'results', label: 'Result Data', description: 'Baseline and modification results comparison' },
  { key: 'graphs', label: 'Energy Distribution', description: 'Pie and bar charts of energy distribution by loss category' },
  { key: 'sankey', label: 'Sankey Diagrams', description: 'Energy flow sankey diagrams' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class PsatReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly psatService = inject(PsatService);
  private readonly psatChartsService = inject(PsatChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [0, 114, 178];

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment);
    const psat = assessment.psat;
    const modNames = psat.modifications?.map(m => m.psat?.name ?? '') ?? [];

    const meta: ReportMeta = {
      title: assessment?.name ?? 'PSAT Report',
      date: new Date().toISOString(),
      moduleColor: PsatReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildResultsSections(psat, settings, modNames),
        ...this.buildReportGraphsSections(psat, settings),
        ...this.buildSankeySections(psat, settings),
        ...this.buildInputSummarySections(psat, settings, modNames),
      ],
    });
  }

  private renderPlotlyChart(chart: PsatChartConfig): Promise<string> {
    return this.chartRenderService.renderChartToImage(chart.traces, chart.layout);
  }

  private buildReportGraphsSections(psat: PSAT, settings: Settings): ChartSection[] {
    const allData = this.psatChartsService.collectGraphData(psat, settings);
    if (allData.length < 2) return [];

    const baseline = allData[0];
    const sections: ChartSection[] = [];

    for (let i = 1; i < allData.length; i++) {
      const mod = allData[i];
      sections.push({
        type: 'chart',
        title: `Energy Distribution — ${mod.name}`,
        group: 'graphs',
        pageBreakBefore: i === 1,
        imageDataProvider: () => this.renderPlotlyChart(this.psatChartsService.buildEnergyDistributionChart(baseline, mod)),
      });
      sections.push({
        type: 'chart',
        title: `Power Comparison — ${mod.name}`,
        group: 'graphs',
        imageDataProvider: () => this.renderPlotlyChart(this.psatChartsService.buildPowerComparisonChart(baseline, mod)),
      });
    }

    return sections;
  }

  private buildSankeySections(psat: PSAT, settings: Settings): ChartSection[] {
    const sections: ChartSection[] = [];

    if (psat.outputs) {
      sections.push({
        type: 'chart',
        title: psat.name ?? 'Baseline',
        group: 'sankey',
        pageBreakBefore: true,
        imageDataProvider: () => this.psatChartsService.renderSankeyAsImage(psat.outputs, settings),
      });
    }

    psat.modifications?.forEach(m => {
      if (m.psat?.valid?.isValid && m.psat.outputs) {
        sections.push({
          type: 'chart',
          title: m.psat.name ?? 'Modification',
          group: 'sankey',
          pageBreakBefore: false,
          imageDataProvider: () => this.psatChartsService.renderSankeyAsImage(m.psat.outputs, settings),
        });
      }
    });

    return sections;
  }

  private buildResultsSections(psat: PSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const out = psat.outputs;
    const mods = psat.modifications ?? [];

    const fmtNum = (value: number | undefined, dec = 0) =>
      value != null ? formatNumber(value, dec) : '—';

    const modColumns = (key: keyof PsatOutputs, dec = 0) =>
      mods.map(m => fmtNum(m.psat?.outputs?.[key] as number | undefined, dec));

    // load_factor is stored as 0–1; scale to percentage for display
    const loadedPct = (o: PsatOutputs | undefined) => o?.load_factor != null ? o.load_factor * 100 : undefined;

    const modPercentSavings = mods.map(m =>
      m.psat?.outputs?.percent_annual_savings != null
        ? fmtNum(m.psat.outputs.percent_annual_savings, 0) + ' %' : '—'
    );

    const modEnergySavings = mods.map(m =>
      m.psat?.inputs?.whatIfScenario
        ? fmtNum((out?.annual_energy ?? 0) - (m.psat?.outputs?.annual_energy ?? 0), 0) : '—'
    );

    const modCostSavings = mods.map(m =>
      m.psat?.inputs?.whatIfScenario
        ? fmtNum((out?.annual_cost ?? 0) - (m.psat?.outputs?.annual_cost ?? 0), 0) : '—'
    );

    const modLoadedPct = mods.map(m => fmtNum(loadedPct(m.psat?.outputs), 1));
    const modImplementationCosts = mods.map(m => fmtNum(m.psat?.inputs?.implementationCosts, 0));
    const modPayback = mods.map(m => this.calcPayback(out, m));

    const rows: string[][] = [
      // pump & motor performance
      ['Percent Savings (%)',
        '—', ...modPercentSavings],
      [`Pump Efficiency (%)`,
        fmtNum(out?.pump_efficiency, 1), ...modColumns('pump_efficiency', 1)],
      [`Motor Rated Power (${settings.powerMeasurement})`,
        fmtNum(out?.motor_rated_power, 0), ...modColumns('motor_rated_power', 0)],
      [`Motor Shaft Power (${settings.powerMeasurement})`,
        fmtNum(out?.motor_shaft_power, 1), ...modColumns('motor_shaft_power', 1)],
      [`Pump Shaft Power (${settings.powerMeasurement})`,
        fmtNum(out?.mover_shaft_power, 1), ...modColumns('mover_shaft_power', 1)],
      ['Motor Efficiency (%)',
        fmtNum(out?.motor_efficiency, 1), ...modColumns('motor_efficiency', 1)],
      ['Motor Power Factor (%)',
        fmtNum(out?.motor_power_factor, 1), ...modColumns('motor_power_factor', 1)],
      ['Percent Loaded (%)',
        fmtNum(loadedPct(out), 1), ...modLoadedPct],
      ['Drive Efficiency (%)',
        fmtNum(out?.drive_efficiency, 1), ...modColumns('drive_efficiency', 1)],
      ['Motor Current (amps)',
        fmtNum(out?.motor_current, 0), ...modColumns('motor_current', 0)],
      ['Motor Power (kW)',
        fmtNum(out?.motor_power, 1), ...modColumns('motor_power', 1)],
      // annual energy & cost callouts — rows 11–14 are emphasized in the rendered report
      ['Annual Energy (MWh)',
        fmtNum(out?.annual_energy, 0), ...modColumns('annual_energy', 0)],
      ['Annual Energy Savings (MWh)',
        '—', ...modEnergySavings],
      [`Annual Cost (${settings.currency})`,
        fmtNum(out?.annual_cost, 0), ...modColumns('annual_cost', 0)],
      [`Annual Savings (${settings.currency})`,
        '—', ...modCostSavings],
      // cost summary
      ['Implementation Cost',
        '—', ...modImplementationCosts],
      ['Payback Period (months)',
        '—', ...modPayback],
    ];

    return [{
      type: 'summary-table',
      title: 'Result Data',
      group: 'results',
      headers,
      rows,
      emphasisRowsIndices: [11, 12, 13, 14],
      pageBreakBefore: true,
    }];
  }

  private calcPayback(baselineOut: PsatOutputs, mod: Modification): string {
    return formatNumber(getPsatPaybackPeriod(baselineOut?.annual_cost, mod.psat?.outputs?.annual_cost, mod.psat?.inputs?.implementationCosts), 1);
  }

  private buildInputSummarySections(psat: PSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const inputs = psat.inputs;
    const mods = psat.modifications ?? [];

    const row = createSummaryRowBuilder(mods);

    const operationsRows: string[][] = [
      row('Operating Hours', inputs.operating_hours, m => m.psat?.inputs?.operating_hours),
      row(`Cost (${settings.currency}/kWh)`, inputs.cost_kw_hour, m => m.psat?.inputs?.cost_kw_hour,
        v => v != null ? formatNumber(v, 4) : '—'),
    ];

    const pumpFluidRows: string[][] = [
      row('Pump Type', inputs.pump_style, m => m.psat?.inputs?.pump_style,
        v => this.psatService.getPumpStyleFromEnum(v)),
      row('Speed (rpm)', inputs.pump_rated_speed, m => m.psat?.inputs?.pump_rated_speed),
      row('Drive', inputs.drive, m => m.psat?.inputs?.drive,
        v => this.psatService.getDriveFromEnum(v)),
      row('Fluid Type', inputs.fluidType, m => m.psat?.inputs?.fluidType),
      row(`Fluid Temperature (${settings.temperatureMeasurement})`, inputs.fluidTemperature, m => m.psat?.inputs?.fluidTemperature),
      row('Specific Gravity', inputs.specific_gravity, m => m.psat?.inputs?.specific_gravity),
      row('Stages', inputs.stages, m => m.psat?.inputs?.stages),
    ];

    const motorRows: string[][] = [
      row('Line Frequency (Hz)', inputs.line_frequency, m => m.psat?.inputs?.line_frequency),
      row(`Motor Rated Power (${settings.powerMeasurement})`, inputs.motor_rated_power, m => m.psat?.inputs?.motor_rated_power),
      row('Speed (rpm)', inputs.motor_rated_speed, m => m.psat?.inputs?.motor_rated_speed),
      row('Efficiency Class', inputs.efficiency_class, m => m.psat?.inputs?.efficiency_class,
        v => this.psatService.getEfficiencyClassFromEnum(v)),
      row('Voltage (V)', inputs.motor_rated_voltage, m => m.psat?.inputs?.motor_rated_voltage),
      row('Full-Load Amps (A)', inputs.motor_rated_fla, m => m.psat?.inputs?.motor_rated_fla,
        v => v != null ? formatNumber(v, 0) : '—'),
    ];

    const fieldDataRows: string[][] = [
      row(`Flow Rate (${settings.flowMeasurement})`, inputs.flow_rate, m => m.psat?.inputs?.flow_rate),
      row(`Head (${settings.distanceMeasurement})`, inputs.head, m => m.psat?.inputs?.head),
      row('Load Estimation Method', inputs.load_estimation_method, m => m.psat?.inputs?.load_estimation_method,
        v => this.psatService.getLoadEstimationFromEnum(v)),
      row('Motor Field Voltage (V)', inputs.motor_field_voltage, m => m.psat?.inputs?.motor_field_voltage),
      row('Kinematic Viscosity (cST)', inputs.kinematic_viscosity, m => m.psat?.inputs?.kinematic_viscosity),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Operations', operationsRows);
    addGroup('Pump & Fluid', pumpFluidRows);
    addGroup('Motor', motorRows);
    addGroup('Field Data', fieldDataRows);

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
}
