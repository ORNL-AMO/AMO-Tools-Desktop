import { getWallLossSurfaceTemperatureWarning } from './wall-loss-warnings';

describe('getWallLossSurfaceTemperatureWarning', () => {
  it('warns when surface temperature is below ambient temperature', () => {
    expect(getWallLossSurfaceTemperatureWarning({ surfaceTemperature: 60, ambientTemperature: 70 }))
      .toBe('Surface temperature is lower than ambient temperature');
  });

  it('does not warn when surface and ambient temperature are equal', () => {
    expect(getWallLossSurfaceTemperatureWarning({ surfaceTemperature: 70, ambientTemperature: 70 })).toBeNull();
  });
});
