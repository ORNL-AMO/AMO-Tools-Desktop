// Canonical, module-owned copy of the PHAST assessment shape. Duplicated from
// `shared/models/phast/phast.ts` (still used by the legacy `phast` module, dashboard,
// and report-rollup) so process-heating-assessment no longer reaches into shared/models
// for its own domain type. The nested per-loss-type interfaces are left imported from
// shared, unchanged: they are calculation-adapter shapes tied to the WASM suite and to
// the legacy `phast` module, not something this module owns.
import { ChargeMaterial } from '../../shared/models/phast/losses/chargeMaterial';
import { WallLoss } from '../../shared/models/phast/losses/wallLoss';
import { AtmosphereLoss } from '../../shared/models/phast/losses/atmosphereLoss';
import { OtherLoss } from '../../shared/models/phast/losses/otherLoss';
import { FixtureLoss } from '../../shared/models/phast/losses/fixtureLoss';
import { OpeningLoss } from '../../shared/models/phast/losses/openingLoss';
import { CoolingLoss } from '../../shared/models/phast/losses/coolingLoss';
import { FlueGas } from '../../shared/models/phast/losses/flueGas';
import { LeakageLoss } from '../../shared/models/phast/losses/leakageLoss';
import { ExtendedSurface } from '../../shared/models/phast/losses/extendedSurface';
import { Slag } from '../../shared/models/phast/losses/slag';
import { AuxiliaryPowerLoss } from '../../shared/models/phast/losses/auxiliaryPowerLoss';
import { EnergyInputEAF } from '../../shared/models/phast/losses/energyInputEAF';
import { ExhaustGasEAF } from '../../shared/models/phast/losses/exhaustGasEAF';
import { EnergyInputExhaustGasLoss } from '../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { MeteredEnergy } from '../../shared/models/phast/meteredEnergy';
import { DesignedEnergy } from '../../shared/models/phast/designedEnergy';
import { OperatingHours, OperatingCosts } from '../../shared/models/operations';
import { SavingsOpportunity } from '../../shared/models/explore-opps';

export interface PHAST {
  name?: string;
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
  selectedModificationId?: string;
}

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
  id: string;
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

export interface EAFResults {
  naturalGasUsed?: number;
  otherFuelUsed?: number;
  electricEnergyUsed?: number;
  totalFuelEnergyUsed?: number;
  coalCarbonUsed?: number;
  coalHeatingValue?: number;
  naturalGasHeatingValue?: number;
  electrodeEnergyUsed?: number;
  electrodeUse?: number;
  electrodeHeatingValue?: number;
}

export interface PhastCo2EmissionsOutput {
  hourlyTotalEmissionOutput: number;
  totalEmissionOutput: number;
  fuelEmissionOutput: number;
  electrodeEmissionsOutput: number;
  otherFuelEmissionsOutput: number;
  coalCarbonEmissionsOutput: number;
  electricityEmissionOutput: number;
  emissionsSavings: number;
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
  electricalHeaterLosses?: number;
  totalAdditionalFuelHeat?: number;
  totalProvidedElectricalHeat?: number;
  co2EmissionsOutput?: PhastCo2EmissionsOutput;
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
  inputExhaustValid: boolean;
  auxPowerValid: boolean;
}

export interface PhastCo2SavingsData {
  energyType: string;
  totalEmissionOutputRate: number;
  totalFuelEmissionOutputRate?: number;
  totalNaturalGasEmissionOutputRate?: number;
  totalCoalEmissionOutputRate?: number;
  totalOtherEmissionOutputRate?: number;
  coalFuelType?: string;
  eafOtherFuelSource?: string;
  otherFuelType?: string;
  electricityUse: number;
  energySource?: string;
  fuelType?: string;
  eGridRegion?: string;
  eGridSubregion?: string;
  totalEmissionOutput: number;
  userEnteredBaselineEmissions?: boolean;
  userEnteredModificationEmissions?: boolean;
  zipcode?: string;
  percentFuelUsage?: number;
  otherFuelMixedCO2SavingsData?: Array<PhastCo2SavingsData>;
}
