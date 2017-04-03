import { ChargeMaterial } from './losses/chargeMaterial';
import { WallLoss } from './losses/wallLoss';
import { AtmosphereLoss } from './losses/atmosphereLoss';
import { OtherLoss } from './losses/otherLoss';
import { FixtureLoss } from './losses/fixtureLoss';
import { OpeningLoss } from './losses/openingLoss';
import { CoolingLoss } from './losses/coolingLoss';
import { HeatStorage } from './losses/heatStorage';
import { FlueGas } from './losses/flueGas';
import { LeakageLoss } from './losses/leakageLoss';
import { ExtendedSurface } from './losses/extendedSurface';

export interface PHAST {
  name?: string,
  phastInputs?: PhastInputs,
  losses?: Losses
  modifications?: Modification[]
}

export interface PhastInputs {
  heatSource?: any,
  energySource?: any,
  operatingHoursPerYear?: number
}

export interface Losses {
  chargeMaterials?: ChargeMaterial[],
  wallLosses?: WallLoss[],
  atmosphereLosses?: AtmosphereLoss[],
  fixtureLosses?: FixtureLoss[],
  openingLosses?: OpeningLoss[],
  coolingLosses?: CoolingLoss[],
  heatStorageLosses?: HeatStorage[],
  flueGasLosses?: FlueGas[],
  otherLosses?: OtherLoss[],
  leakageLosses?: LeakageLoss[],
  extendedSurfaces?: ExtendedSurface[]
}

export interface Modification {
  losses?: Losses,
  name?: string
}