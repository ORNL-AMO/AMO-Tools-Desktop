import { CompressedAirReductionModule } from './compressed-air-reduction.module';

describe('CompressedAirReductionModule', () => {
  let compressedAirReductionModule: CompressedAirReductionModule;

  beforeEach(() => {
    compressedAirReductionModule = new CompressedAirReductionModule();
  });

  it('should create an instance', () => {
    expect(compressedAirReductionModule).toBeTruthy();
  });
});
