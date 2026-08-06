import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, formatNumber, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import {
  CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary, EndUse,
  Modification, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, SystemInformation,
} from '../../shared/models/compressed-air-assessment';
import { CompressedAirProfileSummary } from '../calculations/CompressedAirProfileSummary';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { CompressedAirCalculationService } from '../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirCombinedDayTypeResults } from '../calculations/modifications/CompressedAirCombinedDayTypeResults';
import { BaselineResults, DayTypeModificationResult, EemSavingsResults } from '../calculations/caCalculationModels';
import { CompressedAirChartsService } from '../services/compressed-air-charts.service';
import { COMPRESSED_AIR_EEMS, EemDescriptor, eemSavings } from '../services/compressed-air-eems';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { InventoryFormService } from '../baseline-tab-content/inventory-setup/inventory/inventory-form.service';
import { PerformancePointsFormService } from '../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { GenericCompressorDbService } from '../../shared/generic-compressor-db.service';
import { ExploreOpportunitiesValidationService } from '../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { CompressedAirModificationValid } from '../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

type CombinedDayTypeResult = { modification: Modification; combinedResults: DayTypeModificationResult; validation: CompressedAirModificationValid };

export const COMPRESSED_AIR_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'executiveSummary', label: 'Executive Summary', description: 'Baseline and modification results comparison' },
  { key: 'paybackDetails', label: 'Payback Details', description: 'Per-EEM payback breakdown by modification' },
  { key: 'performanceProfile', label: 'Performance Profiles', description: 'Compressor performance curves and specific-power summary' },
  { key: 'sankey', label: 'Report Sankey', description: 'Power and airflow sankey diagrams for the selected day type' },
  { key: 'systemProfiles', label: 'System Profiles', description: 'Hourly compressor profile summaries by day type' },
  { key: 'graphs', label: 'Report Graphs', description: 'Cost, energy, and airflow savings charts' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class CompressedAirReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly compressedAirCalculationService = inject(CompressedAirCalculationService);
  private readonly assessmentCo2SavingsService = inject(AssessmentCo2SavingsService);
  private readonly compressedAirChartsService = inject(CompressedAirChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);
  private readonly inventoryFormService = inject(InventoryFormService);
  private readonly performancePointsFormService = inject(PerformancePointsFormService);
  private readonly genericCompressorDbService = inject(GenericCompressorDbService);
  private readonly exploreOpportunitiesValidationService = inject(ExploreOpportunitiesValidationService);

  private static readonly ACCENT_COLOR: [number, number, number] = [112, 48, 160]; // #7030A0

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    const compressedAirAssessment = assessment.compressedAirAssessment;

    const baselineResultsCalc = new CompressedAirAssessmentBaselineResults(compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
    const baselineResults = baselineResultsCalc.baselineResults;
    const assessmentResults: CompressedAirAssessmentModificationResults[] = [];
    const combinedDayTypeResults: CombinedDayTypeResult[] = [];

    compressedAirAssessment.modifications.forEach(modification => {
      const results = new CompressedAirAssessmentModificationResults(compressedAirAssessment, modification, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, baselineResultsCalc);
      assessmentResults.push(results);
      const combined = new CompressedAirCombinedDayTypeResults(results).getDayTypeModificationResult();
      const validation = this.exploreOpportunitiesValidationService.setModificationValid(modification, baselineResults, baselineResultsCalc.baselineDayTypeProfileSummaries, compressedAirAssessment, settings, results);
      combinedDayTypeResults.push({ modification, combinedResults: combined, validation });
    });

    const meta: ReportMeta = {
      title: assessment?.name ?? 'Compressed Air Report',
      date: new Date().toISOString(),
      moduleColor: CompressedAirReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildExecutiveSummarySections(baselineResults, combinedDayTypeResults, settings),
        ...this.buildPaybackDetailsSections(combinedDayTypeResults),
        ...this.buildPerformanceProfileSections(compressedAirAssessment, baselineResultsCalc, assessmentResults, settings),
        ...this.buildSankeySections(compressedAirAssessment, baselineResultsCalc, settings),
        ...this.buildSystemProfilesSections(compressedAirAssessment, baselineResultsCalc, assessmentResults, settings),
        ...this.buildReportGraphsSections(compressedAirAssessment, baselineResults, assessmentResults, combinedDayTypeResults, settings),
        ...this.buildInputSummarySections(compressedAirAssessment, settings),
      ],
    });
  }

  // ---------------------------------------------------------------------------------
  // Executive Summary
  // ---------------------------------------------------------------------------------

  private buildExecutiveSummarySections(baselineResults: BaselineResults, combinedDayTypeResults: CombinedDayTypeResult[], settings: Settings): SummaryTableSection[] {
    if (combinedDayTypeResults.length === 0) return [];

    const headers = ['', 'Baseline', ...combinedDayTypeResults.map(r => r.modification.name)];
    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
    const airflowUnit = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';
    const fmtMod = (r: CombinedDayTypeResult, v: number | undefined, dec = 0) => r.validation.isValid ? fmt(v, dec) : '—';

    const isEemDisplayed = (eem: EemDescriptor): boolean => {
      if (eem.modificationKey === 'flowReallocation') return combinedDayTypeResults.some(r => r.combinedResults.flowReallocationSavings.savings.power != 0);
      if (eem.modificationKey === 'replaceCompressor') return combinedDayTypeResults.some(r => r.combinedResults.replaceCompressorsSavings.savings.power != 0);
      return combinedDayTypeResults.some(r => (r.modification[eem.modificationKey] as { order: number }).order != 100);
    };
    const displayAuxiliaryPower = combinedDayTypeResults.some(r =>
      r.modification.improveEndUseEfficiency.endUseEfficiencyItems?.some(item => item.substituteAuxiliaryEquipment));
    const displaySalvageValue = combinedDayTypeResults.some(r => r.combinedResults.allSavingsResults.salvageValue != 0);

    const rows: string[][] = [
      ['Percent Savings (%)', '—', ...combinedDayTypeResults.map(r => r.validation.isValid ? fmt(r.combinedResults.allSavingsResults.savings.percentSavings, 0) + ' %' : '—')],
    ];

    COMPRESSED_AIR_EEMS.forEach(eem => {
      if (isEemDisplayed(eem)) {
        rows.push([`${eem.label} Savings (kWh)`, '—', ...combinedDayTypeResults.map(r => fmtMod(r, eemSavings(r.combinedResults, eem.savingsKey).savings.power, 0))]);
      }
    });
    if (displayAuxiliaryPower) {
      rows.push(['Auxiliary Power Energy Use (kWh)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.auxiliaryPowerUsage.energyUse, 0))]);
    }

    rows.push(
      ['Peak Demand (kW)', fmt(baselineResults.total.peakDemand, 2), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.peakDemand, 2))],
      [`Peak Airflow (${airflowUnit})`, fmt(baselineResults.total.maxAirFlow, 2), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.maxAirFlow, 2))],
      ['Annual Energy Used (kWh)', fmt(baselineResults.total.energyUse, 0), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.adjustedResults.power, 0))],
    );
    if (showCO2) {
      rows.push([`Annual Emission Output Rate (${emissionsUnit})`, fmt(baselineResults.total.annualEmissionOutput, 0), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.annualEmissionOutput, 0))]);
    }
    rows.push(
      ['Peak Demand Savings (kW)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, baselineResults.total.peakDemand - r.combinedResults.peakDemand, 2))],
      ['Annual Energy Savings (kWh)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.savings.power, 0))],
    );
    if (showCO2) {
      rows.push([`Annual Emission Savings (${emissionsUnit})`, '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.savings.annualEmissionOutputSavings, 0))]);
    }

    const costRows: string[][] = [];
    COMPRESSED_AIR_EEMS.forEach(eem => {
      if (isEemDisplayed(eem)) {
        costRows.push([`${eem.label} Savings ($)`, '—', ...combinedDayTypeResults.map(r => fmtMod(r, eemSavings(r.combinedResults, eem.savingsKey).savings.cost, 0))]);
      }
    });
    if (displayAuxiliaryPower) {
      costRows.push(['Auxiliary Power Cost ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.auxiliaryPowerUsage.cost * -1, 0))]);
    }
    costRows.push(
      ['Peak Demand Cost ($)', fmt(baselineResults.total.demandCost, 2), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.peakDemandCost, 2))],
      ['Energy Cost ($)', fmt(baselineResults.total.cost, 0), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.adjustedResults.cost, 0))],
      ['Operating Cost ($)', fmt(baselineResults.total.totalAnnualOperatingCost, 0), ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.totalAnnualOperatingCost, 0))],
      ['Peak Demand Cost Savings ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.peakDemandCostSavings, 2))],
      ['Energy Cost Savings ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.savings.cost, 0))],
      ['Cost Savings ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, baselineResults.total.totalAnnualOperatingCost - r.combinedResults.totalAnnualOperatingCost, 0))],
      ['Implementation Costs ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.implementationCost, 0))],
    );
    if (displaySalvageValue) {
      costRows.push(['Salvage Value ($)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.salvageValue, 0))]);
    }
    costRows.push(['Simple Payback Period (months)', '—', ...combinedDayTypeResults.map(r => fmtMod(r, r.combinedResults.allSavingsResults.paybackPeriod, 2))]);

    const allRows: string[][] = [...rows];
    const subGroupHeaderIndices: number[] = [];
    appendSubGroup(allRows, subGroupHeaderIndices, headers.length, 'Annual Savings', costRows);
    allRows.push(
      ['Demand Side Energy Projects', '—', ...combinedDayTypeResults.map(r => this.getDemandEnergyProjects(r.modification))],
      ['Supply Side Energy Projects', '—', ...combinedDayTypeResults.map(r => this.getSupplyEnergyProjects(r.modification))],
    );

    return [{
      type: 'summary-table',
      title: 'Executive Summary',
      group: 'executiveSummary',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore: true,
    }];
  }

  private getDemandEnergyProjects(modification: Modification): string {
    const projects: string[] = [];
    if (modification.reduceAirLeaks.order != 100) projects.push('Reduce Air Leaks');
    if (modification.improveEndUseEfficiency.order != 100) projects.push('Improve End Use Efficiency');
    return projects.length ? projects.join(', ') : '—';
  }

  private getSupplyEnergyProjects(modification: Modification): string {
    const projects: string[] = [];
    if (modification.adjustCascadingSetPoints.order != 100) projects.push('Adjust Cascading Set Points');
    if (modification.useAutomaticSequencer.order != 100) projects.push('Use Automatic Sequencer');
    if (modification.reduceRuntime.order != 100) projects.push('Reduce Runtime');
    if (modification.addPrimaryReceiverVolume.order != 100) projects.push('Add Primary Receiver Volume');
    if (modification.reduceSystemAirPressure.order != 100) projects.push('Reduce System Air Pressure');
    if (modification.replaceCompressor.order != 100) projects.push('Replace Compressor(s)');
    return projects.length ? projects.join(', ') : '—';
  }

  // ---------------------------------------------------------------------------------
  // Payback Details
  // ---------------------------------------------------------------------------------

  private buildPaybackDetailsSections(combinedDayTypeResults: CombinedDayTypeResult[]): SummaryTableSection[] {
    if (combinedDayTypeResults.length === 0) return [];

    const showSalvageValue = combinedDayTypeResults.some(r => r.combinedResults.allSavingsResults.salvageValue != 0);
    const fmt = (v: number | undefined, dec = 0) => v != null ? formatNumber(v, dec) : '—';
    const paybackCell = (v: number) => v ? formatNumber(v, 2) : '—';
    const headers = ['', 'Energy Cost Savings ($)', 'Peak Demand Savings ($)', 'Implementation Cost ($)', ...(showSalvageValue ? ['Salvage Value ($)'] : []), 'Payback (months)'];

    const eemRow = (label: string, result: EemSavingsResults, opts: { costOverride?: number; salvageValue?: number; alwaysShowPayback?: boolean } = {}): string[] => {
      const row = [label, fmt(opts.costOverride ?? result.savings.cost, 0), '—', fmt(result.implementationCost, 0)];
      if (showSalvageValue) row.push(opts.salvageValue != null ? fmt(opts.salvageValue, 0) : '—');
      row.push(opts.alwaysShowPayback ? fmt(result.paybackPeriod, 2) : paybackCell(result.paybackPeriod));
      return row;
    };

    return combinedDayTypeResults.map((r, i) => {
      const rows: string[][] = [
        eemRow('Flow Reallocation', r.combinedResults.flowReallocationSavings, { alwaysShowPayback: true }),
        eemRow('Replace Compressors', r.combinedResults.replaceCompressorsSavings, { salvageValue: r.combinedResults.replaceCompressorsSavings.salvageValue, alwaysShowPayback: true }),
      ];

      const conditionalEems: Array<{ label: string; result: EemSavingsResults; costOverride?: number }> = [
        { label: 'Add Receiver Volume', result: r.combinedResults.addReceiverVolumeSavings },
        { label: 'Adjust Cascading Points', result: r.combinedResults.adjustCascadingSetPointsSavings },
        {
          label: 'Improve End Use Efficiency', result: r.combinedResults.improveEndUseEfficiencySavings,
          costOverride: r.combinedResults.improveEndUseEfficiencySavings.savings.cost - r.combinedResults.auxiliaryPowerUsage.cost,
        },
        { label: 'Reduce Air Leaks', result: r.combinedResults.reduceAirLeaksSavings },
        { label: 'Reduce Runtime', result: r.combinedResults.reduceRunTimeSavings },
        { label: 'Reduce System Air Pressure', result: r.combinedResults.reduceSystemAirPressureSavings },
        { label: 'Use Automatic Sequencer', result: r.combinedResults.useAutomaticSequencerSavings },
      ];
      conditionalEems.forEach(eem => {
        if (eem.result.savings.cost) rows.push(eemRow(eem.label, eem.result, { costOverride: eem.costOverride }));
      });

      const totalRow = [
        'Total',
        fmt(r.combinedResults.allSavingsResults.savings.cost, 0),
        fmt(r.combinedResults.peakDemandCostSavings, 0),
        fmt(r.combinedResults.allSavingsResults.implementationCost, 0),
      ];
      if (showSalvageValue) totalRow.push(fmt(r.combinedResults.allSavingsResults.salvageValue, 0));
      totalRow.push(paybackCell(r.combinedResults.allSavingsResults.paybackPeriod));
      rows.push(totalRow);

      return {
        type: 'summary-table',
        title: `Payback Details — ${r.modification.name}`,
        group: 'paybackDetails',
        headers,
        rows,
        emphasisRowsIndices: [rows.length - 1],
        pageBreakBefore: i === 0,
      };
    });
  }

  // ---------------------------------------------------------------------------------
  // Performance Profiles
  // ---------------------------------------------------------------------------------

  private buildPerformanceProfileSections(
    compressedAirAssessment: CompressedAirAssessment,
    baselineResultsCalc: CompressedAirAssessmentBaselineResults,
    assessmentResults: CompressedAirAssessmentModificationResults[],
    settings: Settings,
  ): Array<ChartSection | SummaryTableSection> {
    const dayTypes = compressedAirAssessment.compressedAirDayTypes;
    const systemInformation = compressedAirAssessment.systemInformation;

    const variants: Array<{
      name: string;
      compressorItems: CompressorInventoryItem[];
      profileSummary: CompressedAirProfileSummary[];
      compressorSummaries: CompressorSummary[][];
    }> = [
      {
        name: 'Baseline',
        compressorItems: compressedAirAssessment.compressorInventoryItems ?? [],
        profileSummary: baselineResultsCalc.baselineDayTypeProfileSummaries.flatMap(s => s.profileSummary),
        compressorSummaries: baselineResultsCalc.getCompressorSummaries(settings),
      },
      ...assessmentResults.map(result => ({
        name: result.modification.name,
        compressorItems: result.modifiedDayTypeProfileSummaries[0]?.adjustedCompressors ?? [],
        profileSummary: result.modifiedDayTypeProfileSummaries.flatMap(s => s.adjustedProfileSummary),
        compressorSummaries: result.getCompressorSummaries(settings),
      })),
    ];

    const sections: Array<ChartSection | SummaryTableSection> = [];

    variants.forEach((variant, i) => {
      const chart = this.compressedAirChartsService.buildPerformanceProfileChart(variant.compressorItems, variant.profileSummary, dayTypes, systemInformation, settings);
      sections.push({
        type: 'chart',
        title: `${variant.name} Inventory Performance Profile`,
        group: 'performanceProfile',
        pageBreakBefore: i === 0,
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, chart),
      });

      const centrifugalCompressors = variant.compressorItems.filter(c => c.nameplateData.compressorType === 6 && c.compressorControls.controlType != null);
      if (centrifugalCompressors.length > 0) {
        const centrifugalChart = this.compressedAirChartsService.buildCentrifugalGraphChart(centrifugalCompressors, settings);
        sections.push({
          type: 'chart',
          title: `${variant.name} Centrifugal Compressor Curves`,
          group: 'performanceProfile',
          imageDataProvider: () => renderPlotlyChart(this.chartRenderService, centrifugalChart),
        });
      }

      sections.push(this.buildCompressorSummaryTable(variant.name, dayTypes, variant.compressorItems, variant.compressorSummaries, settings));
    });

    return sections;
  }

  private buildCompressorSummaryTable(
    variantName: string, dayTypes: CompressedAirDayType[], compressorItems: CompressorInventoryItem[],
    compressorSummaries: CompressorSummary[][], settings: Settings,
  ): SummaryTableSection {
    const headers = ['', 'Day Type', ...compressorItems.map(c => c.name)];
    const powerUnit = settings.unitsOfMeasure === 'Imperial' ? 'kW/100 acfm' : 'kW/m3/min';

    const rows: string[][] = dayTypes.map((dayType, i) => [
      i === 0 ? `Specific Power at Average Load, ${powerUnit}` : '', dayType.name,
      ...(compressorSummaries[i] ?? []).map(summary => this.formatCompressorSummaryValue(summary.specificPowerAvgLoad)),
    ]);
    rows.push([`Rated Specific Power, ${powerUnit}`, '', ...(compressorSummaries[0] ?? []).map(s => this.formatCompressorSummaryValue(s.ratedSpecificPower))]);
    rows.push(['Rated Isentropic Efficiency, %', '', ...(compressorSummaries[0] ?? []).map(s => s.ratedIsentropicEfficiency ? formatNumber(s.ratedIsentropicEfficiency, 2) : '—')]);

    return {
      type: 'summary-table',
      title: `${variantName} Compressor Summary`,
      group: 'performanceProfile',
      pageBreakBefore: true,
      headers,
      rows,
    };
  }

  /** Mirrors compressor-summary-table.component.html's three-way display: No Flow (non-finite), formatted number, or '—'. */
  private formatCompressorSummaryValue(value: number): string {
    if (!value) return '—';
    return isFinite(value) ? formatNumber(value, 2) : 'No Flow';
  }

  // ---------------------------------------------------------------------------------
  // Report Sankey
  // ---------------------------------------------------------------------------------

  /**
   * Baseline-only, single day type (endUseData.endUseDayTypeSetup.selectedDayTypeId) — mirrors
   * PowerSankeyComponent/AirflowSankeyComponent, which only ever render one day type at a time,
   * unlike System Profiles' baseline-vs-modification-per-day-type breakdown.
   */
  private buildSankeySections(compressedAirAssessment: CompressedAirAssessment, baselineResultsCalc: CompressedAirAssessmentBaselineResults, settings: Settings): ChartSection[] {
    if (!compressedAirAssessment.setupDone) return [];

    const endUseDayTypeSetup = compressedAirAssessment.endUseData?.endUseDayTypeSetup;
    const selectedDayTypeId = endUseDayTypeSetup?.selectedDayTypeId ?? compressedAirAssessment.compressedAirDayTypes[0]?.dayTypeId;
    if (!selectedDayTypeId) return [];

    const dayTypeLeakRate = endUseDayTypeSetup?.dayTypeLeakRates?.find(r => r.dayTypeId === selectedDayTypeId)?.dayTypeLeakRate ?? 0;
    const profileSummary = baselineResultsCalc.getDayTypeProfileSummary(selectedDayTypeId);

    const sections: ChartSection[] = [{
      type: 'chart',
      title: 'Power Sankey',
      group: 'sankey',
      pageBreakBefore: true,
      aspectRatio: CompressedAirChartsService.POWER_SANKEY_SIZE.width / CompressedAirChartsService.POWER_SANKEY_SIZE.height,
      imageDataProvider: async () => {
        const image = await this.compressedAirChartsService.renderPowerSankeyImage(compressedAirAssessment, dayTypeLeakRate, profileSummary);
        if (!image) throw new Error('Power Sankey unavailable — CFM warning');
        return image;
      },
    }];

    if (endUseDayTypeSetup && compressedAirAssessment.endUseData.endUses?.length > 0) {
      sections.push({
        type: 'chart',
        title: 'Airflow Sankey',
        group: 'sankey',
        aspectRatio: CompressedAirChartsService.AIRFLOW_SANKEY_SIZE.width / CompressedAirChartsService.AIRFLOW_SANKEY_SIZE.height,
        imageDataProvider: async () => {
          const image = await this.compressedAirChartsService.renderAirflowSankeyImage(compressedAirAssessment, endUseDayTypeSetup, settings);
          if (!image) throw new Error('Airflow Sankey unavailable — invalid end uses');
          return image;
        },
      });
    }

    return sections;
  }

  // ---------------------------------------------------------------------------------
  // System Profiles
  // ---------------------------------------------------------------------------------

  private buildSystemProfilesSections(
    compressedAirAssessment: CompressedAirAssessment,
    baselineResultsCalc: CompressedAirAssessmentBaselineResults,
    assessmentResults: CompressedAirAssessmentModificationResults[],
    settings: Settings,
  ): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [];
    const inventoryItems = (compressedAirAssessment.compressorInventoryItems ?? []).concat(compressedAirAssessment.replacementCompressorInventoryItems ?? []);
    const airflowUnit = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';

    compressedAirAssessment.compressedAirDayTypes.forEach((dayType, dayTypeIndex) => {
      const baselineSummary = baselineResultsCalc.baselineDayTypeProfileSummaries.find(s => s.dayType.dayTypeId === dayType.dayTypeId);
      if (baselineSummary) {
        sections.push(this.buildProfileSummaryTable(
          `${dayType.name} — Baseline`, baselineSummary.profileSummary, baselineSummary.profileSummaryTotals,
          inventoryItems, airflowUnit, dayTypeIndex === 0,
        ));
      }
      assessmentResults.forEach(result => {
        const modSummary = result.modifiedDayTypeProfileSummaries.find(s => s.dayType.dayTypeId === dayType.dayTypeId);
        if (modSummary) {
          const dayTypeModResult = modSummary.getDayTypeModificationResult();
          sections.push(this.buildProfileSummaryTable(
            `${dayType.name} — ${result.modification.name}`, dayTypeModResult.adjustedProfileSummary, dayTypeModResult.profileSummaryTotals,
            inventoryItems, airflowUnit, false,
          ));
        }
      });
    });

    return sections;
  }

  private buildProfileSummaryTable(
    title: string, profileSummary: ProfileSummary[], totals: ProfileSummaryTotal[],
    inventoryItems: CompressorInventoryItem[], airflowUnit: string, pageBreakBefore: boolean,
  ): SummaryTableSection {
    const hourLabels = (profileSummary[0]?.profileSummaryData ?? []).map(d => this.intervalHourLabel(d.timeInterval));
    const headers = ['', ...hourLabels];
    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    const dash = (data: ProfileSummaryData, value: number, dec = 2) => data.order != 0 ? formatNumber(value, dec) : '—';

    profileSummary.forEach(summary => {
      const compressorName = inventoryItems.find(item => item.itemId === summary.compressorId)?.name ?? '';
      addGroup(compressorName, [
        ['Power, kW', ...summary.profileSummaryData.map(d => dash(d, d.power))],
        [`Airflow, ${airflowUnit}`, ...summary.profileSummaryData.map(d => dash(d, d.airflow))],
        ['% Capacity', ...summary.profileSummaryData.map(d => dash(d, d.percentCapacity))],
        ['% Power', ...summary.profileSummaryData.map(d => dash(d, d.percentPower))],
        ['Order', ...summary.profileSummaryData.map(d => d.order != 0 ? String(d.order) : '—')],
      ]);
    });

    const showAuxiliary = totals.some(t => t.auxiliaryPower != 0);
    const totalsRows: string[][] = [];
    if (showAuxiliary) totalsRows.push(['Auxiliary Power, kW', ...totals.map(t => formatNumber(t.auxiliaryPower, 2))]);
    totalsRows.push(['Compressor Power, kW', ...totals.map(t => formatNumber(t.power, 2))]);
    if (showAuxiliary) totalsRows.push(['Total Power, kW', ...totals.map(t => formatNumber(t.totalPower, 2))]);
    totalsRows.push(
      [`Airflow, ${airflowUnit}`, ...totals.map(t => formatNumber(t.airflow, 2))],
      ['% Capacity', ...totals.map(t => formatNumber(t.percentCapacity, 2))],
      ['% Power', ...totals.map(t => formatNumber(t.percentPower, 2))],
    );
    addGroup('Totals', totalsRows);

    return {
      type: 'summary-table',
      title,
      group: 'systemProfiles',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore,
    };
  }

  private intervalHourLabel(intervalVal: number): string {
    const [whole, decimal] = intervalVal.toString().split('.');
    if (decimal == null) return `${intervalVal}:00`;
    if (decimal === '25') return `${whole}:15`;
    if (decimal === '5') return `${whole}:30`;
    if (decimal === '75') return `${whole}:45`;
    return `${whole}:00`;
  }

  // ---------------------------------------------------------------------------------
  // Report Graphs
  // ---------------------------------------------------------------------------------

  private buildReportGraphsSections(
    compressedAirAssessment: CompressedAirAssessment, baselineResults: BaselineResults,
    assessmentResults: CompressedAirAssessmentModificationResults[], combinedDayTypeResults: CombinedDayTypeResult[], settings: Settings,
  ): ChartSection[] {
    if (assessmentResults.length === 0) return [];
    const sections: ChartSection[] = [];

    const costChart = this.compressedAirChartsService.buildCostSavingsChart(assessmentResults, combinedDayTypeResults);
    sections.push({
      type: 'chart', title: 'Cost Savings — All Day Types Combined', group: 'graphs', pageBreakBefore: true,
      imageDataProvider: () => renderPlotlyChart(this.chartRenderService, costChart),
    });

    const energyChart = this.compressedAirChartsService.buildEnergySavingsChart(assessmentResults, combinedDayTypeResults);
    sections.push({
      type: 'chart', title: 'Energy Savings — All Day Types Combined', group: 'graphs',
      imageDataProvider: () => renderPlotlyChart(this.chartRenderService, energyChart),
    });

    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      const airflowChart = this.compressedAirChartsService.buildAirflowSavingsChart(dayType, baselineResults, assessmentResults, settings);
      sections.push({
        type: 'chart', title: `Airflow Savings — ${dayType.name}`, group: 'graphs',
        imageDataProvider: () => renderPlotlyChart(this.chartRenderService, airflowChart),
      });
    });

    return sections;
  }


  // ---------------------------------------------------------------------------------
  // Input Summary
  // ---------------------------------------------------------------------------------

  private buildInputSummarySections(compressedAirAssessment: CompressedAirAssessment, settings: Settings): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [this.buildSystemInfoSection(compressedAirAssessment.systemInformation, settings)];

    const inventoryItems = compressedAirAssessment.compressorInventoryItems ?? [];
    if (inventoryItems.length > 0) sections.push(this.buildCompressorInventorySection(inventoryItems, settings));

    const endUseSection = this.buildEndUseSection(compressedAirAssessment, settings);
    if (endUseSection) sections.push(endUseSection);

    // Each sub-builder defaults pageBreakBefore to true so it reads correctly on its own — only the
    // group's actual first section should force a page break, so strip it from the rest here.
    sections.forEach((section, i) => { if (i > 0) section.pageBreakBefore = false; });
    return sections;
  }

  private buildSystemInfoSection(systemInformation: SystemInformation, settings: Settings): SummaryTableSection {
    const showCO2 = this.featureFlagService.showOperationalImpacts();
    const pressureUnit = settings.unitsOfMeasure === 'Imperial' ? 'psia' : 'kpaa';
    const elevationUnit = settings.unitsOfMeasure === 'Imperial' ? 'ft' : 'm';
    const storageUnit = settings.unitsOfMeasure === 'Imperial' ? 'gal' : 'm3';
    const gaugeUnit = settings.unitsOfMeasure === 'Imperial' ? 'psig' : 'barg';
    const fmt = (v: number, unit: string) => v != null ? `${formatNumber(v, 2)} ${unit}` : '—';

    const rows: string[][] = [
      ['System Elevation', fmt(systemInformation.systemElevation, elevationUnit)],
      ['Atmospheric Pressure', fmt(systemInformation.atmosphericPressure, pressureUnit)],
      ['Total Air Storage', fmt(systemInformation.totalAirStorage, storageUnit)],
      ['Is a target pressure sequencer used?', systemInformation.isSequencerUsed ? 'Yes' : 'No'],
      ['Target Pressure', systemInformation.isSequencerUsed ? fmt(systemInformation.targetPressure, gaugeUnit) : '—'],
      ['Target Pressure Variance', systemInformation.isSequencerUsed ? fmt(systemInformation.variance, gaugeUnit) : '—'],
    ];
    if (showCO2) {
      rows.push(['Total Emission Output Rate', systemInformation.co2SavingsData?.totalEmissionOutputRate
        ? `${formatNumber(systemInformation.co2SavingsData.totalEmissionOutputRate, 2)} kg CO2/MWh` : '—']);
    }

    return {
      type: 'summary-table',
      title: 'System Information',
      group: 'inputData',
      headers: ['', ''],
      rows,
      pageBreakBefore: true,
    };
  }

  private buildCompressorInventorySection(compressorInventoryItems: CompressorInventoryItem[], settings: Settings): SummaryTableSection {
    const headers = ['', ...compressorInventoryItems.map(c => c.name)];
    const pressureUnit = settings.unitsOfMeasure === 'Imperial' ? 'psig' : 'barg';
    const flowUnit = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const inputPressureUnit = settings.unitsOfMeasure === 'Imperial' ? 'psia' : 'bara';

    const row = (label: string, valueFn: (c: CompressorInventoryItem) => string): string[] =>
      [label, ...compressorInventoryItems.map(valueFn)];

    const nameplateRows: string[][] = [
      row('Compressor Type', c => this.genericCompressorDbService.getCompressorTypeLabel(c.nameplateData.compressorType) ?? '—'),
      row('Motor Power', c => `${formatNumber(c.nameplateData.motorPower, 1)} kW`),
      row('Full Load Operating Pressure', c => `${formatNumber(c.nameplateData.fullLoadOperatingPressure, 1)} ${pressureUnit}`),
      row('Full Load Rated Capacity', c => `${formatNumber(c.nameplateData.fullLoadRatedCapacity, 1)} ${flowUnit}`),
      row('Full Load Amps', c => `${formatNumber(c.nameplateData.fullLoadAmps, 1)} amps`),
      row('Total Package Input Power', c => `${formatNumber(c.nameplateData.totalPackageInputPower, 1)} kW`),
    ];

    const controlsRows: string[][] = [
      row('Control Type', c => this.genericCompressorDbService.getControlTypeLabel(c.compressorControls.controlType) ?? '—'),
      row('Unload Point Capacity', c => this.inventoryFormService.checkDisplayUnloadCapacity(c.compressorControls.controlType)
        ? `${formatNumber(c.compressorControls.unloadPointCapacity, 1)} %` : '—'),
      row('Number of Unload Steps', c => this.inventoryFormService.checkDisplayUnloadCapacity(c.compressorControls.controlType)
        ? String(c.compressorControls.numberOfUnloadSteps) : '—'),
      row('Automatic Shutdown Timer', c => this.inventoryFormService.checkDisplayAutomaticShutdown(c.compressorControls.controlType)
        ? (c.compressorControls.automaticShutdown ? 'Yes' : 'No') : '—'),
      row('Unload Sump Pressure', c => this.inventoryFormService.checkDisplayUnloadSlumpPressure(c.nameplateData.compressorType, c.compressorControls.controlType)
        ? `${formatNumber(c.compressorControls.unloadSumpPressure, 1)} ${pressureUnit}` : '—'),
    ];

    const designRows: string[][] = [
      row('Blowdown Time', c => this.inventoryFormService.checkDisplayBlowdownTime(c.nameplateData.compressorType, c.compressorControls.controlType)
        ? `${formatNumber(c.designDetails.blowdownTime, 1)} sec.` : '—'),
      row('Modulating Pressure Range', c => this.inventoryFormService.checkDisplayModulation(c.compressorControls.controlType)
        ? `${formatNumber(c.designDetails.modulatingPressureRange, 1)} ${pressureUnit}` : '—'),
      row('Input Pressure', c => `${formatNumber(c.designDetails.inputPressure, 1)} ${inputPressureUnit}`),
      row('Design Efficiency', c => `${formatNumber(c.designDetails.designEfficiency, 1)} %`),
      row('Service Factor', c => formatNumber(c.designDetails.serviceFactor, 2)),
      row('No Load Power FM', c => this.inventoryFormService.checkDisplayNoLoadPowerFM(c.nameplateData.compressorType, c.compressorControls.controlType)
        ? `${formatNumber(c.designDetails.noLoadPowerFM, 1)} %` : '—'),
      row('No Load Power UL', c => this.inventoryFormService.checkDisplayNoLoadPowerUL(c.nameplateData.compressorType, c.compressorControls.controlType)
        ? `${formatNumber(c.designDetails.noLoadPowerUL, 1)} %` : '—'),
      row('Max Full Flow Pressure', c => this.performancePointsFormService.checkShowMaxFlowPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType)
        ? `${formatNumber(c.designDetails.maxFullFlowPressure, 1)} ${pressureUnit}` : '—'),
    ];

    const displayCentrifugal = compressorInventoryItems.some(c => c.nameplateData.compressorType === 6);
    const centrifugalRows: string[][] = [
      row('Surge Airflow', c => c.nameplateData.compressorType === 6 ? `${formatNumber(c.centrifugalSpecifics.surgeAirflow, 1)} ${flowUnit}` : '—'),
      row('Max. Full Load (surge) Pressure', c => c.nameplateData.compressorType === 6 ? `${formatNumber(c.centrifugalSpecifics.maxFullLoadPressure, 1)} ${pressureUnit}` : '—'),
      row('Capacity at Max Full Load Pressure', c => c.nameplateData.compressorType === 6 ? `${formatNumber(c.centrifugalSpecifics.maxFullLoadCapacity, 1)} ${flowUnit}` : '—'),
      row('Min. Full Load (stonewall) Pressure', c => c.nameplateData.compressorType === 6 ? `${formatNumber(c.centrifugalSpecifics.minFullLoadPressure, 1)} ${pressureUnit}` : '—'),
      row('Capacity at Min. Full Load Pressure', c => c.nameplateData.compressorType === 6 ? `${formatNumber(c.centrifugalSpecifics.minFullLoadCapacity, 1)} acfm` : '—'),
    ];

    const performancePointRows = (point: 'fullLoad' | 'maxFullFlow' | 'unloadPoint' | 'blowoff' | 'noLoad', checkFn?: (c: CompressorInventoryItem) => boolean): string[][] => [
      row('Discharge Pressure', c => (!checkFn || checkFn(c)) ? `${formatNumber(c.performancePoints[point].dischargePressure, 1)} ${pressureUnit}` : '—'),
      row('Airflow', c => (!checkFn || checkFn(c)) ? `${formatNumber(c.performancePoints[point].airflow, 1)} ${flowUnit}` : '—'),
      row('Power', c => (!checkFn || checkFn(c)) ? `${formatNumber(c.performancePoints[point].power, 1)} kW` : '—'),
    ];

    const showMaxFullFlow = compressorInventoryItems.some(c => this.performancePointsFormService.checkShowMaxFlowPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType));
    const showUnloadPoint = compressorInventoryItems.some(c => this.performancePointsFormService.checkShowUnloadPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType));
    const showBlowoff = compressorInventoryItems.some(c => this.performancePointsFormService.checkShowBlowoffPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType));
    const showNoLoad = compressorInventoryItems.some(c => this.performancePointsFormService.checkShowNoLoadPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType));

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Nameplate Data', nameplateRows);
    addGroup('Controls', controlsRows);
    addGroup('Design Details', designRows);
    if (displayCentrifugal) addGroup('Centrifugal Specifics', centrifugalRows);
    addGroup('Full Load', performancePointRows('fullLoad'));
    if (showMaxFullFlow) addGroup('Max Full Flow', performancePointRows('maxFullFlow', c => this.performancePointsFormService.checkShowMaxFlowPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType)));
    if (showUnloadPoint) addGroup('Unload Point', performancePointRows('unloadPoint', c => this.performancePointsFormService.checkShowUnloadPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType)));
    if (showBlowoff) addGroup('Blowoff', performancePointRows('blowoff', c => this.performancePointsFormService.checkShowBlowoffPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType)));
    if (showNoLoad) addGroup('No Load', performancePointRows('noLoad', c => this.performancePointsFormService.checkShowNoLoadPerformancePoint(c.nameplateData.compressorType, c.compressorControls.controlType)));

    return {
      type: 'summary-table',
      title: 'Compressor Inventory Data',
      group: 'inputData',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore: true,
    };
  }

  private buildEndUseSection(compressedAirAssessment: CompressedAirAssessment, settings: Settings): SummaryTableSection | null {
    const endUses = compressedAirAssessment.endUseData?.endUses ?? [];
    if (endUses.length === 0) return null;

    const flowUnit = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const pressureUnit = settings.unitsOfMeasure === 'Imperial' ? 'psig' : 'barg';
    const headers = ['', 'Day Type', ...endUses.map(e => e.endUseName)];

    const findDayTypeUse = (endUse: EndUse, dayTypeId: string) => endUse.dayTypeEndUses?.find(u => u.dayTypeId === dayTypeId);

    const rows: string[][] = [
      ['Location', '', ...endUses.map(e => e.location ?? '—')],
      [`Required Pressure (${pressureUnit})`, '', ...endUses.map(e => e.requiredPressure != null ? formatNumber(e.requiredPressure, 1) : '—')],
    ];

    const dayTypeRow = (label: string, valueFn: (use: ReturnType<typeof findDayTypeUse>) => string): string[][] =>
      compressedAirAssessment.compressedAirDayTypes.map((dayType, i) => [
        i === 0 ? label : '', dayType.name,
        ...endUses.map(e => valueFn(findDayTypeUse(e, dayType.dayTypeId))),
      ]);

    rows.push(...dayTypeRow(`Average Airflow (${flowUnit})`, use => use?.averageAirflow != null ? formatNumber(use.averageAirflow, 1) : '—'));
    rows.push(...dayTypeRow(`Measured Pressure (${pressureUnit})`, use => use?.measuredPressure != null ? formatNumber(use.measuredPressure, 1) : '—'));
    rows.push(...dayTypeRow('Regulated', use => use?.regulated !== undefined ? (use.regulated ? 'Yes' : 'No') : '—'));

    return {
      type: 'summary-table',
      title: 'End Use Data',
      group: 'inputData',
      headers,
      rows,
      pageBreakBefore: true,
    };
  }
}
