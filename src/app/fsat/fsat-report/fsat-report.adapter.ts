import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, buildSummaryRow, findRowIndices, formatNumber, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { BaseGasDensity, FanMotor, FanSetup, FSAT, FsatOutput, Modification, Plane, PlaneResult } from '../../shared/models/fans';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { FsatChartsService } from '../services/fsat-charts.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { FanTypes, Drives } from '../fanOptions';
import { motorEfficiencyConstants } from '../../psat/psatConstants';
import { getModulePaybackPeriod } from '../../shared/payback-period.utils';

export const FSAT_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'results', label: 'Result Data', description: 'Baseline and modification results comparison' },
  { key: 'graphs', label: 'Report Graphs', description: 'Pie and bar charts of energy distribution by loss category' },
  { key: 'detailedResults', label: 'Detailed Results', description: 'Psychrometric and traverse plane data' },
  { key: 'sankey', label: 'Sankey Diagrams', description: 'Energy flow sankey diagrams' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class FsatReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly fsatChartsService = inject(FsatChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [255, 228, 0]; // #FFE400

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment);
    const fsat = assessment.fsat;
    const modNames = fsat.modifications?.map(m => m.fsat?.name ?? '') ?? [];

    const meta: ReportMeta = {
      title: assessment?.name ?? 'FSAT Report',
      date: new Date().toISOString(),
      moduleColor: FsatReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildResultsSections(fsat, settings, modNames),
        ...this.buildReportGraphsSections(fsat, settings),
        ...this.buildDetailedResultsSections(fsat, settings, modNames),
        ...this.buildSankeySections(fsat, settings),
        ...this.buildInputSummarySections(fsat, settings, modNames),
      ],
    });
  }

  private buildResultsSections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const out = fsat.outputs;
    const mods = fsat.modifications ?? [];
    const showCO2 = this.featureFlagService.showOperationalImpacts();

    const fmt = (value: number | undefined, dec = 0) => value != null ? formatNumber(value, dec) : '—';
    const modCols = (key: keyof FsatOutput, dec = 0) => mods.map(m => fmt(m.fsat?.outputs?.[key] as number | undefined, dec));

    const modPercentSavings = mods.map(m =>
      m.fsat?.outputs?.percentSavings != null ? fmt(m.fsat.outputs.percentSavings, 0) + ' %' : '—'
    );
    const modEnergySavings = mods.map(m =>
      m.fsat?.whatIfScenario ? fmt(m.fsat.outputs?.energySavings, 0) : '—'
    );
    const modAnnualSavings = mods.map(m =>
      m.fsat?.whatIfScenario ? fmt(m.fsat.outputs?.annualSavings, 0) : '—'
    );
    const modCo2Savings = mods.map(m =>
      m.fsat?.whatIfScenario ? fmt((out?.co2EmissionsOutput ?? 0) - (m.fsat?.outputs?.co2EmissionsOutput ?? 0), 2) : '—'
    );
    const modImplementationCosts = mods.map(m => fmt(m.fsat?.implementationCosts, 0));
    const modPayback = mods.map(m => this.calcPayback(out, m));

    const rows: string[][] = [
      ['Percent Savings (%)', '—', ...modPercentSavings],
      ['Fan Energy Index', fmt(out?.fanEnergyIndex, 2), ...modCols('fanEnergyIndex', 2)],
      ['Fan Efficiency (%)', fmt(out?.fanEfficiency, 1), ...modCols('fanEfficiency', 1)],
      [`Motor Rated Power (${settings.fanPowerMeasurement})`, fmt(out?.motorRatedPower, 0), ...modCols('motorRatedPower', 0)],
      [`Motor Shaft Power (${settings.fanPowerMeasurement})`, fmt(out?.motorShaftPower, 1), ...modCols('motorShaftPower', 1)],
      [`Fan Shaft Power (${settings.fanPowerMeasurement})`, fmt(out?.fanShaftPower, 1), ...modCols('fanShaftPower', 1)],
      ['Motor Efficiency (%)', fmt(out?.motorEfficiency, 1), ...modCols('motorEfficiency', 1)],
      ['Motor Power Factor (%)', fmt(out?.motorPowerFactor, 1), ...modCols('motorPowerFactor', 1)],
      ['Percent Loaded (%)', fmt(out?.loadFactor != null ? out.loadFactor * 100 : undefined, 1),
        ...mods.map(m => fmt(m.fsat?.outputs?.loadFactor != null ? m.fsat.outputs.loadFactor * 100 : undefined, 1))],
      ['Drive Efficiency (%)', fmt(out?.driveEfficiency, 1), ...modCols('driveEfficiency', 1)],
      ['Motor Current (amps)', fmt(out?.motorCurrent, 0), ...modCols('motorCurrent', 0)],
      ['Motor Power (kW)', fmt(out?.motorPower, 1), ...modCols('motorPower', 1)],
    ];

    const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
    if (showCO2) {
      rows.push(
        [`Annual CO2 Emissions (${emissionsUnit})`, fmt(out?.co2EmissionsOutput, 1), ...modCols('co2EmissionsOutput', 1)],
        [`Annual CO2 Emissions Savings (${emissionsUnit})`, '—', ...modCo2Savings],
      );
    }

    rows.push(
      ['Annual Energy (MWh)', fmt(out?.annualEnergy, 0), ...modCols('annualEnergy', 0)],
      ['Annual Energy Savings (MWh)', '—', ...modEnergySavings],
      [`Annual Cost (${settings.currency})`, fmt(out?.annualCost, 0), ...modCols('annualCost', 0)],
      [`Annual Savings (${settings.currency})`, '—', ...modAnnualSavings],
      ['Implementation Cost', '—', ...modImplementationCosts],
      ['Payback Period (months)', '—', ...modPayback],
    );

    const emphasisRowsIndices = findRowIndices(rows, [
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

  private calcPayback(baselineOut: FsatOutput, mod: Modification): string {
    return formatNumber(getModulePaybackPeriod(baselineOut?.annualCost, mod.fsat?.outputs?.annualCost, mod.fsat?.implementationCosts), 1);
  }

  private buildReportGraphsSections(fsat: FSAT, settings: Settings): ChartSection[] {
    const allData = this.fsatChartsService.collectGraphData(fsat, settings);
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
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.fsatChartsService.buildEnergyDistributionChart(baseline, mod)),
      });
      sections.push({
        type: 'chart',
        title: `Power Comparison — ${mod.name}`,
        group: 'graphs',
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.fsatChartsService.buildPowerComparisonChart(baseline, mod)),
      });
    }

    return sections;
  }

  private buildDetailedResultsSections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [];

    const psychrometricSection = this.buildPsychrometricSection(fsat, settings, modNames);
    if (psychrometricSection) sections.push(psychrometricSection);

    const variants: Array<{ name: string; fsat: FSAT }> = [{ name: fsat.name ?? 'Baseline', fsat }];
    fsat.modifications?.forEach(m => {
      if (m.fsat) variants.push({ name: m.fsat.name ?? 'Modification', fsat: m.fsat });
    });

    variants.forEach(v => {
      const planeSection = this.buildPlaneDataSection(v.fsat, v.name, settings);
      if (planeSection) sections.push(planeSection);
    });

    return sections;
  }

  private buildPsychrometricSection(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection | null {
    if (!fsat.outputs?.psychrometricResults) return null;

    const headers = ['', 'Baseline', ...modNames];
    const mods = fsat.modifications ?? [];
    const psychro = (f: FSAT | undefined) => f?.outputs?.psychrometricResults;
    const fmt = (value: number | undefined, dec: number) => value != null ? formatNumber(value, dec) : '—';

    const enthalpyUnit = settings.unitsOfMeasure === 'Metric' ? 'kJ/kg' : 'btu/lb';
    const specificVolumeUnit = settings.unitsOfMeasure === 'Metric' ? 'm3/kg' : 'ft3/lb';

    const rows: string[][] = [
      buildSummaryRow(mods, `Dry Bulb (${settings.fanTemperatureMeasurement})`,
        fmt(psychro(fsat)?.dryBulbTemp, 4), m => fmt(psychro(m.fsat)?.dryBulbTemp, 4)),
      buildSummaryRow(mods, 'Relative Humidity (%)', fmt(psychro(fsat)?.relativeHumidity, 1), m => fmt(psychro(m.fsat)?.relativeHumidity, 1)),
      buildSummaryRow(mods, `Wet Bulb (${settings.fanTemperatureMeasurement})`,
        fmt(psychro(fsat)?.wetBulbTemp, 1), m => fmt(psychro(m.fsat)?.wetBulbTemp, 1)),
      buildSummaryRow(mods, `Dew Point (${settings.fanTemperatureMeasurement})`,
        fmt(psychro(fsat)?.dewPoint, 1), m => fmt(psychro(m.fsat)?.dewPoint, 1)),
      buildSummaryRow(mods, `Enthalpy (${enthalpyUnit})`, fmt(psychro(fsat)?.enthalpy, 1), m => fmt(psychro(m.fsat)?.enthalpy, 1)),
      buildSummaryRow(mods, `Air Density (${settings.densityMeasurement})`,
        fmt(psychro(fsat)?.gasDensity, 4), m => fmt(psychro(m.fsat)?.gasDensity, 4)),
      buildSummaryRow(mods, `Specific Volume (${specificVolumeUnit})`, fmt(psychro(fsat)?.specificVolume, 2), m => fmt(psychro(m.fsat)?.specificVolume, 2)),
      buildSummaryRow(mods, `Barometric Pressure (${settings.fanPressureMeasurement})`,
        fmt(psychro(fsat)?.barometricPressure, 3), m => fmt(psychro(m.fsat)?.barometricPressure, 3)),
      buildSummaryRow(mods, `Saturation Pressure (${settings.fanBarometricPressure})`,
        fmt(psychro(fsat)?.saturationPressure, 3), m => fmt(psychro(m.fsat)?.saturationPressure, 3)),
      buildSummaryRow(mods, 'Saturation Humidity Ratio', fmt(psychro(fsat)?.saturatedHumidity, 3), m => fmt(psychro(m.fsat)?.saturatedHumidity, 3)),
      buildSummaryRow(mods, `Absolute Pressure (${settings.fanPressureMeasurement})`,
        fmt(psychro(fsat)?.absolutePressure, 2), m => fmt(psychro(m.fsat)?.absolutePressure, 2)),
      buildSummaryRow(mods, 'Degree of Saturation', fmt(psychro(fsat)?.saturationDegree, 3), m => fmt(psychro(m.fsat)?.saturationDegree, 3)),
      buildSummaryRow(mods, 'Humidity Ratio', fmt(psychro(fsat)?.humidityRatio, 4), m => fmt(psychro(m.fsat)?.humidityRatio, 4)),
    ];

    return {
      type: 'summary-table',
      title: 'Psychrometric Data',
      group: 'detailedResults',
      headers,
      rows,
      pageBreakBefore: true,
    };
  }

  /** Ported from traverse-results.component.html — only present when Method 2 (pitot traverse) plane data was used. */
  private buildPlaneDataSection(fsat: FSAT, variantName: string, settings: Settings): SummaryTableSection | null {
    const planeResults = fsat.outputs?.planeResults;
    const planeInputs = fsat.fan203InputsForPlaneResults;
    if (!planeResults || planeResults.error || !planeInputs) return null;

    const fmt = (value: number | undefined) => value != null ? formatNumber(value, 3) : '—';
    const areaUnit = settings.fanFlowRate === 'ft3/min' ? 'ft2' : 'm2';
    const velocityUnit = settings.fanFlowRate === 'ft3/min' ? 'ft/min' : 'm/s';

    const headers = [
      'Plane #', 'Plane Description',
      `Gas Density (${settings.densityMeasurement})`,
      `Planar Area (${areaUnit})`,
      `Volume Flow (${settings.fanFlowRate})`,
      `Gas Velocity (${velocityUnit})`,
      `Dry Bulb Temp (${settings.fanTemperatureMeasurement})`,
      `Static Pressure (${settings.fanPressureMeasurement})`,
      `Velocity Pressure (${settings.fanPressureMeasurement})`,
      `Total Pressure (${settings.fanPressureMeasurement})`,
      `Barometric Pressure (${settings.fanBarometricPressure})`,
    ];

    const planeRow = (num: string, description: string, result: PlaneResult | undefined, input: Plane | undefined): string[] => [
      num, description,
      fmt(result?.gasDensity), fmt(input?.area), fmt(result?.gasVolumeFlowRate), fmt(result?.gasVelocity),
      fmt(input?.dryBulbTemp), fmt(input?.staticPressure ?? result?.staticPressure), fmt(result?.gasVelocityPressure),
      fmt(result?.gasTotalPressure), fmt(input?.barometricPressure),
    ];

    const planeData = planeInputs.PlaneData;
    const fanRatedInfo = planeInputs.FanRatedInfo;
    const rows: string[][] = [
      planeRow('3a', 'Flow Traverse', planeResults.FlowTraverse, planeData?.FlowTraverse),
    ];
    if (fanRatedInfo?.traversePlanes > 1) {
      rows.push(planeRow('3b', "Add'l Traverse Plane 1", planeResults.AddlTraversePlanes?.[0], planeData?.AddlTraversePlanes?.[0]));
    }
    if (fanRatedInfo?.traversePlanes > 2) {
      rows.push(planeRow('3c', "Add'l Traverse Plane 2", planeResults.AddlTraversePlanes?.[1], planeData?.AddlTraversePlanes?.[1]));
    }
    rows.push(planeRow('4', 'Inlet Measurement Plane', planeResults.InletMstPlane, planeData?.InletMstPlane));
    rows.push(planeRow('1', 'Fan Inlet Flange', planeResults.FanInletFlange, planeData?.FanInletFlange));
    if (fanRatedInfo?.upDownStream !== 'Downstream') {
      rows.push(planeRow('5', 'Outlet Measurement Plane', planeResults.OutletMstPlane, planeData?.OutletMstPlane));
    }
    rows.push(planeRow('2', 'Fan or Evase Outlet Flange', planeResults.FanOrEvaseOutletFlange, planeData?.FanEvaseOrOutletFlange));
    if (fanRatedInfo?.upDownStream === 'Downstream') {
      rows.push(planeRow('5', 'Outlet Measurement Plane', planeResults.OutletMstPlane, planeData?.OutletMstPlane));
    }

    return {
      type: 'summary-table',
      title: `${variantName} Plane Data Table`,
      group: 'detailedResults',
      headers,
      rows,
      pageBreakBefore: true,
    };
  }

  private buildSankeySections(fsat: FSAT, settings: Settings): ChartSection[] {
    const sections: ChartSection[] = [];

    if (fsat.outputs) {
      sections.push({
        type: 'chart',
        title: fsat.name ?? 'Baseline',
        group: 'sankey',
        pageBreakBefore: true,
        imageDataProvider: () => this.fsatChartsService.renderSankeyAsImage(fsat.outputs, settings),
      });
    }

    fsat.modifications?.forEach(m => {
      if (m.fsat?.valid?.isValid && m.fsat.outputs) {
        sections.push({
          type: 'chart',
          title: m.fsat.name ?? 'Modification',
          group: 'sankey',
          pageBreakBefore: false,
          imageDataProvider: () => this.fsatChartsService.renderSankeyAsImage(m.fsat.outputs, settings),
        });
      }
    });

    return sections;
  }

  private buildInputSummarySections(fsat: FSAT, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const mods = fsat.modifications ?? [];
    const showCO2 = this.featureFlagService.showOperationalImpacts();


    const operationsRows: string[][] = [
      buildSummaryRow(mods, 'Operating Hours', fsat.fsatOperations?.operatingHours, m => m.fsat?.fsatOperations?.operatingHours),
      buildSummaryRow(mods, `Cost (${settings.currency}/kWh)`, fsat.fsatOperations?.cost, m => m.fsat?.fsatOperations?.cost,
        v => v != null ? formatNumber(v, 0) : '—'),
    ];
    if (showCO2) {
      operationsRows.push(
        buildSummaryRow(mods, 'Total Emission Output Rate (kg CO2/MWh)', fsat.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate,
          m => m.fsat?.fsatOperations?.cO2SavingsData?.totalEmissionOutputRate)
      );
    }

    const fieldData = fsat.fieldData;
    const fieldDataRows: string[][] = [
      buildSummaryRow(mods, `Flow Rate (${settings.fanFlowRate})`, fieldData?.flowRate, m => m.fsat?.fieldData?.flowRate),
      buildSummaryRow(mods, `Inlet Pressure (${settings.fanPressureMeasurement})`, fieldData?.inletPressure, m => m.fsat?.fieldData?.inletPressure),
      buildSummaryRow(mods, `Outlet Pressure (${settings.fanPressureMeasurement})`, fieldData?.outletPressure, m => m.fsat?.fieldData?.outletPressure),
      buildSummaryRow(mods, 'Load Estimated Method', fieldData?.loadEstimatedMethod, m => m.fsat?.fieldData?.loadEstimatedMethod,
        v => v === 0 ? 'Power' : v === 1 ? 'Current' : '—'),
      buildSummaryRow(mods, 'Compressibility Factor', fieldData?.compressibilityFactor, m => m.fsat?.fieldData?.compressibilityFactor),
      buildSummaryRow(mods, 'Measured Voltage (V)', fieldData?.measuredVoltage, m => m.fsat?.fieldData?.measuredVoltage),
    ];

    const fanMotor = fsat.fanMotor;
    const motorRows: string[][] = [
      buildSummaryRow(mods, 'Line Frequency (Hz)', fanMotor?.lineFrequency, m => m.fsat?.fanMotor?.lineFrequency),
      buildSummaryRow(mods, `Motor Rated Power (${settings.fanPowerMeasurement})`, fanMotor?.motorRatedPower, m => m.fsat?.fanMotor?.motorRatedPower),
      buildSummaryRow(mods, 'Motor RPM (rpm)', fanMotor?.motorRpm, m => m.fsat?.fanMotor?.motorRpm),
      buildSummaryRow(mods, 'Efficiency Class', fanMotor?.efficiencyClass, m => m.fsat?.fanMotor?.efficiencyClass,
        v => this.getEfficiencyClassDisplay(v as number)),
      buildSummaryRow(mods, 'Specified Efficiency (%)', this.getSpecifiedEfficiencyDisplay(fanMotor), m => this.getSpecifiedEfficiencyDisplay(m.fsat?.fanMotor)),
      buildSummaryRow(mods, 'Motor Rated Voltage (V)', fanMotor?.motorRatedVoltage, m => m.fsat?.fanMotor?.motorRatedVoltage),
      buildSummaryRow(mods, 'Full Load Amps (A)', fanMotor?.fullLoadAmps, m => m.fsat?.fanMotor?.fullLoadAmps,
        v => v != null ? formatNumber(v, 0) : '—'),
    ];

    const fanSetup = fsat.fanSetup;
    const fanRows: string[][] = [
      buildSummaryRow(mods, 'Fan Type', fanSetup?.fanType, m => m.fsat?.fanSetup?.fanType,
        v => this.getFanTypeDisplay(v as number)),
      buildSummaryRow(mods, 'Fan Speed (rpm)', fanSetup?.fanSpeed, m => m.fsat?.fanSetup?.fanSpeed),
      buildSummaryRow(mods, 'Drive', fanSetup?.drive, m => m.fsat?.fanSetup?.drive,
        v => this.getDriveDisplay(v as number)),
      buildSummaryRow(mods, 'Drive Efficiency (%)', this.getDriveEfficiencyDisplay(fanSetup), m => this.getDriveEfficiencyDisplay(m.fsat?.fanSetup)),
      buildSummaryRow(mods, 'Fan Efficiency (%)', fanSetup?.fanEfficiency, m => m.fsat?.fanSetup?.fanEfficiency,
        v => v != null ? formatNumber(v, 2) : '—'),
    ];

    const baseGasDensity = fsat.baseGasDensity;
    const fluidRows: string[][] = [
      buildSummaryRow(mods, `Barometric Pressure (${settings.fanBarometricPressure})`, baseGasDensity?.barometricPressure, m => m.fsat?.baseGasDensity?.barometricPressure),
      buildSummaryRow(mods, 'Specific Heat Ratio', baseGasDensity?.specificHeatRatio, m => m.fsat?.baseGasDensity?.specificHeatRatio),
      buildSummaryRow(mods, 'Gas Type', baseGasDensity?.gasType, m => m.fsat?.baseGasDensity?.gasType),
      buildSummaryRow(mods, 'Method to Establish Gas Density', baseGasDensity?.inputType, m => m.fsat?.baseGasDensity?.inputType,
        v => this.getGasDensityInputTypeDisplay(v as string)),
      buildSummaryRow(mods, `Dry Bulb Temperature (${settings.unitsOfMeasure === 'Imperial' ? 'F' : 'C'})`,
        this.getGasDensityFieldDisplay(baseGasDensity, 'dryBulbTemp'), m => this.getGasDensityFieldDisplay(m.fsat?.baseGasDensity, 'dryBulbTemp')),
      buildSummaryRow(mods, `Static Pressure (${settings.fanPressureMeasurement})`,
        this.getGasDensityFieldDisplay(baseGasDensity, 'staticPressure'), m => this.getGasDensityFieldDisplay(m.fsat?.baseGasDensity, 'staticPressure')),
      buildSummaryRow(mods, `Wet Bulb Temperature (${settings.fanTemperatureMeasurement})`,
        this.getGasDensityFieldDisplay(baseGasDensity, 'wetBulbTemp'), m => this.getGasDensityFieldDisplay(m.fsat?.baseGasDensity, 'wetBulbTemp')),
      buildSummaryRow(mods, 'Relative Humidity (%)',
        this.getGasDensityFieldDisplay(baseGasDensity, 'relativeHumidity'), m => this.getGasDensityFieldDisplay(m.fsat?.baseGasDensity, 'relativeHumidity')),
      buildSummaryRow(mods, `Gas Dew Point (${settings.fanTemperatureMeasurement})`,
        this.getGasDensityFieldDisplay(baseGasDensity, 'dewPoint'), m => this.getGasDensityFieldDisplay(m.fsat?.baseGasDensity, 'dewPoint')),
      buildSummaryRow(mods, `Gas Density (${settings.densityMeasurement})`, baseGasDensity?.gasDensity, m => m.fsat?.baseGasDensity?.gasDensity),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Fan Operations', operationsRows);
    addGroup('Field Data', fieldDataRows);
    addGroup('Motor', motorRows);
    addGroup('Fan', fanRows);
    addGroup('Fluid', fluidRows);

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

  private getFanTypeDisplay(value: number): string {
    return FanTypes.find(t => t.value === value)?.display ?? '—';
  }

  private getDriveDisplay(value: number): string {
    return Drives.find(d => d.value === value)?.display ?? '—';
  }

  private getEfficiencyClassDisplay(value: number): string {
    return motorEfficiencyConstants.find(c => c.value === value)?.display ?? '—';
  }

  private getGasDensityInputTypeDisplay(type: string): string {
    switch (type) {
      case 'relativeHumidity': return 'Relative Humidity';
      case 'dewPoint': return 'Dew Point';
      case 'wetBulb': return 'Wet Bulb';
      case 'custom': return 'Custom Density';
      default: return type ?? '—';
    }
  }

  private getSpecifiedEfficiencyDisplay(fanMotor: FanMotor | undefined): string {
    return fanMotor?.efficiencyClass === 3 && fanMotor?.specifiedEfficiency != null ? String(fanMotor.specifiedEfficiency) : '—';
  }

  private getDriveEfficiencyDisplay(fanSetup: FanSetup | undefined): string {
    return fanSetup?.drive === 4 && fanSetup?.specifiedDriveEfficiency != null ? formatNumber(fanSetup.specifiedDriveEfficiency, 2) : '—';
  }

  /** Base gas density fields are only meaningful for certain `inputType` selections — mirrors base-gas-density-summary.component.html. */
  private getGasDensityFieldDisplay(baseGasDensity: BaseGasDensity | undefined, field: 'dryBulbTemp' | 'staticPressure' | 'wetBulbTemp' | 'relativeHumidity' | 'dewPoint'): string {
    const gatingInputType: Record<typeof field, string | null> = {
      dryBulbTemp: 'custom', staticPressure: 'custom',
      wetBulbTemp: 'wetBulb', relativeHumidity: 'relativeHumidity', dewPoint: 'dewPoint',
    };
    const gate = gatingInputType[field];
    const isShown = gate === 'custom' ? baseGasDensity?.inputType !== 'custom' : baseGasDensity?.inputType === gate;
    const value = baseGasDensity?.[field];
    return isShown && value != null ? String(value) : '—';
  }
}
