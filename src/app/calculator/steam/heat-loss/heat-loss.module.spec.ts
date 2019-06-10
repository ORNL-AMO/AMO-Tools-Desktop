import { HeatLossModule } from './heat-loss.module';

describe('HeatLossModule', () => {
  let heatLossModule: HeatLossModule;

  beforeEach(() => {
    heatLossModule = new HeatLossModule();
  });

  it('should create an instance', () => {
    expect(heatLossModule).toBeTruthy();
  });
});
