import { ElectronService } from '../electron/electron.service';
import { CompressedAirSuiteApiService } from './compressed-air-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

describe('CompressedAirSuiteApiService assessment wrappers', () => {
  let compressedAirSuiteApiService: CompressedAirSuiteApiService;
  let suiteApiHelperService: SuiteApiHelperService;

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
    suiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    compressedAirSuiteApiService = new CompressedAirSuiteApiService(suiteApiHelperService, toolsSuiteApiService);
  });

  it('generates suite-backed compressor performance points', () => {
    let points = compressedAirSuiteApiService.generatePerformancePoints(screwModulationWithUnloadInput());

    expect(points.fullLoad.dischargePressurePsig).toBeCloseTo(100, 3);
    expect(points.fullLoad.airflowAcfm).toBeCloseTo(1048, 3);
    expect(points.fullLoad.powerKw).toBeCloseTo(166.5, 3);
    expect(points.maxFullFlow.dischargePressurePsig).toBeCloseTo(110, 3);
    expect(points.maxFullFlow.airflowAcfm).toBeCloseTo(1040, 3);
    expect(points.maxFullFlow.powerKw).toBeCloseTo(175.6, 3);
    expect(points.unloadPoint.airflowAcfm).toBeCloseTo(943, 3);
    expect(points.unloadPoint.dischargePressurePsig).toBeCloseTo(110.5, 3);
    expect(points.unloadPoint.powerKw).toBeCloseTo(170.3, 3);
    expect(points.noLoad.dischargePressurePsig).toBeCloseTo(15, 3);
    expect(points.noLoad.airflowAcfm).toBeCloseTo(0, 3);
    expect(points.noLoad.powerKw).toBeCloseTo(41.6, 3);
  });

  it('generates VFD default turndown points', () => {
    let points = compressedAirSuiteApiService.generatePerformancePoints(vfdInput());

    expect(points.midTurndown.airflowAcfm).toBeCloseTo(605, 3);
    expect(points.midTurndown.dischargePressurePsig).toBeCloseTo(102.4, 3);
    expect(points.midTurndown.powerKw).toBeCloseTo(115, 3);
    expect(points.turndown.airflowAcfm).toBeCloseTo(202, 3);
    expect(points.turndown.dischargePressurePsig).toBeCloseTo(104.8, 3);
    expect(points.turndown.powerKw).toBeCloseTo(55.8, 3);
  });

  it('calculates baseline profile rows and totals', () => {
    let compressors = [modulationCompressor('a', 1000, 100, 50)];
    let rows = [profileRow('a', 1, { airflowAcfm: 500 })];

    let result = compressedAirSuiteApiService.calculateBaselineProfile(compressors, rows, profileOptions(0));

    expect(result.length).toEqual(1);
    expect(result[0].airflowAcfm).toBeCloseTo(500, 3);
    expect(result[0].powerKw).toBeCloseTo(75, 3);
    expect(result[0].airflowFraction).toBeCloseTo(0.5, 4);
    expect(result[0].powerFraction).toBeCloseTo(0.75, 4);

    let totals = compressedAirSuiteApiService.calculateProfileTotals(compressors, result, 1);
    expect(totals.length).toEqual(1);
    expect(totals[0].airflowAcfm).toBeCloseTo(500, 3);
    expect(totals[0].powerKw).toBeCloseTo(75, 3);
  });

  it('reallocates load-sharing flow and calculates profile savings', () => {
    let compressors = [
      modulationCompressor('a', 1000, 100, 50),
      modulationCompressor('b', 500, 60, 30)
    ];
    let rows = [
      profileRow('a', 1),
      profileRow('b', 2)
    ];
    let demandRows = [{
      dayTypeId: 'weekday',
      timeIntervalHr: 0,
      airflowAcfm: 750,
      powerKw: 0,
      totalPowerKw: 0,
      airflowFraction: 0,
      powerFraction: 0,
      auxiliaryPowerKw: 0
    }];

    let result = compressedAirSuiteApiService.reallocateProfileFlow(
      compressors,
      rows,
      demandRows,
      profileOptions(2),
      [],
      []
    );

    let compressorA = result.find(row => row.compressorId == 'a');
    let compressorB = result.find(row => row.compressorId == 'b');
    expect(compressorA.airflowAcfm).toBeCloseTo(750, 3);
    expect(compressorA.powerKw).toBeCloseTo(87.5, 3);
    expect(compressorB.operatingOrder).toEqual(0);

    let savings = compressedAirSuiteApiService.calculateProfileSavings(
      [
        profileRow('a', 1, { powerKw: 100 }),
        profileRow('b', 2, { powerKw: 42 })
      ],
      [
        profileRow('a', 1, { powerKw: 87.5 }),
        profileRow('b', 0, { powerKw: 0 })
      ],
      {
        dayTypeId: 'weekday',
        electricityCostPerKwh: 0.1,
        intervalHours: 1,
        operatingDays: 10,
        auxiliaryEnergyKwh: 0,
        implementationCost: 100,
        salvageValue: 0
      }
    );

    expect(savings.baselineEnergyKwh).toBeCloseTo(1420, 3);
    expect(savings.adjustedEnergyKwh).toBeCloseTo(875, 3);
    expect(savings.energySavingsKwh).toBeCloseTo(545, 3);
    expect(savings.costSavings).toBeCloseTo(54.5, 3);
    expect(savings.paybackMonths).toBeCloseTo(22.0183, 4);
  });
});

