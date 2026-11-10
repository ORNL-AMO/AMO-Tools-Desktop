import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';
import { MotorDataApiService } from './motor-data-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

describe('Published beta motor catalog metadata', () => {
  let suite: MeasurToolsSuite;
  beforeAll(async () => { suite = await createModule({locateFile: filename => '/' + filename}); });

  it('preserves numeric efficiency class and physical line frequency for saved motor records', () => {
    const tools = {ToolsSuiteModule: suite} as ToolsSuiteApiService;
    const adapter = new MotorDataApiService(new SuiteApiHelperService(tools), tools);
    const records = adapter.getMotors();
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toEqual(jasmine.objectContaining({id: 1, lineFrequency: 50, efficiencyClass: 1}));
    for (const record of records) {
      expect([50, 60]).withContext(`motor ${record.id} frequency`).toContain(record.lineFrequency);
      expect(typeof record.efficiencyClass).withContext(`motor ${record.id} class`).toBe('number');
      expect(Number.isFinite(record.efficiencyClass)).toBeTrue();
    }
    expect(JSON.parse(JSON.stringify(records[0]))).toEqual(records[0]);
  });
});
