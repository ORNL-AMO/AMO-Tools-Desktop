import { TurbineModule } from './turbine.module';

describe('TurbineModule', () => {
  let turbineModule: TurbineModule;

  beforeEach(() => {
    turbineModule = new TurbineModule();
  });

  it('should create an instance', () => {
    expect(turbineModule).toBeTruthy();
  });
});
