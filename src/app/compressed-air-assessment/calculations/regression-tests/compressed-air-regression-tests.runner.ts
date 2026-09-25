/**
 * Browser-side integration runner for the compressed-air regression corpus.
 *
 * Its purpose is to exercise the production calculation split, not reproduce
 * any engineering formula in test code. The important call chain is:
 *
 *   assessment result classes
 *     -> CompressedAirCalculationService
 *       -> CompressedAirSuiteApiService
 *         -> measur-tools-suite JavaScript/WASM compressor classes
 *
 * The runner then captures Desktop's baseline, modification, savings, emissions,
 * and report-visible results as plain canonical JSON for comparison.
 */
import { UntypedFormBuilder } from '@angular/forms';
import packageJson from '../../../../../package.json';
import { ElectronService } from '../../../electron/electron.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { UpdateDataService } from '../../../shared/helper-services/update-data.service';
import { CompressedAirSuiteApiService } from '../../../tools-suite-api/compressed-air-suite-api.service';
import { SuiteApiHelperService } from '../../../tools-suite-api/suite-api-helper.service';
import { ToolsSuiteApiService } from '../../../tools-suite-api/tools-suite-api.service';
import { InventoryFormService } from '../../baseline-tab-content/inventory-setup/inventory/inventory-form.service';
import { PerformancePointsFormService } from '../../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { CompressedAirCalculationService } from '../../compressed-air-calculation.service';
import { ConvertCompressedAirService } from '../../convert-compressed-air.service';
import { formatNumber } from '../../../shared/report-builder/adapters/report-adapter.utils';
import { CompressedAirAssessmentBaselineResults } from '../CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from '../modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirCombinedDayTypeResults } from '../modifications/CompressedAirCombinedDayTypeResults';
import { CompressedAirRegressionTestFixture, createSyntheticFixtures } from './synthetic-fixtures';

export interface RegressionTestCorpus {
  schemaVersion: number;
  sourceAppVersion: string;
  fixtures: CompressedAirRegressionTestFixture[];
}

export interface RegressionTestSnapshot {
  schemaVersion: number;
  resultSchemaVersion: number;
  baselineName: string;
  desktopBaselineCommit: string;
  desktopApplicationVersion: string;
  suitePackageVersion: string;
  sourceMeasurVersion: string;
  scope: 'core' | 'full';
  fixtures: any[];
}

export class CompressedAirRegressionTestRunner {
  private calculationService: CompressedAirCalculationService;
  private co2SavingsService: AssessmentCo2SavingsService;
  private updateDataService: UpdateDataService;
  private convertCompressedAirService: ConvertCompressedAirService;

  async initialize(): Promise<void> {
    // Construct the same adapters used by the application, but omit IndexedDB
    // services that are not needed by compressed-air calculations. Passing
    // isElectron=false makes locateFile load the Karma-served client.wasm.
    const toolsSuiteApiService = new ToolsSuiteApiService(
      null, null, null, null, null, null, null, null,
      { isElectron: false } as ElectronService,
    );
    await toolsSuiteApiService.initializeModule();
    const convertUnitsService = new ConvertUnitsService();
    this.convertCompressedAirService = new ConvertCompressedAirService(convertUnitsService);
    this.updateDataService = new UpdateDataService(convertUnitsService);
    const formBuilder = new UntypedFormBuilder();
    const performancePointsFormService = new PerformancePointsFormService(formBuilder);
    const inventoryFormService = new InventoryFormService(formBuilder, performancePointsFormService);
    const suiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    const compressedAirSuiteApiService = new CompressedAirSuiteApiService(suiteApiHelperService, toolsSuiteApiService);
    // This service is the production boundary used by profile calculations.
    // Calls to compressorsCalc() made by the assessment result classes route
    // through compressedAirSuiteApiService into real Emscripten instances.
    this.calculationService = new CompressedAirCalculationService(
      convertUnitsService,
      this.convertCompressedAirService,
      compressedAirSuiteApiService,
      inventoryFormService,
    );
    this.co2SavingsService = new AssessmentCo2SavingsService(convertUnitsService, formBuilder);
  }

