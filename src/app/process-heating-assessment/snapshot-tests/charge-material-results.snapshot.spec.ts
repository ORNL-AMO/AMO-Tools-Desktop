/**
 * Charge material test: the module's ChargeMaterialResultsService, run on the real fixtures with the
 * real suite WASM, must sum to the legacy `totalChargeMaterialLoss` snapshot value.
 *
 * Legacy sums `bindingResult`, the raw suite result before the reaction heat adjustment. The new
 * service's `heatRequired` is the gross value: it already includes the exothermic reaction heat, so
 * it differs from legacy's total whenever an exothermic material has a nonzero reaction. This spec
 * backs the raw value out (heatRequired - endoExoHeat for exothermic materials) to compare the
 * suite call and unit conversion; see the master doc's legacy-bugs section for the open question on
 * which value the heat balance should total.
 *
 * Every entry is passed as valid: legacy skips entries whose form is invalid, and the fixtures are
 * expected to contain none. All fixtures are Imperial, so Metric conversions are only covered by
 * the unit specs.
 */

import { Injector } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { LegacyModification, ProcessHeatingModification } from '../models/modification';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { deriveScenarioOverridesFromLegacyModification, ensureLossIdsForPhast, getEffectivePhast } from '../services/scenario-merge.util';
import { ChargeMaterialResultsService } from '../heat-balance/losses/charge-material/charge-material-results.service';
import { ChargeMaterial, ThermicReactionType } from '../../shared/models/phast/losses/chargeMaterial';
import { buildPhastServices } from './snapshot.helper';
import { FIXTURES } from './snapshot-fixtures';

function migrate(baseline: PHAST): PHAST {
  const modifications = baseline.modifications?.map(modification => {
    const legacyModification = modification as LegacyModification;
    return {
      ...modification,
      scenarioOverrides: deriveScenarioOverridesFromLegacyModification(legacyModification.phast, baseline),
    };
  });
  return ensureLossIdsForPhast({ ...baseline, modifications });
}

describe('ChargeMaterialResultsService vs. legacy snapshot totalChargeMaterialLoss', () => {
  let results: ChargeMaterialResultsService;

  beforeAll(async () => {
    const services = await buildPhastServices();
    const injector = Injector.create({
      providers: [
        { provide: ConvertUnitsService, useValue: services.convertUnitsService },
        { provide: ProcessHeatingApiService, useValue: services.processHeatingApiService },
        { provide: ChargeMaterialResultsService, useClass: ChargeMaterialResultsService, deps: [] },
      ],
    });
    results = injector.get(ChargeMaterialResultsService);
  });

  function thermicReactionType(material: ChargeMaterial): ThermicReactionType {
    const typed = material.chargeMaterialType === 'Gas' ? material.gasChargeMaterial
      : material.chargeMaterialType === 'Liquid' ? material.liquidChargeMaterial
      : material.solidChargeMaterial;
    return typed.thermicReactionType;
  }

  function totalFor(phast: PHAST, settings: Settings): number {
    const materials = phast.losses.chargeMaterials ?? [];
    const entries = materials.map(material => ({ material, valid: true }));
    return results.getResults(entries, settings).reduce((total, result, index) => {
      const isEndothermic = thermicReactionType(materials[index]) === ThermicReactionType.Endothermic;
      return total + (result.heatRequired ?? 0) - (isEndothermic ? 0 : (result.endoExoHeat ?? 0));
    }, 0);
  }

  for (const { name, fixture, snapshots } of FIXTURES) {
    describe(name, () => {
      const raw = fixture.assessments[0];
      const settings: Settings = raw.settings;
      const modificationCount: number = raw.assessment.phast.modifications.length;

      it('baseline charge material total matches snapshot', () => {
        const actual = totalFor(migrate(raw.assessment.phast), settings);
        expect(actual).toBeCloseTo(snapshots.baseline.totalChargeMaterialLoss, 6);
      });

      for (let i = 0; i < modificationCount; i++) {
        it(`modification[${i}] charge material total matches snapshot`, () => {
          const migrated = migrate(raw.assessment.phast);
          const effective = getEffectivePhast(migrated, migrated.modifications[i] as ProcessHeatingModification);
          expect(totalFor(effective, settings)).toBeCloseTo(snapshots[`modification_${i}`].totalChargeMaterialLoss, 6);
        });
      }
    });
  }
});
