import examplesData from '../../../assets/example-data/ExamplesData.json';
import { UntypedFormBuilder } from '@angular/forms';
import { Assessment } from '../../shared/models/assessment';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UpdateDataService } from '../../shared/helper-services/update-data.service';
import { ElectronService } from '../../electron/electron.service';
import { CompressedAirSuiteApiService } from '../../tools-suite-api/compressed-air-suite-api.service';
import { SuiteApiHelperService } from '../../tools-suite-api/suite-api-helper.service';
import { ToolsSuiteApiService } from '../../tools-suite-api/tools-suite-api.service';
import { ConvertCompressedAirService } from '../convert-compressed-air.service';
import { CompressedAirCalculationService } from '../compressed-air-calculation.service';
import { InventoryFormService } from '../baseline-tab-content/inventory-setup/inventory/inventory-form.service';
import { PerformancePointsFormService } from '../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { CompressedAirAssessmentBaselineResults } from './CompressedAirAssessmentBaselineResults';
import { CompressedAirAssessmentModificationResults } from './modifications/CompressedAirAssessmentModificationResults';
import { type CompressorProfileCompressor, type CompressorProfileOptions, type CompressorProfileRow } from 'measur-tools-suite';

describe('compressed air example calculation classes', () => {
  let convertUnitsService: ConvertUnitsService;
  let convertCompressedAirService: ConvertCompressedAirService;
  let compressedAirCalculationService: CompressedAirCalculationService;
  let compressedAirSuiteApiService: CompressedAirSuiteApiService;
  let assessmentCo2SavingsService: AssessmentCo2SavingsService;
  let updateDataService: UpdateDataService;

  beforeAll(async () => {
    let toolsSuiteApiService: ToolsSuiteApiService = new ToolsSuiteApiService(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { isElectron: false } as ElectronService
    );
    await toolsSuiteApiService.initializeModule();

    convertUnitsService = new ConvertUnitsService();
    convertCompressedAirService = new ConvertCompressedAirService(convertUnitsService);
    updateDataService = new UpdateDataService(convertUnitsService);

    let formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
    let performancePointsFormService: PerformancePointsFormService = new PerformancePointsFormService(formBuilder);
    let inventoryFormService: InventoryFormService = new InventoryFormService(formBuilder, performancePointsFormService);
    let suiteApiHelperService: SuiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    compressedAirSuiteApiService = new CompressedAirSuiteApiService(suiteApiHelperService, toolsSuiteApiService);

    compressedAirCalculationService = new CompressedAirCalculationService(
      convertUnitsService,
      convertCompressedAirService,
      compressedAirSuiteApiService,
      inventoryFormService
    );
    assessmentCo2SavingsService = new AssessmentCo2SavingsService(convertUnitsService, formBuilder);
  });

  it('runs the example assessment baseline calculations without error', () => {
    let { compressedAirAssessment, settings } = getExampleAssessment();
    let baselineResults: CompressedAirAssessmentBaselineResults;

    expect(() => {
      baselineResults = new CompressedAirAssessmentBaselineResults(
        compressedAirAssessment,
        settings,
        compressedAirCalculationService,
        assessmentCo2SavingsService
      );
    }).not.toThrow();

    expect(baselineResults.baselineDayTypeProfileSummaries.length).toEqual(compressedAirAssessment.compressedAirDayTypes.length);
    expectFiniteResult(baselineResults.baselineResults.total.energyUse);
    expectFiniteResult(baselineResults.baselineResults.total.cost);
    expectFiniteResult(baselineResults.baselineResults.total.averageAirFlow);
    expectFiniteResult(baselineResults.baselineResults.total.peakDemand);
    expectFiniteTotals(baselineResults.baselineDayTypeProfileSummaries.flatMap(summary => summary.profileSummaryTotals));

    let compressorSummaries = baselineResults.getCompressorSummaries(settings);
    expect(compressorSummaries.length).toEqual(compressedAirAssessment.compressedAirDayTypes.length);
    compressorSummaries.flat().forEach(summary => {
      expectFiniteResult(summary.specificPowerAvgLoad);
      expectFiniteResult(summary.ratedSpecificPower);
      expectFiniteResult(summary.ratedIsentropicEfficiency);
    });
  });

  it('runs baseline calculations after changing the setup profile data interval to 24hr', () => {
    let { compressedAirAssessment, settings } = getExampleAssessment();
    compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval = 24;
    compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours = 24;
    compressedAirAssessment.systemProfile.profileSummary = getBlankProfileSummary(compressedAirAssessment, 24);
    let baselineResults: CompressedAirAssessmentBaselineResults;

    expect(() => {
      baselineResults = new CompressedAirAssessmentBaselineResults(
        compressedAirAssessment,
        settings,
        compressedAirCalculationService,
        assessmentCo2SavingsService
      );
    }).not.toThrow();

    expect(baselineResults.baselineDayTypeProfileSummaries.length).toEqual(compressedAirAssessment.compressedAirDayTypes.length);
    expectFiniteResult(baselineResults.baselineResults.total.energyUse);
    expectFiniteTotals(baselineResults.baselineDayTypeProfileSummaries.flatMap(summary => summary.profileSummaryTotals));
  });

  it('calculates a single-compressor 24hr measured-power baseline profile row', () => {
    let { compressedAirAssessment, settings } = getSingleCompressorTwentyFourHourAssessment();

    let baselineResults = new CompressedAirAssessmentBaselineResults(
      compressedAirAssessment,
      settings,
      compressedAirCalculationService,
      assessmentCo2SavingsService
    );
    let profileData = baselineResults.baselineDayTypeProfileSummaries[0].profileSummary[0].profileSummaryData[0];

    expect(profileData.power).toBeCloseTo(5, 3);
    expect(profileData.airflow).toBeCloseTo(18, 3);
    expect(profileData.percentCapacity).toBeCloseTo(100, 3);
    expect(profileData.percentPower).toBeCloseTo(108.7, 1);
  });

  it('calculates the logged suite measured-power baseline payload at full-load capacity', () => {
    let suiteRows: Array<CompressorProfileRow> = compressedAirSuiteApiService.calculateBaselineProfile(
      [getLoggedSuiteCompressor()],
      [getLoggedSuiteProfileRow()],
      getLoggedSuiteProfileOptions()
    );

    expect(suiteRows.length).toEqual(1);
    expect(suiteRows[0].powerKw).toBeCloseTo(5, 3);
    expect(suiteRows[0].airflowAcfm).toBeCloseTo(18, 3);
    expect(suiteRows[0].powerFraction).toBeCloseTo(1.0869565217, 4);
    expect(suiteRows[0].airflowFraction).toBeCloseTo(1, 3);
    expect(suiteRows[0].systemPowerFraction).toBeCloseTo(1.0869565217, 4);
    expect(suiteRows[0].systemAirflowFraction).toBeCloseTo(1, 3);
  });

  it('calculates the two-compressor 24hr measured-power baseline profile through the suite wrapper', () => {
    let suiteRows: Array<CompressorProfileRow> = compressedAirSuiteApiService.calculateBaselineProfile(
      [getLoggedSuiteCompressor(), getLoggedLoadUnloadSuiteCompressor()],
      [getLoggedSuiteProfileRow('srocxit1z', 2, 0.5), getLoggedSuiteProfileRow('8sxdv5qti', 1, 0)],
      getLoggedSuiteProfileOptions()
    );
    let modulationRow = suiteRows.find(row => row.compressorId == 'srocxit1z');
    let loadUnloadRow = suiteRows.find(row => row.compressorId == '8sxdv5qti');

    expect(suiteRows.length).toEqual(2);
    expect(modulationRow.airflowAcfm).toBeCloseTo(18, 3);
    expect(modulationRow.airflowFraction).toBeCloseTo(1, 3);
    expect(modulationRow.systemAirflowFraction).toBeCloseTo(0.6, 3);
    expect(modulationRow.systemPowerFraction).toBeCloseTo(0.5434782609, 4);

    expect(loadUnloadRow.powerKw).toBeCloseTo(5, 3);
    expect(loadUnloadRow.airflowAcfm).toBeCloseTo(13.99, 2);
    expect(loadUnloadRow.airflowFraction).toBeCloseTo(1.1656, 3);
    expect(loadUnloadRow.systemAirflowFraction).toBeCloseTo(13.99 / 30, 3);
    expect(loadUnloadRow.systemPowerFraction).toBeCloseTo(0.5434782609, 4);
  });

  it('calculates the two-compressor 24hr measured-power baseline profile through desktop calculation classes', () => {
    let { compressedAirAssessment, settings } = getTwoCompressorTwentyFourHourAssessment();

    let baselineResults = new CompressedAirAssessmentBaselineResults(
      compressedAirAssessment,
      settings,
      compressedAirCalculationService,
      assessmentCo2SavingsService
    );
    let profileSummary = baselineResults.baselineDayTypeProfileSummaries[0].profileSummary;
    let modulationData = profileSummary.find(summary => summary.compressorId == 'srocxit1z').profileSummaryData[0];
    let loadUnloadData = profileSummary.find(summary => summary.compressorId == '8sxdv5qti').profileSummaryData[0];

    expect(modulationData.power).toBeCloseTo(5, 3);
    expect(modulationData.airflow).toBeCloseTo(18, 3);
    expect(modulationData.percentCapacity).toBeCloseTo(100, 3);
    expect(modulationData.percentSystemCapacity).toBeCloseTo(60, 3);
    expect(modulationData.percentSystemPower).toBeCloseTo(54.34782609, 3);
    expect(modulationData.order).toEqual(2);

    expect(loadUnloadData.power).toBeCloseTo(5, 3);
    expect(loadUnloadData.airflow).toBeCloseTo(13.99, 2);
    expect(loadUnloadData.percentCapacity).toBeCloseTo(116.56, 2);
    expect(loadUnloadData.percentSystemCapacity).toBeCloseTo(46.62, 2);
    expect(loadUnloadData.percentSystemPower).toBeCloseTo(54.34782609, 3);
    expect(loadUnloadData.order).toEqual(1);
  });

  it('runs each example assessment modification calculation without error', () => {
    let { compressedAirAssessment, settings } = getExampleAssessment();
    let baselineResults = new CompressedAirAssessmentBaselineResults(
      compressedAirAssessment,
      settings,
      compressedAirCalculationService,
      assessmentCo2SavingsService
    );

    compressedAirAssessment.modifications.forEach((modification: Modification) => {
      let modificationResults: CompressedAirAssessmentModificationResults;

      expect(() => {
        modificationResults = new CompressedAirAssessmentModificationResults(
          compressedAirAssessment,
          modification,
          settings,
          compressedAirCalculationService,
          assessmentCo2SavingsService,
          baselineResults
        );
      }).not.toThrow();

      let results = modificationResults.getModificationResults();
      expect(results.dayTypeModificationResults.length).toEqual(compressedAirAssessment.compressedAirDayTypes.length);
      expectFiniteResult(results.totalBaselinePower);
      expectFiniteResult(results.totalModificationPower);
      expectFiniteResult(results.totalPowerSavings);
      expectFiniteTotals(results.dayTypeModificationResults.flatMap(result => result.profileSummaryTotals));

      let compressorSummaries = modificationResults.getCompressorSummaries(settings);
      expect(compressorSummaries.length).toEqual(compressedAirAssessment.compressedAirDayTypes.length);
    });
  });

  it('runs the example assessment after metric conversion without error', () => {
    let { compressedAirAssessment, settings } = getExampleAssessment();
    let metricSettings: Settings = {
      ...settings,
      unitsOfMeasure: 'Metric'
    };
    let metricAssessment: CompressedAirAssessment = convertCompressedAirService.convertCompressedAir(
      compressedAirAssessment,
      settings,
      metricSettings
    );
    let baselineResults: CompressedAirAssessmentBaselineResults;

    expect(() => {
      baselineResults = new CompressedAirAssessmentBaselineResults(
        metricAssessment,
        metricSettings,
        compressedAirCalculationService,
        assessmentCo2SavingsService
      );
    }).not.toThrow();

    expect(baselineResults.baselineDayTypeProfileSummaries.length).toEqual(metricAssessment.compressedAirDayTypes.length);
    expectFiniteResult(baselineResults.baselineResults.total.energyUse);
    expectFiniteResult(baselineResults.baselineResults.total.averageAirFlow);
    expectFiniteTotals(baselineResults.baselineDayTypeProfileSummaries.flatMap(summary => summary.profileSummaryTotals));
  });

  function getExampleAssessment(): { compressedAirAssessment: CompressedAirAssessment, settings: Settings } {
    let importAssessment = (examplesData as any).assessments.find(item => item.assessment?.type == 'CompressedAir');
    let assessment: Assessment = deepCopy(importAssessment.assessment);
    let settings: Settings = deepCopy(importAssessment.settings);

    assessment = updateDataService.updateCompressedAir(assessment);
    assessment.compressedAirAssessment.replacementCompressorInventoryItems =
      assessment.compressedAirAssessment.replacementCompressorInventoryItems || [];

    return {
      compressedAirAssessment: assessment.compressedAirAssessment,
      settings: settings
    };
  }

  function getSingleCompressorTwentyFourHourAssessment(): { compressedAirAssessment: CompressedAirAssessment, settings: Settings } {
    let compressedAirAssessment: CompressedAirAssessment = {
      name: 'Baseline',
      modifications: [],
      setupDone: true,
      systemBasics: {
        utilityType: 'Electricity',
        electricityCost: 0.066,
        demandCost: 5,
        notes: ''
      },
      systemInformation: {
        systemElevation: null,
        totalAirStorage: 1500,
        isSequencerUsed: false,
        targetPressure: null,
        variance: null,
        atmosphericPressure: 14.7,
        atmosphericPressureKnown: true,
        plantMaxPressure: null,
        multiCompressorSystemControls: 'cascading',
        trimSelections: [{ dayTypeId: 'cbpa0zvju', compressorId: undefined }]
      },
      replacementCompressorInventoryItems: [],
      compressorInventoryItems: [getSingleCompressor()],
      systemProfile: {
        systemProfileSetup: {
          dayTypeId: 'cbpa0zvju',
          numberOfHours: 24,
          dataInterval: 24,
          profileDataType: 'power'
        },
        profileSummary: [{
          compressorId: 'srocxit1z',
          dayTypeId: 'cbpa0zvju',
          profileSummaryData: [{
            power: 5,
            airflow: undefined,
            percentCapacity: 50,
            timeInterval: 0,
            percentPower: undefined,
            percentSystemCapacity: 0,
            percentSystemPower: 0,
            order: 1,
            powerFactor: 0,
            amps: 0,
            volts: 0
          }],
          fullLoadPressure: 100,
          fullLoadCapacity: 18
        }]
      },
      endUseData: {
        endUseDayTypeSetup: {
          selectedDayTypeId: undefined,
          dayTypeLeakRates: []
        },
        dayTypeAirFlowTotals: undefined,
        endUses: []
      },
      compressedAirDayTypes: [{
        dayTypeId: 'cbpa0zvju',
        name: 'Standard Day Type',
        numberOfDays: 365,
        profileDataType: 'power'
      }]
    };

    return {
      compressedAirAssessment: compressedAirAssessment,
      settings: {
        unitsOfMeasure: 'Imperial',
        emissionsUnit: 'Metric'
      }
    };
  }

  function getTwoCompressorTwentyFourHourAssessment(): { compressedAirAssessment: CompressedAirAssessment, settings: Settings } {
    let singleCompressorAssessment = getSingleCompressorTwentyFourHourAssessment();
    let compressedAirAssessment: CompressedAirAssessment = singleCompressorAssessment.compressedAirAssessment;
    compressedAirAssessment.compressorInventoryItems = [getSingleCompressor(), getLoadUnloadCompressor()];
    compressedAirAssessment.systemProfile.profileSummary = [
      {
        compressorId: 'srocxit1z',
        dayTypeId: 'cbpa0zvju',
        profileSummaryData: [{
          power: 5,
          airflow: undefined,
          percentCapacity: 50,
          timeInterval: 0,
          percentPower: undefined,
          percentSystemCapacity: 0,
          percentSystemPower: 0,
          order: 2,
          powerFactor: 0,
          amps: 0,
          volts: 0
        }],
        fullLoadPressure: 100,
        fullLoadCapacity: 18
      },
      {
        compressorId: '8sxdv5qti',
        dayTypeId: 'cbpa0zvju',
        profileSummaryData: [{
          power: 5,
          airflow: 0,
          percentCapacity: 0,
          timeInterval: 0,
          percentPower: undefined,
          percentSystemCapacity: undefined,
          percentSystemPower: undefined,
          order: 1,
          powerFactor: undefined,
          amps: undefined,
          volts: undefined
        }],
        fullLoadPressure: 175,
        fullLoadCapacity: undefined
      }
    ];

    return singleCompressorAssessment;
  }

  function getSingleCompressor(): CompressorInventoryItem {
    return {
      itemId: 'srocxit1z',
      name: 'New Compressor',
      description: '',
      color: '#16A085',
      nameplateData: {
        compressorType: 1,
        motorPower: 5,
        fullLoadOperatingPressure: 100,
        fullLoadRatedCapacity: 18,
        ratedLoadPower: 0,
        ploytropicCompressorExponent: 1.4,
        fullLoadAmps: 7.5,
        totalPackageInputPower: 4.6
      },
      compressorControls: {
        controlType: 1,
        unloadPointCapacity: 50,
        numberOfUnloadSteps: 2,
        automaticShutdown: false,
        unloadSumpPressure: 15
      },
      designDetails: {
        blowdownTime: 40,
        modulatingPressureRange: 5,
        inputPressure: 14.5,
        designEfficiency: 85,
        serviceFactor: 1.15,
        noLoadPowerFM: 65,
        noLoadPowerUL: 50,
        maxFullFlowPressure: 110
      },
      performancePoints: {
        fullLoad: getPoint(100, 18, 4.6),
        maxFullFlow: getPoint(110, 18, 4.6),
        midTurndown: getPoint(0, 0, 0),
        turndown: getPoint(0, 0, 0),
        unloadPoint: getPoint(0, 0, 0),
        noLoad: getPoint(105, 0, 3),
        blowoff: getPoint(0, 0, 0)
      },
      centrifugalSpecifics: {
        surgeAirflow: null,
        maxFullLoadPressure: null,
        maxFullLoadCapacity: null,
        minFullLoadPressure: null,
        minFullLoadCapacity: null
      },
      modifiedDate: new Date('2026-06-23T19:39:08.479Z')
    };
  }

  function getLoggedSuiteCompressor(): CompressorProfileCompressor {
    return {
      compressorId: 'srocxit1z',
      compressorType: 1,
      control: 3,
      stage: 0,
      lubricant: 0,
      automaticShutdown: false,
      performancePoints: {
        fullLoad: getLoggedSuitePoint(100, 18, 4.6),
        maxFullFlow: getLoggedSuitePoint(110, 18, 4.6),
        midTurndown: getLoggedSuitePoint(0, 0, 0),
        turndown: getLoggedSuitePoint(0, 0, 0),
        unloadPoint: getLoggedSuitePoint(0, 0, 0),
        noLoad: getLoggedSuitePoint(105, 0, 3),
        blowoff: getLoggedSuitePoint(0, 0, 0)
      },
      blowdownTimeSec: 40,
      unloadSumpPressurePsig: 15,
      noLoadPowerFractionForModulation: 0.65,
      modulatingPressurePsig: 5
    };
  }

  function getLoadUnloadCompressor(): CompressorInventoryItem {
    return {
      itemId: '8sxdv5qti',
      name: 'Compressor 2',
      description: '',
      color: '#A04000',
      nameplateData: {
        compressorType: 1,
        motorPower: 5,
        fullLoadOperatingPressure: 175,
        fullLoadRatedCapacity: 12,
        ratedLoadPower: 0,
        ploytropicCompressorExponent: 1.4,
        fullLoadAmps: 7.5,
        totalPackageInputPower: 4.6
      },
      compressorControls: {
        controlType: 4,
        unloadPointCapacity: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false,
        unloadSumpPressure: 15
      },
      designDetails: {
        blowdownTime: 40,
        modulatingPressureRange: null,
        inputPressure: 14.5,
        designEfficiency: 85,
        serviceFactor: 1.15,
        noLoadPowerFM: null,
        noLoadPowerUL: 36,
        maxFullFlowPressure: 185
      },
      performancePoints: {
        fullLoad: getPoint(175, 12, 4.6),
        maxFullFlow: getPoint(185, 12, 4.7),
        midTurndown: getPoint(0, 0, 0),
        turndown: getPoint(0, 0, 0),
        unloadPoint: getPoint(0, 0, 0),
        noLoad: getPoint(15, 0, 1.7),
        blowoff: getPoint(0, 0, 0)
      },
      centrifugalSpecifics: {
        surgeAirflow: null,
        maxFullLoadPressure: null,
        maxFullLoadCapacity: null,
        minFullLoadPressure: null,
        minFullLoadCapacity: null
      },
      modifiedDate: new Date('2026-06-24T01:24:15.231Z')
    };
  }

  function getLoggedLoadUnloadSuiteCompressor(): CompressorProfileCompressor {
    return {
      compressorId: '8sxdv5qti',
      compressorType: 1,
      control: 0,
      stage: 0,
      lubricant: 0,
      automaticShutdown: false,
      performancePoints: {
        fullLoad: getLoggedSuitePoint(175, 12, 4.6),
        maxFullFlow: getLoggedSuitePoint(185, 12, 4.7),
        midTurndown: getLoggedSuitePoint(0, 0, 0),
        turndown: getLoggedSuitePoint(0, 0, 0),
        unloadPoint: getLoggedSuitePoint(0, 0, 0),
        noLoad: getLoggedSuitePoint(15, 0, 1.7),
        blowoff: getLoggedSuitePoint(0, 0, 0)
      },
      blowdownTimeSec: 40,
      unloadSumpPressurePsig: 15,
      noLoadPowerFractionForModulation: 0,
      modulatingPressurePsig: 0
    };
  }

  function getLoggedSuiteProfileRow(compressorId: string = 'srocxit1z', operatingOrder: number = 1, airflowFraction: number = 0.5): CompressorProfileRow {
    return {
      compressorId: compressorId,
      dayTypeId: 'cbpa0zvju',
      timeIntervalHr: 0,
      operatingOrder: operatingOrder,
      powerKw: 5,
      airflowAcfm: 0,
      powerFraction: 0,
      airflowFraction: airflowFraction,
      systemPowerFraction: 0,
      systemAirflowFraction: 0,
      powerFactor: 0,
      amps: 0,
      volts: 0
    };
  }

  function getLoggedSuiteProfileOptions(): CompressorProfileOptions {
    return {
      dayTypeId: 'cbpa0zvju',
      inputBasis: 2,
      controlMode: 0,
      atmosphericPressurePsia: 14.7,
      totalAirStorageFt3: 200.52093668342548,
      additionalReceiverVolumeFt3: 0,
      canShutdown: true
    };
  }

  function getLoggedSuitePoint(dischargePressurePsig: number, airflowAcfm: number, powerKw: number) {
    return {
      dischargePressurePsig: dischargePressurePsig,
      isDefaultPressure: true,
      airflowAcfm: airflowAcfm,
      isDefaultAirflow: true,
      powerKw: powerKw,
      isDefaultPower: true
    };
  }

  function getPoint(dischargePressure: number, airflow: number, power: number) {
    return {
      dischargePressure: dischargePressure,
      isDefaultPressure: true,
      airflow: airflow,
      isDefaultAirFlow: true,
      power: power,
      isDefaultPower: true
    };
  }

  function expectFiniteTotals(totals: Array<ProfileSummaryTotal>) {
    expect(totals.length).toBeGreaterThan(0);
    totals.forEach(total => {
      expectFiniteResult(total.airflow);
      expectFiniteResult(total.power);
      expectFiniteResult(total.totalPower);
      expectFiniteResult(total.percentCapacity);
      expectFiniteResult(total.percentPower);
    });
  }

  function expectFiniteResult(value: number) {
    expect(Number.isFinite(value)).toBeTrue();
  }

  function getBlankProfileSummary(compressedAirAssessment: CompressedAirAssessment, dataInterval: number): Array<ProfileSummary> {
    let profileSummary: Array<ProfileSummary> = [];
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      compressedAirAssessment.compressorInventoryItems.forEach((compressor: CompressorInventoryItem) => {
        profileSummary.push({
          compressorId: compressor.itemId,
          dayTypeId: dayType.dayTypeId,
          profileSummaryData: getBlankProfileSummaryData(24, dataInterval),
          fullLoadPressure: compressor.performancePoints.fullLoad.dischargePressure,
          fullLoadCapacity: compressor.performancePoints.fullLoad.airflow
        });
      });
    });
    return profileSummary;
  }

  function getBlankProfileSummaryData(numberOfHours: number, dataInterval: number): Array<ProfileSummaryData> {
    let profileSummaryData: Array<ProfileSummaryData> = [];
    for (let timeInterval = 0; timeInterval < numberOfHours;) {
      profileSummaryData.push({
        power: undefined,
        airflow: undefined,
        percentCapacity: undefined,
        timeInterval: timeInterval,
        percentPower: undefined,
        percentSystemCapacity: 0,
        percentSystemPower: 0,
        order: 0,
        powerFactor: 0,
        amps: 0,
        volts: 0
      });
      timeInterval = timeInterval + dataInterval;
    }
    return profileSummaryData;
  }

  function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
});
