import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, PairedKeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { FacilityInfo, Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Modification, PSAT, PsatInputs, PsatOutputs } from '../../shared/models/psat';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PsatChartsService, PsatChartConfig } from '../services/psat-charts.service';

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
  private readonly plotlyService = inject(PlotlyService);
  private readonly convertUnitsService = inject(ConvertUnitsService);
  private readonly psatChartsService = inject(PsatChartsService);
  // DecimalPipe is constructed directly so no provider entry is needed
  private readonly decimalPipe = new DecimalPipe(inject(LOCALE_ID) as string);

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
        ...this.buildFacilityInfoSections(settings),
        ...this.buildResultsSections(psat, settings, modNames),
        ...this.buildReportGraphsSections(psat, settings),
        ...this.buildSankeySections(psat, settings),
        ...this.buildInputSummarySections(psat, settings, modNames),
      ],
    });
  }

  // ─── Facility Info ────────────────────────────────────────────────────────

  private buildFacilityInfoSections(settings: Settings): PairedKeyValueSection[] {
    const facilityInfo: FacilityInfo = settings?.facilityInfo;
    if (!facilityInfo) return [];

    const generalAndLocation: PairedKeyValueSection = {
      type: 'paired-key-value',
      title: 'Facility Info',
      group: 'facilityInfo',
      left: {
        headerLabel: 'General',
        rows: [
          { label: 'Company Name', value: facilityInfo.companyName ?? '' },
          { label: 'Facility Name', value: facilityInfo.facilityName ?? '' },
          { label: 'Assessment Date', value: facilityInfo.date ?? '' },
        ],
      },
      right: {
        headerLabel: 'Location',
        rows: [
          { label: 'Street', value: facilityInfo.address?.street ?? '' },
          { label: 'City', value: facilityInfo.address?.city ?? '' },
          { label: 'State', value: facilityInfo.address?.state ?? '' },
          { label: 'Zip', value: facilityInfo.address?.zip ?? '' },
          { label: 'Country', value: facilityInfo.address?.country ?? '' },
        ],
      },
    };

    const contacts: PairedKeyValueSection = {
      type: 'paired-key-value',
      group: 'facilityInfo',
      left: {
        headerLabel: 'Facility Contact',
        rows: [
          { label: 'Name', value: facilityInfo.facilityContact?.contactName ?? '' },
          { label: 'Phone', value: String(facilityInfo.facilityContact?.phoneNumber ?? '') },
          { label: 'Email', value: facilityInfo.facilityContact?.email ?? '' },
        ],
      },
      right: {
        headerLabel: 'Assessment Contact',
        rows: [
          { label: 'Name', value: facilityInfo.assessmentContact?.contactName ?? '' },
          { label: 'Phone', value: String(facilityInfo.assessmentContact?.phoneNumber ?? '') },
          { label: 'Email', value: facilityInfo.assessmentContact?.email ?? '' },
        ],
      },
    };

    return [generalAndLocation, contacts];
  }

  // ─── Report Graphs ────────────────────────────────────────────────────────

  private async renderPlotlyChart(chart: PsatChartConfig): Promise<string> {
    const { traces, layout } = chart;
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1400px;height:700px';
    document.body.appendChild(div);
    const p = await this.plotlyService.getPlotly();
    try {
      await p.newPlot(div, traces, layout, { staticPlot: true, displaylogo: false });
      return await p.toImage(div, { format: 'jpeg', width: 1400, height: 700 });
    } finally {
      p.purge(div);
      document.body.removeChild(div);
    }
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

  // ─── Sankey ────────────────────────────────────────────────────────

  private buildSankeySections(psat: PSAT, settings: Settings): ChartSection[] {
    const sections: ChartSection[] = [];
    const plotly = this.plotlyService;

    const buildSection = (outputs: PsatOutputs, title: string, pageBreakBefore: boolean): ChartSection => ({
      type: 'chart',
      title,
      group: 'sankey',
      pageBreakBefore,
      imageDataProvider: async () => {
        // Compute losses from outputs (mirrors PsatSankeyComponent.calcLosses)
        let motorShaftPower: number, moverShaftPower: number;
        if (settings.powerMeasurement === 'hp') {
          motorShaftPower = this.convertUnitsService.value(outputs.motor_shaft_power).from('hp').to('kW');
          moverShaftPower = this.convertUnitsService.value(outputs.mover_shaft_power).from('hp').to('kW');
        } else {
          motorShaftPower = outputs.motor_shaft_power;
          moverShaftPower = outputs.mover_shaft_power;
        }
        const motor = outputs.motor_power * (1 - outputs.motor_efficiency / 100);
        const drive = motorShaftPower - moverShaftPower;
        const pump = (outputs.motor_power - motor - drive) * (1 - outputs.pump_efficiency / 100);
        const hasDrive = drive > 0;

        const connectingNodes = hasDrive ? [0, 1, 2, 5] : [0, 1, 2];
        const motorConnector = outputs.motor_power - motor;
        const driveConnector = hasDrive ? motorConnector - drive : 0;
        const useful = hasDrive ? driveConnector - pump : motorConnector - pump;

        const nodeStartColor = 'rgba(38, 138, 222, .9)';
        const nodeArrowColor = 'rgba(144, 192, 232, .9)';
        const gradientStart  = 'rgb(38, 138, 222)';
        const gradientEnd    = 'rgb(144, 192, 232)';

        const ip = outputs.motor_power;
        const lbl = (name: string, kw: number, pct: number) =>
          `${name} ${this.decimalPipe.transform(kw, '1.0-0')} kW/hr (${this.decimalPipe.transform(pct, '1.1-1')}%)`;

        const nodes: Array<{ id: string; name: string; value: number; x: number; y: number; nodeColor: string }> = [
          { id: 'originConnector', name: lbl('Energy Input',  ip,    100),                  value: 100,                       x: .1,  y: .6,  nodeColor: nodeStartColor },
          { id: 'inputConnector',  name: '',                                                value: 0,                         x: .4,  y: .6,  nodeColor: nodeStartColor },
          { id: 'motorConnector',  name: '',                                                value: (motorConnector / ip) * 100, x: .5,  y: .6,  nodeColor: nodeStartColor },
          { id: 'motorLosses',     name: lbl('Motor Losses',  motor, (motor / ip) * 100),  value: (motor / ip) * 100,        x: .5,  y: .10, nodeColor: nodeArrowColor  },
        ];

        if (hasDrive) {
          nodes.push(
            { id: 'driveLosses',   name: lbl('Drive Losses',  drive, (drive / ip) * 100),  value: (drive / ip) * 100,        x: .6,  y: .25, nodeColor: nodeArrowColor  },
            { id: 'driveConnector',name: '',                                                value: (driveConnector / ip) * 100, x: .7,  y: .6,  nodeColor: nodeStartColor },
          );
        }
        nodes.push(
          { id: 'pumpLosses',    name: lbl('Pump Losses',   pump,  (pump  / ip) * 100),  value: (pump  / ip) * 100,        x: .8,  y: .15, nodeColor: nodeArrowColor  },
          { id: 'usefulOutput',  name: lbl('Useful Output', useful,(useful / ip) * 100),  value: (useful / ip) * 100,       x: .85, y: .65, nodeColor: nodeArrowColor  },
        );

        const links = [
          { source: 0, target: 1 }, { source: 0, target: 2 },
          { source: 1, target: 2 }, { source: 1, target: 3 },
          ...(hasDrive
            ? [{ source: 2, target: 4 }, { source: 2, target: 5 }, { source: 5, target: 6 }, { source: 5, target: 7 }]
            : [{ source: 2, target: 4 }, { source: 2, target: 5 }]),
        ];

        const sankeyData = {
          type: 'sankey', orientation: 'h', valuesuffix: '%', arrangement: 'freeform',
          textfont: { color: 'rgba(0,0,0)', size: 14 },
          ids: nodes.map(n => n.id),
          node: {
            pad: 50,
            line: { color: nodeStartColor, width: 0 },
            label: nodes.map(n => n.name),
            x: nodes.map(n => n.x),
            y: nodes.map(n => n.y),
            color: nodes.map(n => n.nodeColor),
          },
          link: {
            value:  nodes.map(n => n.value),
            source: links.map(l => l.source),
            target: links.map(l => l.target),
            color:  links.map(() => nodeStartColor),
            hoverinfo: 'none',
            line: { color: nodeStartColor, width: 0 },
          },
        };

        const layout = {
          autosize: true,
          font: { color: '#ffffff', size: 14 },
          margin: { l: 50, t: 100, pad: 300 },
          paper_bgcolor: 'white',
        };

        const container = document.createElement('div');
        container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1400px;height:700px';
        document.body.appendChild(container);
        const chartDiv = document.createElement('div');
        chartDiv.style.cssText = 'width:100%;height:100%';
        container.appendChild(chartDiv);

        const p = await plotly.getPlotly();
        try {
          await p.newPlot(chartDiv, [sankeyData], layout, { displaylogo: false, displayModeBar: false, responsive: false });

          // Add link gradient (mirrors FsatSankeyComponent.addGradientElement)
          const mainSVG = container.querySelector('.main-svg');
          const svgDefs = container.querySelector('defs');
          if (mainSVG && svgDefs) {
            svgDefs.innerHTML = `<linearGradient id="psatLinkGradient">
              <stop offset="10%" stop-color="${gradientStart}" />
              <stop offset="100%" stop-color="${gradientEnd}" />
            </linearGradient>`;
            mainSVG.appendChild(svgDefs);
          }

          // Apply arrow shape to non-connector nodes (mirrors FsatSankeyComponent.buildSvgArrows)
          const rects = container.querySelectorAll('.node-rect');
          for (let i = 0; i < rects.length; i++) {
            if (!connectingNodes.includes(i)) {
              const rect = rects[i] as SVGRectElement;
              const h = parseFloat(rect.getAttribute('height'));
              const y = parseFloat(rect.getAttribute('y'));
              if (isNaN(h) || isNaN(y) || h === 0) continue;
              rect.setAttribute('y', `${y - h / 2.75}`);
              rect.setAttribute('style',
                `width:${h}px;height:${h * 1.75}px;clip-path:polygon(100% 50%,0 0,0 100%);` +
                `stroke-width:0.5;stroke:rgb(255,255,255);stroke-opacity:0.5;` +
                `fill:${gradientEnd};fill-opacity:0.9;`);
            }
          }

          return await p.toImage(chartDiv, { format: 'jpeg', width: 1400, height: 700 });
        } finally {
          p.purge(chartDiv);
          document.body.removeChild(container);
        }
      },
    });

    if (psat.outputs) {
      sections.push(buildSection(psat.outputs, psat.name ?? 'Baseline', true));
    }
    psat.modifications?.forEach(m => {
      if (m.psat?.valid?.isValid && m.psat.outputs) {
        sections.push(buildSection(m.psat.outputs, m.psat.name ?? 'Modification', false));
      }
    });

    return sections;
  }

  // ─── Result Data ──────────────────────────────────────────────────────────

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
    const implCost = mod.psat?.inputs?.implementationCosts;
    if (!implCost) return '0';
    const savings = (baselineOut?.annual_cost ?? 0) - (mod.psat?.outputs?.annual_cost ?? 0);
    if (savings <= 0) return '—';
    return formatNumber((implCost / savings) * 12, 1);
  }

  // ─── Input Summary ────────────────────────────────────────────────────────

  private buildInputSummarySections(psat: PSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const inputs = psat.inputs;
    const mods = psat.modifications ?? [];

    const row = <T extends string | number | null | undefined>(
      label: string,
      baseVal: T,
      modFn: (i: PsatInputs | undefined) => T,
      fmt?: (v: T) => string
    ): string[] => {
      const f = fmt ?? (v => v != null ? String(v) : '—');
      return [label, f(baseVal), ...mods.map(m => f(modFn(m.psat?.inputs)))];
    };

    const operationsRows: string[][] = [
      row('Operating Hours', inputs.operating_hours, i => i?.operating_hours),
      row(`Cost (${settings.currency}/kWh)`, inputs.cost_kw_hour, i => i?.cost_kw_hour,
        v => v != null ? formatNumber(v, 4) : '—'),
    ];

    const pumpFluidRows: string[][] = [
      row('Pump Type', inputs.pump_style, i => i?.pump_style,
        v => this.psatService.getPumpStyleFromEnum(v)),
      row('Speed (rpm)', inputs.pump_rated_speed, i => i?.pump_rated_speed),
      row('Drive', inputs.drive, i => i?.drive,
        v => this.psatService.getDriveFromEnum(v)),
      row('Fluid Type', inputs.fluidType, i => i?.fluidType),
      row(`Fluid Temperature (${settings.temperatureMeasurement})`, inputs.fluidTemperature, i => i?.fluidTemperature),
      row('Specific Gravity', inputs.specific_gravity, i => i?.specific_gravity),
      row('Stages', inputs.stages, i => i?.stages),
    ];

    const motorRows: string[][] = [
      row('Line Frequency (Hz)', inputs.line_frequency, i => i?.line_frequency),
      row(`Motor Rated Power (${settings.powerMeasurement})`, inputs.motor_rated_power, i => i?.motor_rated_power),
      row('Speed (rpm)', inputs.motor_rated_speed, i => i?.motor_rated_speed),
      row('Efficiency Class', inputs.efficiency_class, i => i?.efficiency_class,
        v => this.psatService.getEfficiencyClassFromEnum(v)),
      row('Voltage (V)', inputs.motor_rated_voltage, i => i?.motor_rated_voltage),
      row('Full-Load Amps (A)', inputs.motor_rated_fla, i => i?.motor_rated_fla,
        v => v != null ? formatNumber(v, 0) : '—'),
    ];

    const fieldDataRows: string[][] = [
      row(`Flow Rate (${settings.flowMeasurement})`, inputs.flow_rate, i => i?.flow_rate),
      row(`Head (${settings.distanceMeasurement})`, inputs.head, i => i?.head),
      row('Load Estimation Method', inputs.load_estimation_method, i => i?.load_estimation_method,
        v => this.psatService.getLoadEstimationFromEnum(v)),
      row('Motor Field Voltage (V)', inputs.motor_field_voltage, i => i?.motor_field_voltage),
      row('Kinematic Viscosity (cST)', inputs.kinematic_viscosity, i => i?.kinematic_viscosity),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];

    const addGroup = (label: string, groupRows: string[][]) => {
      subGroupHeaderIndices.push(allRows.length);
      allRows.push([label, ...Array(headers.length - 1).fill('')]);
      allRows.push(...groupRows);
    };

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
