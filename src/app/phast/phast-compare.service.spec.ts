import { TestBed } from '@angular/core/testing';
import { PHAST } from '../shared/models/phast/phast';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { WallLossCompareService } from './losses/wall-losses/wall-loss-compare.service';
import { SlagCompareService } from './losses/slag/slag-compare.service';
import { OtherLossesCompareService } from './losses/other-losses/other-losses-compare.service';
import { OpeningLossesCompareService } from './losses/opening-losses/opening-losses-compare.service';
import { HeatSystemEfficiencyCompareService } from './losses/heat-system-efficiency/heat-system-efficiency-compare.service';
import { GasLeakageCompareService } from './losses/gas-leakage-losses/gas-leakage-compare.service';
import { FlueGasCompareService } from './losses/flue-gas-losses/flue-gas-compare.service';
import { FixtureLossesCompareService } from './losses/fixture-losses/fixture-losses-compare.service';
import { ExtendedSurfaceCompareService } from './losses/extended-surface-losses/extended-surface-compare.service';
import { ExhaustGasCompareService } from './losses/exhaust-gas/exhaust-gas-compare.service';
import { EnergyInputCompareService } from './losses/energy-input/energy-input-compare.service';
import { EnergyInputExhaustGasCompareService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas-compare.service';
import { CoolingLossesCompareService } from './losses/cooling-losses/cooling-losses-compare.service';
import { ChargeMaterialCompareService } from './losses/charge-material/charge-material-compare.service';
import { AuxiliaryPowerCompareService } from './losses/auxiliary-power-losses/auxiliary-power-compare.service';
import { AtmosphereLossesCompareService } from './losses/atmosphere-losses/atmosphere-losses-compare.service';
import { OperationsCompareService } from './losses/operations/operations-compare.service';
import { PhastCompareService } from './phast-compare.service';

const WALL: WallLoss = { surfaceArea: 100, ambientTemperature: 80, surfaceTemperature: 300, windVelocity: 0, surfaceEmissivity: 0.9, surfaceShape: 1, conditionFactor: 1, correctionFactor: 1 } as WallLoss;

function buildPhast(wallLosses: WallLoss[] | undefined): PHAST {
  return {
    operatingHours: { weeksPerYear: 52, daysPerWeek: 7, hoursPerYear: 8760 },
    operatingCosts: { fuelCost: 3.99, steamCost: 4.69, electricityCost: 0.066, coalCarbonCost: 0.06, electrodeCost: 3, otherFuelCost: 3.99 },
    losses: { wallLosses },
  } as PHAST;
}

describe('PhastCompareService.getBadges', () => {
  let service: PhastCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PhastCompareService, WallLossCompareService, SlagCompareService, OtherLossesCompareService, OpeningLossesCompareService,
        HeatSystemEfficiencyCompareService, GasLeakageCompareService, FlueGasCompareService, FixtureLossesCompareService,
        ExtendedSurfaceCompareService, ExhaustGasCompareService, EnergyInputCompareService, EnergyInputExhaustGasCompareService,
        CoolingLossesCompareService, ChargeMaterialCompareService, AuxiliaryPowerCompareService, AtmosphereLossesCompareService,
        OperationsCompareService,
      ],
    });
    service = TestBed.inject(PhastCompareService);
  });

  const badgeNames = (baseline: PHAST, modification: PHAST): string[] => service.getBadges(baseline, modification).map(badge => badge.modName);

  it('marks a loss type changed when the modification has none of it', () => {
    expect(badgeNames(buildPhast([WALL]), buildPhast(undefined))).toEqual(['Wall']);
  });

  it('marks a loss type changed when the modification has fewer or more items of it', () => {
    expect(badgeNames(buildPhast([WALL, WALL]), buildPhast([WALL]))).toEqual(['Wall']);
    expect(badgeNames(buildPhast([WALL]), buildPhast([WALL, WALL]))).toEqual(['Wall']);
  });

  it('compares items when both hold the same number', () => {
    expect(badgeNames(buildPhast([WALL]), buildPhast([{ ...WALL }]))).toEqual([]);
    expect(badgeNames(buildPhast([WALL]), buildPhast([{ ...WALL, surfaceArea: 50 }]))).toEqual(['Wall']);
  });
});
