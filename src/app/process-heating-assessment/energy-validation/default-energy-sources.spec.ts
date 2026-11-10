import { HeatingEquipmentConfiguration } from '../models/views';
import { defaultEnergySources, onlySourceOn } from './default-energy-sources';

describe('defaultEnergySources', () => {
  const HC = HeatingEquipmentConfiguration;

  it('preselects fuel for fuel-fired equipment', () => {
    expect(defaultEnergySources(HC.FUEL_FIRED)).toEqual({ fuel: true, steam: false, electricity: false });
  });

  it('preselects steam for steam equipment', () => {
    expect(defaultEnergySources(HC.STEAM)).toEqual({ fuel: false, steam: true, electricity: false });
  });

  [HC.ELECTROTECHNOLOGY_STANDARD, HC.ELECTROTECHNOLOGY_EAF, HC.CUSTOM_ELECTROTECHNOLOGY].forEach(configuration => {
    it(`preselects electricity only for ${configuration}`, () => {
      expect(defaultEnergySources(configuration)).toEqual({ fuel: false, steam: false, electricity: true });
    });
  });

  it('returns a fresh object so callers cannot change the defaults', () => {
    defaultEnergySources(HC.FUEL_FIRED).steam = true;
    expect(defaultEnergySources(HC.FUEL_FIRED).steam).toBeFalse();
  });
});

describe('onlySourceOn', () => {
  it('names the source when it is the only one on', () => {
    expect(onlySourceOn({ fuel: false, steam: true, electricity: false })).toBe('steam');
  });

  it('is undefined when several or no sources are on', () => {
    expect(onlySourceOn({ fuel: true, steam: true, electricity: false })).toBeUndefined();
    expect(onlySourceOn({})).toBeUndefined();
  });
});
