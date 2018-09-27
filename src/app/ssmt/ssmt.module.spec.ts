import { SsmtModule } from './ssmt.module';

describe('SsmtModule', () => {
  let ssmtModule: SsmtModule;

  beforeEach(() => {
    ssmtModule = new SsmtModule();
  });

  it('should create an instance', () => {
    expect(ssmtModule).toBeTruthy();
  });
});
