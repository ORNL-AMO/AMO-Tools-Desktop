import { LightingModule } from './lighting.module';

describe('LightingModule', () => {
  let lightingModule: LightingModule;

  beforeEach(() => {
    lightingModule = new LightingModule();
  });

  it('should create an instance', () => {
    expect(lightingModule).toBeTruthy();
  });
});