  run(
    corpus: RegressionTestCorpus,
    coreFixtureIds: string[],
    scope: 'core' | 'full',
    baselineName = 'pre-pr409-suite-1.2.5',
  ): RegressionTestSnapshot {
    // Synthetic fixtures are derived in memory on every run. They fill known
    // coverage gaps without placing invented assessments in the private corpus.
    const allFixtures = [
      ...corpus.fixtures,
      ...createSyntheticFixtures(corpus.fixtures, this.convertCompressedAirService),
    ];
    const fixtures = scope === 'core'
      ? allFixtures.filter(fixture => coreFixtureIds.includes(fixture.fixtureId))
      : allFixtures;

    return canonicalize({
      schemaVersion: 1,
      resultSchemaVersion: 1,
      baselineName,
      desktopBaselineCommit: '52f3b3bdb',
      desktopApplicationVersion: packageJson.version,
      suitePackageVersion: packageJson.dependencies['measur-tools-suite'],
      sourceMeasurVersion: corpus.sourceAppVersion,
      scope,
      fixtures: fixtures.map(fixture => this.calculateFixture(fixture)),
    }) as RegressionTestSnapshot;
  }

  private calculateFixture(fixture: CompressedAirRegressionTestFixture): any {
    let stage = 'data-migration';
    try {
      let assessment = clone(fixture.assessment);
      const settings = clone(fixture.settings);
      // Fixtures retain their source MEASUR shape. Migration verifies that an
      // older saved assessment still reaches the current calculation path.
      assessment = this.updateDataService.updateAssessmentVersion(assessment);
      assessment.compressedAirAssessment.replacementCompressorInventoryItems ??= [];
      const compressedAirAssessment = assessment.compressedAirAssessment;

      stage = 'baseline';
      // Constructing this production result object calculates every day type,
      // compressor, and interval. Those profile calculations call the Suite.
      const baseline = new CompressedAirAssessmentBaselineResults(
        compressedAirAssessment,
        settings,
        this.calculationService,
        this.co2SavingsService,
      );
      const baselineProjection = {
        results: baseline.baselineResults,
        compressorSummaries: baseline.getCompressorSummaries(settings),
        dayTypes: baseline.baselineDayTypeProfileSummaries.map(summary => ({
          dayType: summary.dayType,
          profileSummary: summary.profileSummary,
          profileSummaryTotals: summary.profileSummaryTotals,
          savings: summary.savingsItem,
          emissionsOutput: summary.emissionsOutput,
          result: summary.baselineResult,
          ratedTotals: {
            fullLoadCapacity: summary.totalFullLoadCapacity,
            fullLoadPower: summary.totalFullLoadPower,
          },
        })),
      };

      stage = 'modifications';
      // Run modifications in the application's stored order. This includes the
      // Desktop-owned EEM transformations around Suite compressor calculations.
      const modifications = compressedAirAssessment.modifications.map(modification => {
        const calculation = new CompressedAirAssessmentModificationResults(
          compressedAirAssessment,
          modification,
          settings,
          this.calculationService,
          this.co2SavingsService,
          baseline,
        );
        const combined = new CompressedAirCombinedDayTypeResults(calculation).getDayTypeModificationResult();
        const fullTotals = calculation.getModificationResults();
        const totals = {
          totalBaselineCost: fullTotals.totalBaselineCost,
          totalBaselinePower: fullTotals.totalBaselinePower,
          totalModificationCost: fullTotals.totalModificationCost,
          totalModificationPower: fullTotals.totalModificationPower,
          totalCostSavings: fullTotals.totalCostSavings,
          totalPowerSavings: fullTotals.totalPowerSavings,
        };
        return {
          modificationId: modification.modificationId,
          name: modification.name,
          totals,
          combined,
          compressorSummaries: calculation.getCompressorSummaries(settings),
          dayTypes: calculation.modifiedDayTypeProfileSummaries.map(summary => summary.getDayTypeModificationResult()),
        };
      });

      stage = 'display-projection';
      const output = { baseline: baselineProjection, modifications };
      stage = 'output-validation';
      const nonFinitePaths: string[] = [];
      // Canonicalization removes class identity/key-order noise while preserving
      // array order, missing values, and known non-finite results explicitly.
      const result = canonicalize({
        fixtureId: fixture.fixtureId,
        source: fixture.source,
        coverageTags: fixture.coverageTags,
        status: 'calculated',
        output,
        display: getDisplayProjection(output),
      }, '$', nonFinitePaths);
      if (nonFinitePaths.length > 0) {
        result.status = 'known-failure';
        result.failureStage = 'output-validation';
        result.errorClass = 'NonFiniteResultError';
        result.nonFinitePaths = nonFinitePaths;
      }
      return result;
    } catch (error) {
      return {
        fixtureId: fixture.fixtureId,
        source: fixture.source,
        coverageTags: fixture.coverageTags,
        status: 'known-failure',
        failureStage: stage,
        errorClass: error?.constructor?.name ?? 'Error',
      };
    }
  }
}

