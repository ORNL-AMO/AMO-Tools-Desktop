import { getOpeningLossWarnings } from './opening-warnings';

describe('opening warnings', () => {
  it('warns when ambient temperature exceeds inside temperature', () => {
    expect(getOpeningLossWarnings({ ambientTemperature: 500, insideTemperature: 400 }).temperatureWarning)
      .toBe('Ambient Temperature cannot be greater than Average Zone Temperature');
    expect(getOpeningLossWarnings({ ambientTemperature: 70, insideTemperature: 500 }).temperatureWarning).toBeNull();
  });

  it('flags emissivity outside [0, 1]', () => {
    expect(getOpeningLossWarnings({ emissivity: 1.1 }).emissivityWarning).toBe('Surface emissivity must be less than 1');
    expect(getOpeningLossWarnings({ emissivity: -0.1 }).emissivityWarning).toBe('Surface emissivity must be positive');
    expect(getOpeningLossWarnings({ emissivity: 0.9 }).emissivityWarning).toBeNull();
  });

  it('flags percent time open outside [0, 100]', () => {
    expect(getOpeningLossWarnings({ percentTimeOpen: 150 }).timeOpenWarning).toBe('Time open must be less than 100%');
    expect(getOpeningLossWarnings({ percentTimeOpen: -1 }).timeOpenWarning).toBe('Time must be greater positive');
    expect(getOpeningLossWarnings({ percentTimeOpen: 50 }).timeOpenWarning).toBeNull();
  });

  it('flags a negative number of openings', () => {
    expect(getOpeningLossWarnings({ numberOfOpenings: -1 }).numOpeningsWarning).toBe('Number of Openings must be positive');
  });

  it('flags a negative wall thickness', () => {
    expect(getOpeningLossWarnings({ thickness: -1 }).thicknessWarning).toBe('Furnace Wall Thickness must be greater than or equal to 0');
  });

  it('flags a non-positive length with wording that depends on opening type', () => {
    expect(getOpeningLossWarnings({ lengthOfOpening: 0, openingType: 'Round' }).lengthWarning)
      .toBe('Opening Diameter must be greater than 0');
    expect(getOpeningLossWarnings({ lengthOfOpening: 0, openingType: 'Rectangular (or Square)' }).lengthWarning)
      .toBe('Opening Length must be greater than 0');
    expect(getOpeningLossWarnings({ lengthOfOpening: 12, openingType: 'Round' }).lengthWarning).toBeNull();
  });

  it('flags a negative height', () => {
    expect(getOpeningLossWarnings({ heightOfOpening: -1 }).heightWarning).toBe('Opening Height must be greater than 0');
  });

  it('flags a negative view factor', () => {
    expect(getOpeningLossWarnings({ viewFactor: -1 }).viewFactorWarning).toBe('View Factor must be positive');
  });
});
