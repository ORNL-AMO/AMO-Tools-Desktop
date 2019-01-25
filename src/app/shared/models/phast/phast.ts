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
import { EnergyInputEAF } from './losses/energyInputEAF';
import { ExhaustGasEAF } from './losses/exhaustGasEAF';
import { AuxEquipment } from './auxEquipment';
import { MeteredEnergy } from './meteredEnergy';
import { DesignedEnergy } from './designedEnergy';
import { EnergyInputExhaustGasLoss } from './losses/energyInputExhaustGasLosses';
import { OperatingHours, OperatingCosts } from '../operations';
export interface PHAST {
  name?: string,
  //phastInputs?: PhastInputs,
  losses?: Losses
  modifications?: Modification[],
  setupDone?: boolean,
  auxEquipment?: AuxEquipment[],
  meteredEnergy?: MeteredEnergy,
  designedEnergy?: DesignedEnergy,
  operatingHours?: OperatingHours,
  systemEfficiency?: number,
  operatingCosts?: OperatingCosts,
  implementationCost?: number,
  disableSetupDialog?: boolean,
  equipmentNotes?: string
}


// export interface PhastInputs {
//   heatSource?: any,
//   energySource?: any,
//   operatingHours?: OperatingHours,
// }

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
  energyInputEAF?: EnergyInputEAF[],
  exhaustGasEAF?: ExhaustGasEAF[],
  energyInputExhaustGasLoss?: EnergyInputExhaustGasLoss[]
}

export interface Modification {
  phast?: PHAST,
  notes?: Notes,
  exploreOpportunities?: boolean;
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
  exhaustGasNotes?: string,
  energyInputExhaustGasNotes?: string,
  heatSystemEfficiencyNotes?: string,
  operationsNotes?: string
}

export interface PhastResults {
  totalInput: number,
  totalChargeMaterialLoss: number,
  totalWallLoss: number,
  totalOtherLoss: number,
  totalOpeningLoss: number,
  totalLeakageLoss: number,
  totalFixtureLoss: number,
  totalExtSurfaceLoss: number,
  totalCoolingLoss: number,
  totalAtmosphereLoss: number,
  totalFlueGas: number,
  totalSlag: number,
  totalAuxPower: number,
  totalEnergyInputEAF: number,
  totalEnergyInput: number,
  totalExhaustGas: number,
  totalExhaustGasEAF: number,
  totalSystemLosses: number,
  exothermicHeat: number,
  energyInputTotalChemEnergy: number,
  energyInputHeatDelivered: number,
  flueGasSystemLosses: number,
  flueGasGrossHeat: number,
  flueGasAvailableHeat: number,
  grossHeatInput: number,
  heatingSystemEfficiency: number,
  availableHeatPercent: number,
  electricalHeatDelivered?: number
}

export interface ShowResultsCategories {
  showSlag: boolean;
  showAuxPower: boolean;
  showSystemEff: boolean;
  showFlueGas: boolean;
  showEnInput1: boolean;
  showEnInput2: boolean;
  showExGas: boolean;
}

export interface ExecutiveSummary {
  percentSavings?: number,
  annualEnergyUsed?: number,
  energyPerMass?: number,
  annualEnergySavings?: number,
  annualCost?: number,
  annualCostSavings?: number,
  implementationCosts?: number,
  paybackPeriod?: number
}


export interface CalculatedByPhast {
  fuelEnergyUsed: number,
  energyIntensity: number,
  electricityUsed: number
}