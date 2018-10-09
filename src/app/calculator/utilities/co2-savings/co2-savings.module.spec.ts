import { Co2SavingsModule } from './co2-savings.module';

describe('Co2SavingsModule', () => {
  let co2SavingsModule: Co2SavingsModule;

  beforeEach(() => {
    co2SavingsModule = new Co2SavingsModule();
  });

  it('should create an instance', () => {
    expect(co2SavingsModule).toBeTruthy();
  });
});
