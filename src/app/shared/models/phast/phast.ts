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
import { SavingsOpportunity } from '../explore-opps';

export interface PHAST {
  name?: string;
  //phastInputs?: PhastInputs,
  losses?: Losses;
  modifications?: Modification[];
  setupDone?: boolean;
  auxEquipment?: AuxEquipment[];
  meteredEnergy?: MeteredEnergy;
  designedEnergy?: DesignedEnergy;
  operatingHours?: OperatingHours;
  systemEfficiency?: number;
  operatingCosts?: OperatingCosts;
  implementationCost?: number;
  disableSetupDialog?: boolean;
  equipmentNotes?: string;
  dataUpdated?: boolean;
  lossDataUnits?: string;
  valid?: PhastValid;
  co2SavingsData?: PhastCo2SavingsData;
}


// export interface PhastInputs {
//   heatSource?: any,
//   energySource?: any,
//   operatingHours?: OperatingHours,
// }

export interface Losses {
  chargeMaterials?: ChargeMaterial[];
  wallLosses?: WallLoss[];
  atmosphereLosses?: AtmosphereLoss[];
  fixtureLosses?: FixtureLoss[];
  openingLosses?: OpeningLoss[];
  coolingLosses?: CoolingLoss[];
  flueGasLosses?: FlueGas[];
  otherLosses?: OtherLoss[];
  leakageLosses?: LeakageLoss[];
  extendedSurfaces?: ExtendedSurface[];
  slagLosses?: Slag[];
  auxiliaryPowerLosses?: AuxiliaryPowerLoss[];
  energyInputEAF?: EnergyInputEAF[];
  exhaustGasEAF?: ExhaustGasEAF[];
  energyInputExhaustGasLoss?: EnergyInputExhaustGasLoss[];
}

export interface Modification {
  phast?: PHAST;
  notes?: Notes;
  exploreOpportunities?: boolean;
  exploreOppsShowFlueGas?: SavingsOpportunity;
  exploreOppsShowAirTemp?: SavingsOpportunity;
  exploreOppsShowMaterial?: SavingsOpportunity;
  exploreOppsShowAllTimeOpen?: SavingsOpportunity;
  exploreOppsShowOpening?: SavingsOpportunity;
  exploreOppsShowAllEmissivity?: SavingsOpportunity;
  exploreOppsShowCooling?: SavingsOpportunity;
  exploreOppsShowAtmosphere?: SavingsOpportunity;
  exploreOppsShowOperations?: SavingsOpportunity;
  exploreOppsShowLeakage?: SavingsOpportunity;
  exploreOppsShowSlag?: SavingsOpportunity;
  exploreOppsShowEfficiencyData?: SavingsOpportunity;
  exploreOppsShowWall?: SavingsOpportunity;
  exploreOppsShowAllTemp?: SavingsOpportunity;
  exploreOppsShowFixtures?: SavingsOpportunity;
}

export interface Notes {
  chargeNotes?: string;
  wallNotes?: string;
  atmosphereNotes?: string;
  fixtureNotes?: string;
  openingNotes?: string;
  coolingNotes?: string;
  flueGasNotes?: string;
  otherNotes?: string;
  leakageNotes?: string;
  extendedNotes?: string;
  slagNotes?: string;
  auxiliaryPowerNotes?: string;
  exhaustGasNotes?: string;
  energyInputExhaustGasNotes?: string;
  heatSystemEfficiencyNotes?: string;
  operationsNotes?: string;
}

