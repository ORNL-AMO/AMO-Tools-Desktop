import { PrvModule } from './prv.module';

describe('PrvModule', () => {
  let prvModule: PrvModule;

  beforeEach(() => {
    prvModule = new PrvModule();
  });

  it('should create an instance', () => {
    expect(prvModule).toBeTruthy();
  });
});
