import { getEnergySourceTabChanges, HeatingEquipmentConfiguration } from './views';

const HC = HeatingEquipmentConfiguration;

/** Heat Balance tabs each configuration shows that at least one other configuration hides. */
const CONFIGURATION_ONLY_TABS: Record<HeatingEquipmentConfiguration, string[]> = {
  [HC.FUEL_FIRED]: ['Flue Gas'],
  [HC.ELECTROTECHNOLOGY_STANDARD]: ['Energy Input Exhaust Gas'],
  [HC.ELECTROTECHNOLOGY_EAF]: ['Energy Input', 'Exhaust Gas', 'Slag'],
  [HC.CUSTOM_ELECTROTECHNOLOGY]: ['Heat System Efficiency'],
  [HC.STEAM]: ['Heat System Efficiency'],
};

describe('getEnergySourceTabChanges', () => {
  const configurations = Object.values(HC);

  it('reports no changes when the configuration is unchanged', () => {
    configurations.forEach(configuration => {
      expect(getEnergySourceTabChanges(configuration, configuration)).toEqual({ hidden: [], added: [] });
    });
  });

  configurations.forEach(from => {
    configurations.filter(to => to !== from).forEach(to => {
      it(`lists hidden and added tabs from ${from} to ${to}`, () => {
        const { hidden, added } = getEnergySourceTabChanges(from, to);

        expect(hidden.map(link => link.label)).toEqual(CONFIGURATION_ONLY_TABS[from].filter(tab => !CONFIGURATION_ONLY_TABS[to].includes(tab)));
        expect(added.map(link => link.label)).toEqual(CONFIGURATION_ONLY_TABS[to].filter(tab => !CONFIGURATION_ONLY_TABS[from].includes(tab)));
      });
    });
  });

  it('keeps tabs shared by both configurations out of both lists', () => {
    expect(getEnergySourceTabChanges(HC.STEAM, HC.CUSTOM_ELECTROTECHNOLOGY)).toEqual({ hidden: [], added: [] });
  });
});