export interface PhastResults {
  totalInput: number;
  totalChargeMaterialLoss: number;
  totalWallLoss: number;
  totalOtherLoss: number;
  totalOpeningLoss: number;
  totalLeakageLoss: number;
  totalFixtureLoss: number;
  totalExtSurfaceLoss: number;
  totalCoolingLoss: number;
  totalAtmosphereLoss: number;
  totalFlueGas: number;
  totalSlag: number;
  totalAuxPower: number;
  totalEnergyInputEAF: number;
  totalEnergyInput: number;
  totalExhaustGas: number;
  totalExhaustGasEAF: number;
  hourlyEAFResults: EAFResults;
  annualEAFResults: EAFResults;
  totalSystemLosses: number;
  energyInputTotal: number;
  exothermicHeat: number;
  energyInputTotalChemEnergy: number;
  energyInputHeatDelivered: number;
  flueGasSystemLosses: number;
  flueGasGrossHeat: number;
  flueGasAvailableHeat: number;
  grossHeatInput: number;
  heatingSystemEfficiency: number;
  calculatedExcessAir: number;
  calculatedFlueGasO2: number;
  availableHeatPercent: number;
  electricalHeatDelivered?: number;
  co2EmissionsOutput?: PhastCo2EmissionsOutput
}

export interface EAFResults {
  naturalGasUsed?: number;
  otherFuelUsed?: number;
  electricEnergyUsed?: number;
  totalFuelEnergyUsed?: number;
  coalCarbonUsed?: number;
  coalHeatingValue?: number;
  naturalGasHeatingValue?: number;
  electrodeUsed?: number;
  electrodeHeatingValue?: number;
}

export interface PhastCo2EmissionsOutput {
  hourlyTotalEmissionOutput: number,
  totalEmissionOutput: number,
  fuelEmissionOutput: number,
  electrodeEmissionsOutput: number,
  otherFuelEmissionsOutput: number,
  coalCarbonEmissionsOutput: number,
  electricityEmissionOutput: number,
  emissionsSavings: number,
}

export interface ShowResultsCategories {
  showSlag: boolean;
  showAuxPower: boolean;
  showSystemEff: boolean;
  showFlueGas: boolean;
  showEnInput1: boolean;
  showEnInput2: boolean;
  showExGas: boolean;
  showHeatDelivered?: boolean;
  showElectricalDelivered?: boolean;
  showChemicalEnergyDelivered?: boolean;
}

export interface ExecutiveSummary {
  percentSavings?: number;
  annualEnergyUsed?: number;
  energyPerMass?: number;
  annualEnergySavings?: number;
  annualCost?: number;
  annualCarbonCoalCost?: number,
  annualNaturalGasCost?: number,
  annualElectrodeCost?: number,
  annualOtherFuelCost?: number,
  annualTotalFuelCost?: number,
  annualElectricityCost?: number,
  annualCostSavings?: number;
  implementationCosts?: number;
  paybackPeriod?: number;
  co2EmissionsOutput?: PhastCo2EmissionsOutput;
}


export interface CalculatedByPhast {
  fuelEnergyUsed: number;
  energyIntensity: number;
  electricityUsed: number;
}

export interface PhastValid {
  isValid: boolean;
  chargeMaterialValid: boolean;
  flueGasValid: boolean;
  fixtureValid: boolean;
  wallValid: boolean;
  coolingValid: boolean;
  atmosphereValid: boolean;
  openingValid: boolean;
  leakageValid: boolean;
  extendedSurfaceValid: boolean;
  otherValid: boolean;
  operationsValid: boolean;
  systemEfficiencyValid: boolean;
  slagValid: boolean;
  energyInputValid: boolean;
  exhaustGasValid: boolean;
  inputExhaustValid: boolean
  auxPowerValid: boolean;
}

export interface PhastCo2SavingsData {
  energyType: string;
  totalEmissionOutputRate: number;
  totalFuelEmissionOutputRate?: number,
  totalNaturalGasEmissionOutputRate?: number,
  totalCoalEmissionOutputRate?: number,
  totalOtherEmissionOutputRate?: number,
  coalFuelType?: string;
  eafOtherFuelSource?: string,
  otherFuelType?: string;
  electricityUse: number;
  energySource?: string;
  fuelType?: string;
  eGridRegion?: string;
  eGridSubregion?: string;
  totalEmissionOutput: number;
  userEnteredBaselineEmissions?: boolean;
  userEnteredModificationEmissions?: boolean;
  zipcode?: string,
  percentFuelUsage?: number,
  otherFuelMixedCO2SavingsData?: Array<PhastCo2SavingsData>,
}