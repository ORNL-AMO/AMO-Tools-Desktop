import { ChargeMaterial } from './losses/chargeMaterial';
import { WallLoss } from './losses/wallLoss';
import { AtmosphereLoss } from './losses/atmosphereLoss';
import { OtherLoss } from './losses/otherLoss';
import { FixtureLoss } from './losses/fixtureLoss';
import { OpeningLoss } from './losses/openingLoss';
import { CoolingLoss } from './losses/coolingLoss';
import { FlueGas } from './losses/flueGas';
import { LeakageLoss } from './losses/leakageLoss';
import { ExtendedSurface } from './losses/extendedSurface';
import { Slag } from './losses/slag';
import { AuxiliaryPowerLoss } from './losses/auxiliaryPowerLoss';
import { EnergyInput } from './losses/energyInput';
import { ExhaustGas } from './losses/exhaustGas';
import { AuxEquipment } from './auxEquipment';
import { MeteredEnergy } from './meteredEnergy';

export interface PHAST {
  name?: string,
  phastInputs?: PhastInputs,
  losses?: Losses
  modifications?: Modification[],
  setupDone?: boolean,
  auxEquipment?: AuxEquipment[],
  meteredEnergy?: MeteredEnergy
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
  flueGasLosses?: FlueGas[],
  otherLosses?: OtherLoss[],
  leakageLosses?: LeakageLoss[],
  extendedSurfaces?: ExtendedSurface[],
  slagLosses?: Slag[],
  auxiliaryPowerLosses?: AuxiliaryPowerLoss[],
  energyInput?: EnergyInput[],
  exhaustGas?: ExhaustGas[]
}

export interface Modification {
  phast?: PHAST,
  notes?: Notes
}

export interface Notes {
  chargeNotes?: string,
  wallNotes?: string,
  atmosphereNotes?: string,
  fixtureNotes?: string,
  openingNotes?: string,
  coolingNotes?: string,
  flueGasNotes?: string,
  otherNotes?: string,
  leakageNotes?: string,
  extendedNotes?: string,
  slagNotes?: string,
  auxiliaryPowerNotes?: string,
  exhaustGasNotes?: string
}