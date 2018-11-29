import { CalculatePressuresModule } from './calculate-pressures.module';

describe('CalculatePressuresModule', () => {
  let calculatePressuresModule: CalculatePressuresModule;

  beforeEach(() => {
    calculatePressuresModule = new CalculatePressuresModule();
  });

  it('should create an instance', () => {
    expect(calculatePressuresModule).toBeTruthy();
  });
});