export function compareRegressionTestSnapshots(expected: any, actual: any, tolerance = 1e-6): string[] {
  // Used by ordinary Jasmine runs. Dedicated commands use the richer Node
  // comparator in fixture-tools.mjs so they can produce structured reports.
  const differences: string[] = [];
  compareValue(expected, actual, '$', differences, tolerance);
  return differences;
}

function compareValue(expected: any, actual: any, path: string, differences: string[], tolerance: number): void {
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (!Number.isFinite(expected) || !Number.isFinite(actual)) {
      differences.push(`${path}: non-finite value`);
      return;
    }
    if (Math.abs(actual - expected) > tolerance * Math.max(1, Math.abs(expected))) {
      differences.push(`${path}: numeric change`);
    }
    return;
  }
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual) || expected.length !== actual.length) {
      differences.push(`${path}: array structure change`);
      return;
    }
    expected.forEach((item, index) => compareValue(item, actual[index], `${path}[${index}]`, differences, tolerance));
    return;
  }
  const expectedObject = expected && typeof expected === 'object';
  const actualObject = actual && typeof actual === 'object';
  if (expectedObject || actualObject) {
    if (!expectedObject || !actualObject) {
      differences.push(`${path}: type change`);
      return;
    }
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual).sort();
    if (expectedKeys.join('\0') !== actualKeys.join('\0')) {
      differences.push(`${path}: field presence change`);
      return;
    }
    expectedKeys.forEach(key => compareValue(expected[key], actual[key], `${path}.${key}`, differences, tolerance));
    return;
  }
  if (!Object.is(expected, actual)) differences.push(`${path}: value change`);
}

function getDisplayProjection(output: any): any {
  const fmt = (value: number, digits: number) => value == null ? '—' : formatNumber(value, digits);
  return {
    baseline: {
      annualEnergy: fmt(output.baseline.results.total.energyUse, 0),
      energyCost: fmt(output.baseline.results.total.cost, 0),
      operatingCost: fmt(output.baseline.results.total.totalAnnualOperatingCost, 0),
      peakDemand: fmt(output.baseline.results.total.peakDemand, 2),
      peakAirflow: fmt(output.baseline.results.total.maxAirFlow, 2),
      emissions: fmt(output.baseline.results.total.annualEmissionOutput, 0),
    },
    modifications: output.modifications.map(modification => ({
      modificationId: modification.modificationId,
      annualEnergy: fmt(modification.combined.allSavingsResults.adjustedResults.power, 0),
      energySavings: fmt(modification.combined.allSavingsResults.savings.power, 0),
      costSavings: fmt(modification.combined.allSavingsResults.savings.cost, 0),
      percentSavings: `${fmt(modification.combined.allSavingsResults.savings.percentSavings, 0)} %`,
      paybackMonths: fmt(modification.combined.allSavingsResults.paybackPeriod, 2),
      peakDemand: fmt(modification.combined.peakDemand, 2),
      peakAirflow: fmt(modification.combined.maxAirFlow, 2),
    })),
  };
}

export function canonicalize(value: any, path = '$', knownNonFinitePaths?: string[]): any {
  if (value === undefined) return { $special: 'undefined' };
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      if (!knownNonFinitePaths) throw new Error(`Non-finite result at ${path}`);
      knownNonFinitePaths.push(path);
      return { $special: Number.isNaN(value) ? 'NaN' : value > 0 ? 'Infinity' : '-Infinity' };
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map((item, index) => canonicalize(item, `${path}[${index}]`, knownNonFinitePaths));
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonicalize(value[key], `${path}.${key}`, knownNonFinitePaths);
      return result;
    }, {});
  }
  return value;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
