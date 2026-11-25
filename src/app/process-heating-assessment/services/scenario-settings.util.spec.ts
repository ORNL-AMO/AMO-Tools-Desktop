import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { scenarioSettingsFor } from './scenario-settings.util';

describe('scenarioSettingsFor', () => {
  const settings = { energySourceType: 'Fuel', unitsOfMeasure: 'Imperial' } as Settings;
  const phast = {
    modifications: [{ id: 'electric', energySource: { energySourceType: 'Electricity', furnaceType: 'Electrical Infrared' } }, { id: 'same' }],
  } as unknown as PHAST;

  it('returns the assessment settings for the baseline and for a modification without its own energy source', () => {
    expect(scenarioSettingsFor(settings, phast, 'baseline')).toBe(settings);
    expect(scenarioSettingsFor(settings, phast, 'same')).toBe(settings);
  });

  it("applies a modification's own energy source", () => {
    expect(scenarioSettingsFor(settings, phast, 'electric')).toEqual(jasmine.objectContaining({
      energySourceType: 'Electricity', furnaceType: 'Electrical Infrared', unitsOfMeasure: 'Imperial',
    }));
  });
});
