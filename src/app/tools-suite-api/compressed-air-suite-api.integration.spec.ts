import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';

describe('measur-tools-suite compressed-air WASM integration', () => {
  let module: MeasurToolsSuite;

  beforeAll(async () => {
    module = await createModule({
      locateFile: (filename: string) => `/${filename}`
    });
  });

  it('transitions centrifugal modulation/unload at the unload airflow point', () => {
    const compressor = new module.CentrifugalModulationUnloadCompressor(
      452.3, 3138, 71.3, 3005, 411.9, 2731
    );

    try {
      const unloadAirflowFraction = 2731 / 3138;
      const unloadPowerFraction = 411.9 / 452.3;
      const below = compressor.calculateFromCapacityFraction(unloadAirflowFraction - 0.001);
      const at = compressor.calculateFromCapacityFraction(unloadAirflowFraction);
      const above = compressor.calculateFromCapacityFraction(unloadAirflowFraction + 0.001);

      expect(below.powerFraction).toBeLessThan(unloadPowerFraction);
      expect(at.powerFraction).toBeCloseTo(unloadPowerFraction, 6);
      expect(above.powerFraction).toBeGreaterThan(unloadPowerFraction);
    } finally {
      compressor.delete();
    }
  });

  it('uses compressor type for start/stop pressure correction', () => {
    const screw = new module.StartStopCompressor(89.5, 560, 1.05, 1, module.CompressorType.Screw);
    const reciprocating = new module.StartStopCompressor(
      89.5, 560, 1.05, 1, module.CompressorType.Reciprocating
    );

    try {
      screw.applyPressureInletCorrection(473, 105, 1.4, 100, 14.5, 0.917, 110, 110, 14.7, true, 14.7);
      reciprocating.applyPressureInletCorrection(
        473, 105, 1.4, 100, 14.5, 0.917, 110, 110, 14.7, true, 14.7
      );

      expect(screw.adjustedFullLoadPowerKw).toBeCloseTo(90.0736, 3);
      expect(reciprocating.adjustedFullLoadPowerKw).toBeCloseTo(89.3967, 3);
    } finally {
      screw.delete();
      reciprocating.delete();
    }
  });

  it('calculates electrical input with a dimensionless power factor', () => {
    const compressor = new module.CentrifugalModulationUnloadCompressor(
      452.3, 3138, 71.3, 3005, 411.9, 2731
    );

    try {
      const result = compressor.calculateFromElectrical(440, 246.7, 0.5);
      expect(result.powerKw).toBeCloseTo(94.003, 3);
    } finally {
      compressor.delete();
    }
  });
});
