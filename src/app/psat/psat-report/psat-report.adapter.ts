import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { PairedKeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { FacilityInfo, Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Modification, PSAT, PsatInputs, PsatOutputs } from '../../shared/models/psat';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatService } from '../psat.service';

export const PSAT_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'results', label: 'Result Data', description: 'Baseline and modification results comparison' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class PsatReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly psatService = inject(PsatService);

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

  // ─── Result Data ──────────────────────────────────────────────────────────

  private buildResultsSections(psat: PSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const out = psat.outputs;
    const mods = psat.modifications ?? [];

    const n = (value: number | undefined, dec = 0) => value != null ? formatNumber(value, dec) : '—';

    const modOut = (fn: (o: PsatOutputs) => number | undefined, dec = 0) =>
      mods.map(m => n(fn(m.psat?.outputs ?? {}), dec));

    const rows: string[][] = [
      ['Percent Savings (%)',
        '—',
        ...mods.map(m => m.psat?.outputs?.percent_annual_savings != null
          ? n(m.psat.outputs.percent_annual_savings, 0) + ' %' : '—')],
      [`Pump Efficiency (%)`,
        n(out?.pump_efficiency, 1), ...modOut(o => o.pump_efficiency, 1)],
      [`Motor Rated Power (${settings.powerMeasurement})`,
        n(out?.motor_rated_power, 0), ...modOut(o => o.motor_rated_power, 0)],
      [`Motor Shaft Power (${settings.powerMeasurement})`,
        n(out?.motor_shaft_power, 1), ...modOut(o => o.motor_shaft_power, 1)],
      [`Pump Shaft Power (${settings.powerMeasurement})`,
        n(out?.mover_shaft_power, 1), ...modOut(o => o.mover_shaft_power, 1)],
      ['Motor Efficiency (%)',
        n(out?.motor_efficiency, 1), ...modOut(o => o.motor_efficiency, 1)],
      ['Motor Power Factor (%)',
        n(out?.motor_power_factor, 1), ...modOut(o => o.motor_power_factor, 1)],
      ['Percent Loaded (%)',
        n(out?.load_factor != null ? out.load_factor * 100 : undefined, 1),
        ...mods.map(m => n(m.psat?.outputs?.load_factor != null ? m.psat.outputs.load_factor * 100 : undefined, 1))],
      ['Drive Efficiency (%)',
        n(out?.drive_efficiency, 1), ...modOut(o => o.drive_efficiency, 1)],
      ['Motor Current (amps)',
        n(out?.motor_current, 0), ...modOut(o => o.motor_current, 0)],
      ['Motor Power (kW)',
        n(out?.motor_power, 1), ...modOut(o => o.motor_power, 1)],
      // ── callout rows (emphasized) ──
      ['Annual Energy (MWh)',
        n(out?.annual_energy, 0), ...modOut(o => o.annual_energy, 0)],
      ['Annual Energy Savings (MWh)',
        '—',
        ...mods.map(m => m.psat?.inputs?.whatIfScenario
          ? n((out?.annual_energy ?? 0) - (m.psat?.outputs?.annual_energy ?? 0), 0) : '—')],
      [`Annual Cost (${settings.currency})`,
        n(out?.annual_cost, 0), ...modOut(o => o.annual_cost, 0)],
      [`Annual Savings (${settings.currency})`,
        '—',
        ...mods.map(m => m.psat?.inputs?.whatIfScenario
          ? n((out?.annual_cost ?? 0) - (m.psat?.outputs?.annual_cost ?? 0), 0) : '—')],
      ['Implementation Cost',
        '—',
        ...mods.map(m => n(m.psat?.inputs?.implementationCosts, 0))],
      ['Payback Period (months)',
        '—',
        ...mods.map(m => this.calcPayback(out, m))],
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

    const row = (label: string, baseVal: any, modFn: (i: PsatInputs) => any, fmt?: (v: any) => string): string[] => {
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
