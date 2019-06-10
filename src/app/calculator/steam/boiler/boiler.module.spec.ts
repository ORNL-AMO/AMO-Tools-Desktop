import { BoilerModule } from './boiler.module';

describe('BoilerModule', () => {
  let boilerModule: BoilerModule;

  beforeEach(() => {
    boilerModule = new BoilerModule();
  });

  it('should create an instance', () => {
    expect(boilerModule).toBeTruthy();
  });
});
