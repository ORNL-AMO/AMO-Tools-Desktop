import { LightingReplacementModule } from './lighting-replacement.module';

describe('LightingReplacementModule', () => {
  let lightingReplacementModule: LightingReplacementModule;

  beforeEach(() => {
    lightingReplacementModule = new LightingReplacementModule();
  });

  it('should create an instance', () => {
    expect(lightingReplacementModule).toBeTruthy();
  });
});
