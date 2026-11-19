/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Synthetic: no real non-fuel assessment with Gas Leakage was available, so each is an existing fixture
 * with a Gas Leakage entry added. Replace with real assessments later.
 */
export const GAS_LEAKAGE_FIXTURES: { name: string; fixture: any; snapshots: any }[] = [
  { name: 'Steam Gas Leakage Synthetic', fixture: require('./fixtures/Steam Gas Leakage Synthetic.json'), snapshots: require('./snapshots/steam-gas-leakage-synthetic.snap.json') },
  { name: 'Electrotechnology Gas Leakage Synthetic', fixture: require('./fixtures/Electrotechnology Gas Leakage Synthetic.json'), snapshots: require('./snapshots/electrotechnology-gas-leakage-synthetic.snap.json') },
  { name: 'EAF Gas Leakage Synthetic', fixture: require('./fixtures/EAF Gas Leakage Synthetic.json'), snapshots: require('./snapshots/eaf-gas-leakage-synthetic.snap.json') },
  { name: 'Custom Electrotechnology Gas Leakage Synthetic', fixture: require('./fixtures/Custom Electrotechnology Gas Leakage Synthetic.json'), snapshots: require('./snapshots/custom-electrotechnology-gas-leakage-synthetic.snap.json') },
];

/** Every fixture paired with its legacy snapshots, shared by the new-module snapshot specs. */
export const FIXTURES: { name: string; fixture: any; snapshots: any }[] = [
  { name: '07-1353', fixture: require('./fixtures/07-1353.json'), snapshots: require('./snapshots/07-1353.snap.json') },
  { name: '123-1363', fixture: require('./fixtures/123-1363.json'), snapshots: require('./snapshots/123-1363.snap.json') },
  { name: '20-1367', fixture: require('./fixtures/20-1367.json'), snapshots: require('./snapshots/20-1367.snap.json') },
  { name: '20-1368', fixture: require('./fixtures/20-1368.json'), snapshots: require('./snapshots/20-1368.snap.json') },
  { name: '48-1380', fixture: require('./fixtures/48-1380.json'), snapshots: require('./snapshots/48-1380.snap.json') },
  { name: '20-1367 By Mass', fixture: require('./fixtures/20-1367-By-Mass.json'), snapshots: require('./snapshots/20-1367-by-mass.snap.json') },
  { name: 'Induction melters', fixture: require('./fixtures/Induction melters_6-11-2026.json'), snapshots: require('./snapshots/induction-melters_6-11-2026.snap.json') },
  { name: 'Induction melters - With Aux', fixture: require('./fixtures/Induction melters - With Aux.json'), snapshots: require('./snapshots/induction-melters---with-aux.snap.json') },
  { name: 'Induction melters - With Energy Exhaust', fixture: require('./fixtures/Induction melters - With Energy Exhaust.json'), snapshots: require('./snapshots/induction-melters---with-energy-exhaust.snap.json') },
  { name: 'Fuel Example', fixture: require('./fixtures/Process Heating - Fuel Example.json'), snapshots: require('./snapshots/fuel-example.snap.json') },
  { name: 'TEST A1', fixture: require('./fixtures/TEST A1.json'), snapshots: require('./snapshots/test-a1.snap.json') },
  { name: 'TEST A2', fixture: require('./fixtures/TEST A2.json'), snapshots: require('./snapshots/test-a2.snap.json') },
  { name: 'TEST B1', fixture: require('./fixtures/TEST B1.json'), snapshots: require('./snapshots/test-b1.snap.json') },
  // Synthetic fixtures (not real assessments); replace with real ones later
  { name: 'EAF Dummy Values', fixture: require('./fixtures/EAF Dummy Values.json'), snapshots: require('./snapshots/eaf-dummy-values.snap.json') },
  { name: 'Steam Synthetic', fixture: require('./fixtures/Steam Synthetic.json'), snapshots: require('./snapshots/steam-synthetic.snap.json') },
  { name: 'Custom Electrotechnology Synthetic', fixture: require('./fixtures/Custom Electrotechnology Synthetic.json'), snapshots: require('./snapshots/custom-electrotechnology-synthetic.snap.json') },
  ...GAS_LEAKAGE_FIXTURES,
];
/* eslint-enable @typescript-eslint/no-require-imports */
