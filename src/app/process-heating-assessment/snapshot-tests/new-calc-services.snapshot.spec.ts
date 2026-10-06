/**
 * Per-loss test: the module's new calculation services, run on the real fixtures with the real
 * suite WASM, must sum to the legacy snapshot totals for the same loss type.
 *
 * Scenarios are rebuilt through scenarioOverrides (as in scenario-roundtrip.snapshot.spec.ts) so the
 * new calculators see the same effective data the module would.
 *
 * Coverage limits:
 * - Flue gas is compared as available heat and O2 only (the legacy totals also depend on total input).
 *   The `20-1367 By Mass` fixture covers By Mass; flue-gas-by-mass.snapshot.spec.ts adds the Excess Air method
 *   and Metric cases.
 * - Auxiliary Power is compared after converting the snapshot's totalAuxPower. Legacy sumAuxilaryPowerLosses()
 *   returns the raw suite value (Btu/hr) with no unit conversion, a known legacy bug; the new calculator converts to
 *   the energy result unit. The expected value is converted here the same way until the legacy total is fixed.
 * - Energy Input EAF is compared against a live legacy PhastService.energyInputEAF() call, not a snapshot key:
 *   the snapshot's energyInputHeatDelivered is a results rollup (gross heat input less chemical energy), not the
 *   form's heat delivered.
 * - Heat System Efficiency is compared on system losses only. Legacy's results rollup and its tab apply
 *   exothermic heat differently (see master-rebuild-plan.md, Heat System Efficiency Formula Mismatch), so a
 *   fixture with exothermic heat would expose that difference. None of these fixtures has any.
 * - The EAF Dummy Values, Steam Synthetic and Custom Electrotechnology Synthetic fixtures are synthetic, not real
 *   assessments, and are to be replaced with real ones later.
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
import { GasLeakageCalculationService } from '../heat-balance/losses/gas-leakage/gas-leakage-calculation.service';
import { EnergyInputExhaustGasCalculationService } from '../heat-balance/losses/energy-input-exhaust-gas/energy-input-exhaust-gas-calculation.service';
import { AuxiliaryPowerCalculationService } from '../heat-balance/losses/auxiliary-power/auxiliary-power-calculation.service';
import { FlueGasCalculationService } from '../heat-balance/losses/flue-gas/flue-gas-calculation.service';
import { SlagCalculationService } from '../heat-balance/losses/slag/slag-calculation.service';
import { EnergyInputCalculationService } from '../heat-balance/losses/energy-input/energy-input-calculation.service';
import { ExhaustGasCalculationService } from '../heat-balance/losses/exhaust-gas/exhaust-gas-calculation.service';
import { calculateSystemEfficiencyResults } from '../heat-balance/losses/heat-system-efficiency/heat-system-efficiency.component';
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
  let gasLeakage: GasLeakageCalculationService;
  let flueGas: FlueGasCalculationService;
  let auxiliaryPower: AuxiliaryPowerCalculationService;
  let energyInputExhaustGas: EnergyInputExhaustGasCalculationService;
  let slag: SlagCalculationService;
  let energyInput: EnergyInputCalculationService;
  let exhaustGas: ExhaustGasCalculationService;

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
        { provide: GasLeakageCalculationService, useClass: GasLeakageCalculationService, deps: [] },
        { provide: FlueGasCalculationService, useClass: FlueGasCalculationService, deps: [] },
        { provide: AuxiliaryPowerCalculationService, useClass: AuxiliaryPowerCalculationService, deps: [] },
        { provide: EnergyInputExhaustGasCalculationService, useClass: EnergyInputExhaustGasCalculationService, deps: [] },
        { provide: SlagCalculationService, useClass: SlagCalculationService, deps: [] },
        { provide: EnergyInputCalculationService, useClass: EnergyInputCalculationService, deps: [] },
        { provide: ExhaustGasCalculationService, useClass: ExhaustGasCalculationService, deps: [] },
      ],
    });
    opening = injector.get(OpeningCalculationService);
    wall = injector.get(WallLossCalculationService);
    atmosphere = injector.get(AtmosphereCalculationService);
    fixture = injector.get(FixtureCalculationService);
    cooling = injector.get(CoolingCalculationService);
    gasLeakage = injector.get(GasLeakageCalculationService);
    flueGas = injector.get(FlueGasCalculationService);
    auxiliaryPower = injector.get(AuxiliaryPowerCalculationService);
    energyInputExhaustGas = injector.get(EnergyInputExhaustGasCalculationService);
    slag = injector.get(SlagCalculationService);
    energyInput = injector.get(EnergyInputCalculationService);
    exhaustGas = injector.get(ExhaustGasCalculationService);
  });

  /** Legacy totalAuxPower is the raw suite value (Btu/hr); converts it the way the new calculator reports it. */
  function legacyAuxPowerToResultUnit(btuPerHour: number, unit: string): number {
    if (unit === 'Btu') {
      return btuPerHour;
    }
    return unit === 'kWh'
      ? services.convertUnitsService.value(btuPerHour).from('btuhr').to('kW')
      : services.convertUnitsService.value(btuPerHour).from('Btu').to(unit);
  }

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
      totalLeakageLoss: sum(losses.leakageLosses, loss => gasLeakage.calculate(loss, settings)),
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

        it(`${scenario.label} auxiliary power matches snapshot after unit conversion`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const losses = scenario.effective().losses.auxiliaryPowerLosses;
          if (!losses?.length || expected.totalAuxPower === undefined) {
            pending('no auxiliary power result in this scenario');
            return;
          }
          const actual = sum(losses, loss => auxiliaryPower.calculate(loss, settings));
          expect(actual).withContext('totalAuxPower').toBeCloseTo(legacyAuxPowerToResultUnit(expected.totalAuxPower, settings.energyResultUnit), 6);
        });

        it(`${scenario.label} energy input exhaust gas matches snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const entry = scenario.effective().losses.energyInputExhaustGasLoss?.[0];
          if (!entry || expected.totalExhaustGas === undefined) {
            pending('no energy input exhaust gas result in this scenario');
            return;
          }
          const actual = energyInputExhaustGas.calculate(entry, settings);
          expect(actual.exhaustGasLosses).withContext('exhaustGasLosses').toBeCloseTo(expected.totalExhaustGas, 6);
          expect(actual.fuelHeatDelivered).withContext('fuelHeatDelivered').toBeCloseTo(expected.energyInputHeatDelivered, 6);
        });

        it(`${scenario.label} slag matches snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const losses = scenario.effective().losses.slagLosses;
          if (!losses?.length || expected.totalSlag === undefined) {
            pending('no slag result in this scenario');
            return;
          }
          expect(sum(losses, loss => slag.calculate(loss, settings))).withContext('totalSlag').toBeCloseTo(expected.totalSlag, 6);
        });

        it(`${scenario.label} exhaust gas EAF matches snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const losses = scenario.effective().losses.exhaustGasEAF;
          if (!losses?.length || expected.totalExhaustGasEAF === undefined) {
            pending('no exhaust gas EAF result in this scenario');
            return;
          }
          expect(sum(losses, loss => exhaustGas.calculate(loss, settings))).withContext('totalExhaustGasEAF').toBeCloseTo(expected.totalExhaustGasEAF, 6);
        });

        it(`${scenario.label} energy input EAF matches legacy heat delivered`, () => {
          const entry = scenario.effective().losses.energyInputEAF?.[0];
          if (!entry) {
            pending('no energy input EAF result in this scenario');
            return;
          }
          const expected = services.phastService.energyInputEAF(JSON.parse(JSON.stringify(entry)), settings).heatDelivered;
          expect(energyInput.calculate(entry, settings)).withContext('heatDelivered').toBeCloseTo(expected, 6);
        });

        it(`${scenario.label} heat system efficiency matches snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          if (!expected.heatingSystemEfficiency) {
            pending('no heat system efficiency result in this scenario');
            return;
          }
          const actual = calculateSystemEfficiencyResults(expected.totalInput, expected.exothermicHeat, expected.heatingSystemEfficiency);
          expect(actual.systemLosses).withContext('totalSystemLosses').toBeCloseTo(expected.totalSystemLosses, 6);
        });

        it(`${scenario.label} flue gas available heat matches snapshot`, () => {
          const expected = snapshots[scenario.snapshotKey];
          const entry = scenario.effective().losses.flueGasLosses?.[0];
          if (!entry || !expected.flueGasAvailableHeat) {
            pending('no flue gas result in this scenario');
            return;
          }
          const actual = entry.flueGasType === 'By Mass'
            ? flueGas.calculateByMass(entry.flueGasByMass, settings)
            : flueGas.calculateByVolume(entry.flueGasByVolume, settings);
          expect(actual.availableHeat).withContext('availableHeat').toBeCloseTo(expected.flueGasAvailableHeat, 6);
          expect(actual.calculatedFlueGasO2).withContext('calculatedFlueGasO2').toBeCloseTo(expected.calculatedFlueGasO2, 6);
        });
      }
    });
  }
});
