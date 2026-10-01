/**
 * Per-loss test: the module's new calculation services, run on the real fixtures with the real
 * suite WASM, must sum to the legacy snapshot totals for the same loss type.
 *
 * Scenarios are rebuilt through scenarioOverrides (as in scenario-roundtrip.snapshot.spec.ts) so the
 * new calculators see the same effective data the module would.
 *
 * Coverage limits:
 * - Every fixture is Imperial, so Metric conversions are only covered by the calculation-service unit specs.
 * - No fixture has an 'Other Gas' / 'Other Liquid' cooling loss. The new CoolingCalculationService
 *   would include them while legacy sumCoolingLosses() adds 0 (see
 *   refactor-plan/issue-cooling-other-medium-excluded-from-totals.md); that difference is not
 *   exercised here.
 * - Extended surface is not compared. Legacy sumExtendedSurface() builds a wall-loss form without
 *   the required `name`, so the form is always invalid and legacy totals every extended surface as 0
 *   (see refactor-plan/issue-extended-surface-always-zero-in-totals.md). The new calculator's value
 *   is still computed but is not asserted against the snapshot.
 * - The extended surface mapping mirrors ExtendedSurfaceService.calculateResult() (not injectable
 *   without the form stack), so a change to that mapping needs this spec updated.
 */

import { Injector } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { LegacyModification, ProcessHeatingModification } from '../models/modification';
import { WallLoss } from '../models/wall-loss';
import { ExtendedSurface } from '../models/extended-surface';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { deriveScenarioOverridesFromLegacyModification, ensureLossIdsForPhast, getEffectivePhast } from '../services/scenario-merge.util';
import { OpeningCalculationService } from '../heat-balance/losses/opening/opening-calculation.service';
import { WallLossCalculationService } from '../heat-balance/losses/wall-losses/wall-loss-calculation.service';
import { AtmosphereCalculationService } from '../heat-balance/losses/atmosphere/atmosphere-calculation.service';
import { FixtureCalculationService } from '../heat-balance/losses/fixture/fixture-calculation.service';
import { CoolingCalculationService } from '../heat-balance/losses/cooling/cooling-calculation.service';
import { buildPhastServices, PhastServices } from './snapshot.helper';
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

function sum<T>(items: T[] | undefined, calculate: (item: T) => number): number {
  return (items ?? []).reduce((total, item) => total + calculate(item), 0);
}

describe('New calculation services vs. legacy snapshot totals', () => {
  let services: PhastServices;
  let opening: OpeningCalculationService;
  let wall: WallLossCalculationService;
  let atmosphere: AtmosphereCalculationService;
  let fixture: FixtureCalculationService;
  let cooling: CoolingCalculationService;

  beforeAll(async () => {
    services = await buildPhastServices();
    const injector = Injector.create({
      providers: [
        { provide: ConvertUnitsService, useValue: services.convertUnitsService },
        { provide: ProcessHeatingApiService, useValue: services.processHeatingApiService },
        { provide: OpeningCalculationService, useClass: OpeningCalculationService, deps: [] },
        { provide: WallLossCalculationService, useClass: WallLossCalculationService, deps: [] },
        { provide: AtmosphereCalculationService, useClass: AtmosphereCalculationService, deps: [] },
        { provide: FixtureCalculationService, useClass: FixtureCalculationService, deps: [] },
        { provide: CoolingCalculationService, useClass: CoolingCalculationService, deps: [] },
      ],
    });
    opening = injector.get(OpeningCalculationService);
    wall = injector.get(WallLossCalculationService);
    atmosphere = injector.get(AtmosphereCalculationService);
    fixture = injector.get(FixtureCalculationService);
    cooling = injector.get(CoolingCalculationService);
  });

  function totalsFor(phast: PHAST, settings: Settings): Record<string, number> {
    const losses = phast.losses;
    const extendedSurfaceAsWall = (surface: ExtendedSurface): WallLoss => ({
      surfaceArea: surface.surfaceArea,
      ambientTemperature: surface.ambientTemperature,
      surfaceTemperature: surface.surfaceTemperature,
      surfaceEmissivity: surface.surfaceEmissivity,
      windVelocity: 5,
      correctionFactor: 1,
      conditionFactor: 1,
    });
    return {
      totalOpeningLoss: sum(losses.openingLosses, loss => opening.calculate(loss, settings)),
      totalWallLoss: sum(losses.wallLosses, loss => wall.calculate(loss, settings)),
      totalExtSurfaceLoss: sum(losses.extendedSurfaces, surface => wall.calculate(extendedSurfaceAsWall(surface), settings)),
      totalAtmosphereLoss: sum(losses.atmosphereLosses, loss => atmosphere.calculate(loss, settings)),
      totalFixtureLoss: sum(losses.fixtureLosses, loss => fixture.calculate(loss, settings)),
      totalCoolingLoss: sum(losses.coolingLosses, loss => {
        if (loss.coolingLossType === 'Gas') {
          return cooling.calculateGas(loss.gasCoolingLoss, settings);
        }
        return loss.coolingLossType === 'Liquid' ? cooling.calculateLiquid(loss.liquidCoolingLoss, settings) : 0;
      }),
      totalOtherLoss: sum(losses.otherLosses, loss => loss.heatLoss),
    };
  }

  for (const { name, fixture: fixtureJson, snapshots } of FIXTURES) {
    describe(name, () => {
      const raw = fixtureJson.assessments[0];
      const settings: Settings = raw.settings;
      const modificationCount: number = raw.assessment.phast.modifications.length;

      const scenarios: { label: string; snapshotKey: string; effective: () => PHAST }[] = [
        { label: 'baseline', snapshotKey: 'baseline', effective: () => migrate(raw.assessment.phast) },
        ...Array.from({ length: modificationCount }, (_, i) => ({
          label: `modification[${i}]`,
          snapshotKey: `modification_${i}`,
          effective: () => {
            const migrated = migrate(raw.assessment.phast);
            return getEffectivePhast(migrated, migrated.modifications[i] as ProcessHeatingModification);
          },
        })),
      ];

      for (const scenario of scenarios) {
        it(`${scenario.label} per-loss totals match snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const actual = totalsFor(scenario.effective(), settings);
          for (const key of Object.keys(actual).filter(key => key !== 'totalExtSurfaceLoss')) {
            expect(actual[key]).withContext(key).toBeCloseTo(expected[key] ?? 0, 6);
          }
        });
      }
    });
  }
});
