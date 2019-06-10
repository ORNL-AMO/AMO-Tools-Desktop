import { FanEfficiencyModule } from './fan-efficiency.module';

describe('FanEfficiencyModule', () => {
  let fanEfficiencyModule: FanEfficiencyModule;

  beforeEach(() => {
    fanEfficiencyModule = new FanEfficiencyModule();
  });

  it('should create an instance', () => {
    expect(fanEfficiencyModule).toBeTruthy();
  });
});
