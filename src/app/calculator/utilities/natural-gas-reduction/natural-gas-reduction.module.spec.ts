import { NaturalGasReductionModule } from './natural-gas-reduction.module';

describe('NaturalGasReductionModule', () => {
  let naturalGasReductionModule: NaturalGasReductionModule;

  beforeEach(() => {
    naturalGasReductionModule = new NaturalGasReductionModule();
  });

  it('should create an instance', () => {
    expect(naturalGasReductionModule).toBeTruthy();
  });
});
