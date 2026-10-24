import { ElectronService } from '../electron/electron.service';
import { HeadToolResults } from '../shared/models/calculators';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

const PUMP_HEAD_TOLERANCE_FT: number = 0.001;

describe('PumpsSuiteApiService pump head wrappers', () => {
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
