import { cloneDeep } from 'lodash';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { LegacyModification } from '../models/modification';
import { canOpenInLegacyPhast, phastModuleFor, toLegacyPhastAssessment } from './legacy-phast-assessment.util';

/* eslint-disable @typescript-eslint/no-require-imports */
const FUEL_EXAMPLE = require('../snapshot-tests/fixtures/Process Heating - Fuel Example.json').assessments[0];
/* eslint-enable @typescript-eslint/no-require-imports */

const FUEL_FIRED = { energySourceType: 'Fuel' } as Settings;

function buildAssessment(phast: Partial<PHAST>, modifications: LegacyModification[]): Assessment {
  return { id: 1, name: 'Furnace', type: 'PHAST', phast: { name: 'Baseline', losses: { wallLosses: [] }, ...phast, modifications } } as unknown as Assessment;
}

describe('toLegacyPhastAssessment', () => {
  it('rebuilds a never-opened legacy modification from its own phast clone', () => {
    const assessment: Assessment = cloneDeep(FUEL_EXAMPLE.assessment);
    const original = assessment.phast.modifications[1].phast;

    const modification = toLegacyPhastAssessment(assessment, FUEL_EXAMPLE.settings).phast.modifications[1];

    expect(modification.phast.name).toBe(original.name);
    expect(modification.phast.losses.flueGasLosses).toEqual(original.losses.flueGasLosses);
    expect(modification.phast.operatingCosts).toEqual(original.operatingCosts);
  });

  it('carries a never-opened legacy modification\'s explore opportunity flags', () => {
    const flag = { hasOpportunity: true, display: 'Reduce wall losses' };
    const assessment = buildAssessment({}, [{ id: 'm1', exploreOppsShowWall: flag, phast: { name: 'Mod 1', losses: { wallLosses: [] } } }]);

    const modification = toLegacyPhastAssessment(assessment, FUEL_FIRED).phast.modifications[0];

    expect(modification.exploreOpportunities).toBeTrue();
    expect(modification.exploreOppsShowWall).toEqual(flag);
  });

  it('uses a migrated modification\'s edited overrides, not its stale phast clone', () => {
    const assessment = buildAssessment({}, [{ id: 'm1', scenarioOverrides: { name: 'Edited', implementationCost: 900 }, phast: { name: 'Stale', implementationCost: 100 } }]);

    const modification = toLegacyPhastAssessment(assessment, FUEL_FIRED).phast.modifications[0];

    expect(modification.phast.name).toBe('Edited');
    expect(modification.phast.implementationCost).toBe(900);
  });

  it('builds a phast for a modification saved by this module, which has none', () => {
    const assessment = buildAssessment({}, [{ id: 'm1', scenarioOverrides: { name: 'New', operatingHours: { hoursPerYear: 4000 } } }]);

    const modification = toLegacyPhastAssessment(assessment, FUEL_FIRED).phast.modifications[0];

    expect(modification.phast.name).toBe('New');
    expect(modification.phast.operatingHours.hoursPerYear).toBe(4000);
  });

  it('leaves Auxiliary Power out of the baseline and of a never-opened legacy modification', () => {
    const auxiliaryPowerLosses = [{ supplyVoltage: 480 }];
    const assessment = buildAssessment({ losses: { auxiliaryPowerLosses, wallLosses: [] } },
      [{ id: 'm1', phast: { name: 'Mod 1', losses: { auxiliaryPowerLosses, wallLosses: [] } } }]);

    const result = toLegacyPhastAssessment(assessment, FUEL_FIRED);

    expect(result.phast.losses.auxiliaryPowerLosses).toBeUndefined();
    expect(result.phast.modifications[0].phast.losses.auxiliaryPowerLosses).toBeUndefined();
  });

  it('keeps the saved setup done mark, treating a missing one as not set up', () => {
    expect(toLegacyPhastAssessment(buildAssessment({ setupDone: true }, []), FUEL_FIRED).phast.setupDone).toBeTrue();
    expect(toLegacyPhastAssessment(buildAssessment({}, []), FUEL_FIRED).phast.setupDone).toBeFalse();
  });

  it('marks a modification on another energy source, which the legacy calculations price with the baseline\'s', () => {
    const assessment = buildAssessment({}, [
      { id: 'same', scenarioOverrides: {} },
      { id: 'electric', scenarioOverrides: {}, energySource: { energySourceType: 'Electricity', furnaceType: 'Electrical Infrared' } },
    ]);

    const modifications = toLegacyPhastAssessment(assessment, FUEL_FIRED).phast.modifications;

    expect(modifications.map(modification => modification.exportWithoutResults)).toEqual([false, true]);
  });

  it('does not mutate the saved assessment', () => {
    const assessment: Assessment = cloneDeep(FUEL_EXAMPLE.assessment);
    const saved = cloneDeep(assessment);

    toLegacyPhastAssessment(assessment, FUEL_EXAMPLE.settings);

    expect(assessment).toEqual(saved);
  });
});

describe('canOpenInLegacyPhast', () => {
  it('allows an assessment whose modifications all have a legacy copy, or that has none', () => {
    expect(canOpenInLegacyPhast(buildAssessment({}, [{ id: 'm1', phast: { name: 'Mod 1' } }]).phast)).toBeTrue();
    expect(canOpenInLegacyPhast(buildAssessment({}, []).phast)).toBeTrue();
  });

  it('refuses an assessment with a modification created in this module', () => {
    const assessment = buildAssessment({}, [{ id: 'm1', phast: { name: 'Mod 1' } }, { id: 'm2', scenarioOverrides: {} }]);

    expect(canOpenInLegacyPhast(assessment.phast)).toBeFalse();
  });
});

describe('phastModuleFor', () => {
  const neverOpened = buildAssessment({}, [{ id: 'm1', phast: { name: 'Mod 1' } }]).phast;
  const savedByProcessHeating = buildAssessment({}, [{ id: 'm1', phast: { name: 'Stale' }, scenarioOverrides: { name: 'Edited' } }]).phast;
  const createdByProcessHeating = buildAssessment({}, [{ id: 'm1', scenarioOverrides: {} }]).phast;

  it('opens Process Heating when the legacy module cannot open the assessment, whatever the user picked', () => {
    expect(phastModuleFor(createdByProcessHeating)).toBe('process-heating');
    expect(phastModuleFor(createdByProcessHeating, 'phast')).toBe('process-heating');
  });

  it('opens the module the user picked', () => {
    expect(phastModuleFor(savedByProcessHeating, 'phast')).toBe('phast');
    expect(phastModuleFor(neverOpened, 'process-heating')).toBe('process-heating');
  });

  it('opens Process Heating once it has saved the assessment', () => {
    expect(phastModuleFor(savedByProcessHeating)).toBe('process-heating');
  });

  it('opens the legacy module for an assessment Process Heating has not saved', () => {
    expect(phastModuleFor(neverOpened)).toBe('phast');
    expect(phastModuleFor(buildAssessment({}, []).phast)).toBe('phast');
  });
});
