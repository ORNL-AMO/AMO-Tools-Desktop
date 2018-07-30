import { DeaeratorModule } from './deaerator.module';

describe('DeaeratorModule', () => {
  let deaeratorModule: DeaeratorModule;

  beforeEach(() => {
    deaeratorModule = new DeaeratorModule();
  });

  it('should create an instance', () => {
    expect(deaeratorModule).toBeTruthy();
  });
});