function defaultPoint() {
  return {
    dischargePressurePsig: 0,
    isDefaultPressure: true,
    airflowAcfm: 0,
    isDefaultAirflow: true,
    powerKw: 0,
    isDefaultPower: true
  };
}

function point(dischargePressurePsig: number, airflowAcfm: number, powerKw: number) {
  return {
    dischargePressurePsig: dischargePressurePsig,
    isDefaultPressure: false,
    airflowAcfm: airflowAcfm,
    isDefaultAirflow: false,
    powerKw: powerKw,
    isDefaultPower: false
  };
}

function screwModulationWithUnloadInput() {
  return {
    nameplate: {
      compressorType: 1,
      stage: 0,
      lubricant: 0,
      motorPowerHp: 0,
      fullLoadOperatingPressurePsig: 100,
      fullLoadRatedCapacityAcfm: 1048,
      ratedLoadPowerKw: 0,
      polytropicCompressorExponent: 1.4,
      fullLoadAmps: 0,
      totalPackageInputPowerKw: 166.5
    },
    controls: {
      control: 1,
      unloadPointCapacityPct: 90,
      numberOfUnloadSteps: 0,
      automaticShutdown: false,
      unloadSumpPressurePsig: 15
    },
    design: {
      blowdownTimeSec: 0.003,
      modulatingPressurePsig: 5,
      inputPressurePsia: 14.5,
      designEfficiencyPct: 75,
      serviceFactor: 1,
      noLoadPowerFMPercent: 70,
      noLoadPowerULPercent: 25,
      maxFullFlowPressurePsig: 110
    },
    centrifugal: {
      surgeAirflowAcfm: 0,
      maxFullLoadPressurePsig: 0,
      maxFullLoadCapacityAcfm: 0,
      minFullLoadPressurePsig: 0,
      minFullLoadCapacityAcfm: 0
    },
    points: {
      fullLoad: defaultPoint(),
      maxFullFlow: defaultPoint(),
      midTurndown: defaultPoint(),
      turndown: defaultPoint(),
      unloadPoint: defaultPoint(),
      noLoad: defaultPoint(),
      blowoff: defaultPoint()
    },
    atmosphericPressurePsia: 14.7
  };
}

function vfdInput() {
  return {
    nameplate: {
      compressorType: 1,
      stage: 0,
      lubricant: 0,
      motorPowerHp: 0,
      fullLoadOperatingPressurePsig: 100,
      fullLoadRatedCapacityAcfm: 1009,
      ratedLoadPowerKw: 0,
      polytropicCompressorExponent: 1.4,
      fullLoadAmps: 0,
      totalPackageInputPowerKw: 174.4
    },
    controls: {
      control: 7,
      unloadPointCapacityPct: 20,
      numberOfUnloadSteps: 0,
      automaticShutdown: false,
      unloadSumpPressurePsig: 15
    },
    design: {
      blowdownTimeSec: 0.003,
      modulatingPressurePsig: 5,
      inputPressurePsia: 14.5,
      designEfficiencyPct: 75,
      serviceFactor: 1,
      noLoadPowerFMPercent: 70,
      noLoadPowerULPercent: 25,
      maxFullFlowPressurePsig: 0
    },
    centrifugal: {
      surgeAirflowAcfm: 0,
      maxFullLoadPressurePsig: 0,
      maxFullLoadCapacityAcfm: 0,
      minFullLoadPressurePsig: 0,
      minFullLoadCapacityAcfm: 0
    },
    points: {
      fullLoad: defaultPoint(),
      maxFullFlow: defaultPoint(),
      midTurndown: defaultPoint(),
      turndown: defaultPoint(),
      unloadPoint: defaultPoint(),
      noLoad: defaultPoint(),
      blowoff: defaultPoint()
    },
    atmosphericPressurePsia: 14.7
  };
}

function modulationCompressor(compressorId: string, airflowAcfm: number, fullPowerKw: number, noLoadPowerKw: number) {
  return {
    compressorId: compressorId,
    compressorType: 1,
    control: 3,
    stage: 0,
    lubricant: 0,
    automaticShutdown: false,
    performancePoints: {
      fullLoad: point(100, airflowAcfm, fullPowerKw),
      maxFullFlow: point(110, airflowAcfm, fullPowerKw),
      midTurndown: point(0, 0, 0),
      turndown: point(0, 0, 0),
      unloadPoint: point(0, 0, 0),
      noLoad: point(105, 0, noLoadPowerKw),
      blowoff: point(0, 0, 0)
    },
    blowdownTimeSec: 0.003,
    unloadSumpPressurePsig: 15,
    noLoadPowerFractionForModulation: 0.7,
    modulatingPressurePsig: 5
  };
}

function profileRow(compressorId: string, operatingOrder: number, overrides?: { airflowAcfm?: number, powerKw?: number }) {
  return {
    compressorId: compressorId,
    dayTypeId: 'weekday',
    timeIntervalHr: 0,
    operatingOrder: operatingOrder,
    powerKw: overrides?.powerKw || 0,
    airflowAcfm: overrides?.airflowAcfm || 0,
    powerFraction: 0,
    airflowFraction: 0,
    systemPowerFraction: 0,
    systemAirflowFraction: 0,
    powerFactor: 0,
    amps: 0,
    volts: 0
  };
}

function profileOptions(controlMode: number) {
  return {
    dayTypeId: 'weekday',
    inputBasis: 3,
    controlMode: controlMode,
    atmosphericPressurePsia: 14.7,
    totalAirStorageFt3: 140,
    additionalReceiverVolumeFt3: 0,
    canShutdown: true
  };
}
