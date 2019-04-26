import { ElectricityReductionModule } from './electricity-reduction.module';

describe('ElectricityReductionModule', () => {
  let electricityReductionModule: ElectricityReductionModule;

  beforeEach(() => {
    electricityReductionModule = new ElectricityReductionModule();
  });

  it('should create an instance', () => {
    expect(electricityReductionModule).toBeTruthy();
  });
});
