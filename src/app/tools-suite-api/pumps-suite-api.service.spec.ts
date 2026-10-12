import { ElectronService } from '../electron/electron.service';
import { HeadToolResults } from '../shared/models/calculators';
import { PsatInputs, PsatOutputs } from '../shared/models/psat';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

const PUMP_HEAD_TOLERANCE_FT: number = 0.001;

describe('PumpsSuiteApiService pump wrappers', () => {
  let service: PumpsSuiteApiService;

  beforeAll(async () => {
    const toolsSuiteApiService: ToolsSuiteApiService = new ToolsSuiteApiService(
      null, null, null, null, null, null, null, null,
      { isElectron: false } as ElectronService,
    );
    await toolsSuiteApiService.initializeModule();
    const suiteApiHelperService: SuiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    service = new PumpsSuiteApiService(suiteApiHelperService, toolsSuiteApiService);
  });

  it('calculates pump head from suction-gauge measurements as a plain app result', () => {
    const results: HeadToolResults = service.headTool(
      1,
      2000,
      17.9,
      5,
      5,
      1,
      15,
      50,
      1,
      1,
    );

    expectHeadResults(results, {
      differentialElevationHead: -4,
      differentialPressureHead: 103.98613494168427,
      differentialVelocityHead: 0.10385896098722718,
      estimatedSuctionFrictionHead: 0.10103969289791588,
      estimatedDischargeFrictionHead: 0.20489865388514306,
      pumpHead: 100.39593224945455,
    });
  });

  it('calculates pump head from suction-tank measurements as a plain app result', () => {
    const results: HeadToolResults = service.headToolSuctionTank(
      1,
      2000,
      17.9,
      115,
      0,
      1,
      10,
      124,
      0,
      1,
    );

    expectHeadResults(results, {
      differentialElevationHead: 0,
      differentialPressureHead: 20.797226988336853,
      differentialVelocityHead: 1.0372994352935365,
      estimatedSuctionFrictionHead: 0.10103969289791588,
      estimatedDischargeFrictionHead: 1.0372994352935365,
      pumpHead: 22.972865551821844,
    });
  });

  it('calculates existing pump results through the stateless Suite API', () => {
    const results: PsatOutputs = service.resultsExisting(makePumpInputs());

    expect(results.pump_efficiency).toBeCloseTo(80.2620381, 6);
    expect(results.motor_shaft_power).toBeCloseTo(101.1874779125, 6);
    expect(results.mover_shaft_power).toBeCloseTo(101.1874779125, 6);
    expect(results.motor_power).toBeCloseTo(80, 6);
    expect(results.annual_energy).toBeCloseTo(700.8, 6);
    expect(results.annual_cost).toBeCloseTo(35040, 6);
    expect(results.annual_savings_potential).toBe(0);
    expect(results.optimization_rating).toBe(0);
    expect('delete' in results).toBeFalse();
  });

  it('calculates modified pump results through the stateless Suite API', () => {
    const results: PsatOutputs = service.resultsModified(makePumpInputs());

    expect(results.pump_efficiency).toBeCloseTo(80, 6);
    expect(results.motor_shaft_power).toBeCloseTo(101.5189151255, 6);
    expect(results.mover_shaft_power).toBeCloseTo(101.5189151255, 6);
    expect(results.motor_power).toBeCloseTo(80.2551564807, 6);
    expect(results.annual_energy).toBeCloseTo(703.0351707712, 6);
    expect(results.annual_cost).toBeCloseTo(35151.7585386, 6);
    expect(results.annual_savings_potential).toBe(0);
    expect(results.optimization_rating).toBe(0);
    expect('delete' in results).toBeFalse();
  });

  it('uses differential pressure for a modified positive-displacement pump', () => {
    const results: PsatOutputs = service.resultsModified(makePumpInputs({
      pump_style: 12,
      pump_specified: 80,
      flow_rate: 100,
      head: 999,
      differentialPressure: 50,
      motor_rated_power: 200,
      operating_hours: 2000,
    }));

    expect(results.mover_shaft_power).toBeCloseTo(3.6459500366, 6);
    expect(results.motor_shaft_power).toBeCloseTo(3.6459500366, 6);
    expect(results.pump_efficiency).toBeCloseTo(80, 6);
    expect('delete' in results).toBeFalse();
  });
});

function expectHeadResults(actual: HeadToolResults, expected: HeadToolResults): void {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
  expect('delete' in actual).toBeFalse();
  expect(Math.abs(actual.differentialElevationHead - expected.differentialElevationHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
  expect(Math.abs(actual.differentialPressureHead - expected.differentialPressureHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
  expect(Math.abs(actual.differentialVelocityHead - expected.differentialVelocityHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
  expect(Math.abs(actual.estimatedSuctionFrictionHead - expected.estimatedSuctionFrictionHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
  expect(Math.abs(actual.estimatedDischargeFrictionHead - expected.estimatedDischargeFrictionHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
  expect(Math.abs(actual.pumpHead - expected.pumpHead)).toBeLessThanOrEqual(PUMP_HEAD_TOLERANCE_FT);
}

function makePumpInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    pump_style: 6,
    pump_specified: 80,
    pump_rated_speed: 1780,
    drive: 0,
    specifiedDriveEfficiency: 100,
    differentialPressure: 0,
    kinematic_viscosity: 1,
    specific_gravity: 1,
    stages: 2,
    fixed_speed: 1,
    line_frequency: 60,
    motor_rated_power: 200,
    motor_rated_speed: 1780,
    efficiency_class: 3,
    efficiency: 95,
    motor_rated_voltage: 460,
    load_estimation_method: 0,
    motor_rated_fla: 225,
    margin: 0,
    operating_hours: 8760,
    flow_rate: 1840,
    head: 174.85,
    motor_field_power: 80,
    motor_field_current: 125.857,
    motor_field_voltage: 480,
    cost_kw_hour: 0.05,
    fluidType: 'Water',
    fluidTemperature: 68,
    ...overrides,
  };
}
