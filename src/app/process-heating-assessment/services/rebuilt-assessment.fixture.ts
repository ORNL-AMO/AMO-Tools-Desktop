import { Assessment } from '../../shared/models/assessment';

/**
 * Test fixture for code outside this module: an assessment saved by this module, with a modification that has no
 * legacy `phast` clone and a baseline that still holds Auxiliary Power losses.
 * @returns a new copy each call, so tests can change it freely
 */
export function buildRebuiltAssessment(): Assessment {
  return {
    id: 1, name: 'Furnace', type: 'PHAST',
    phast: {
      name: 'Baseline', setupDone: true,
      losses: { auxiliaryPowerLosses: [{ supplyVoltage: 480 }], wallLosses: [] },
      modifications: [{ id: 'm1', scenarioOverrides: { name: 'Mod 1' } }],
    },
  } as unknown as Assessment;
}
