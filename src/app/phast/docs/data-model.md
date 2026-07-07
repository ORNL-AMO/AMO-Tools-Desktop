# PHAST — Data Model

## Top-Level Structure

```typescript
// src/app/shared/models/phast/phast.ts
interface PHAST {
  name?: string;
  losses?: Losses;                    // all heat-balance loss entries
  modifications?: Modification[];     // named scenarios (each holds a full nested PHAST)
  setupDone?: boolean;                // persisted flag; unlocks Analysis and Report tabs
  auxEquipment?: AuxEquipment[];
  meteredEnergy?: MeteredEnergy;
  designedEnergy?: DesignedEnergy;
  operatingHours?: OperatingHours;
  systemEfficiency?: number;          // % — only used for Electric/Resistance heater mode
  operatingCosts?: OperatingCosts;
  implementationCost?: number;
  disableSetupDialog?: boolean;       // true after welcome screen is dismissed
  lossDataUnits?: string;             // 'Imperial' | 'Metric' — unit system of stored values
  valid?: PhastValid;                 // cached validation result
  co2SavingsData?: PhastCo2SavingsData;
  selectedModificationId?: string;
}
```

All monetary and loss values stored in `PHAST` are in **Imperial units** regardless of the user's unit setting. The `lossDataUnits` field records the current stored unit system and is updated by `ConvertPhastService` at load/save time.

## Losses

Each loss category is an array (multiple instances are supported for most categories):

```typescript
interface Losses {
  chargeMaterials?: ChargeMaterial[];         // charge/load materials (gas, liquid, or solid)
  wallLosses?: WallLoss[];
  atmosphereLosses?: AtmosphereLoss[];
  fixtureLosses?: FixtureLoss[];
  openingLosses?: OpeningLoss[];              // circular or rectangular openings
  coolingLosses?: CoolingLoss[];              // gas or liquid cooling medium
  flueGasLosses?: FlueGas[];                 // by volume or by mass
  otherLosses?: OtherLoss[];
  leakageLosses?: LeakageLoss[];
  extendedSurfaces?: ExtendedSurface[];
  slagLosses?: Slag[];                        // EAF only
  auxiliaryPowerLosses?: AuxiliaryPowerLoss[];
  energyInputEAF?: EnergyInputEAF[];          // EAF only
  exhaustGasEAF?: ExhaustGasEAF[];            // EAF only
  energyInputExhaustGasLoss?: EnergyInputExhaustGasLoss[];  // electric + fuel combined mode
}
```

## Key Sub-Models

### ChargeMaterial

A discriminated union — `chargeMaterialType` selects which sub-shape is populated:

| `chargeMaterialType` | Sub-model | Key fields |
|---|---|---|
| `'Gas'` | `GasChargeMaterial` | `feedRate` (SCFH), `specificHeatGas`, `initialTemperature`, `dischargeTemperature` |
| `'Liquid'` | `LiquidChargeMaterial` | `chargeFeedRate` (lb/hr), `specificHeatLiquid`, `latentHeat`, `vaporizingTemperature` |
| `'Solid'` | `SolidChargeMaterial` | `chargeFeedRate` (lb/hr), `specificHeatSolid`, `meltingPoint`, `waterContentCharged` |

Note: `feedRate` and `chargeFeedRate` serve equivalent purposes but the field name differs by sub-type — both represent mass/volume flow rate.

### FlueGas

`flueGasType` selects the sub-shape:

| `flueGasType` | Sub-model | Notes |
|---|---|---|
| `'By Volume'` | `FlueGasByVolume` | Gas composition by percentage volume (CH4, C2H6, N2, H2, etc.) |
| `'By Mass'` | `FlueGasByMass` | Elemental composition (carbon, hydrogen, sulphur, etc.) |

Both sub-models accept `oxygenCalculationMethod` of either `'Oxygen in Flue Gas'` or `'Excess Air'`. Several fields have alias names that match the C++ suite API naming (e.g., `ambientAirTempF` = `ambientAirTemp`, `combAirMoisturePerc` = `moistureInAirCombustion`); both forms may be present simultaneously.

### WallLoss

```typescript
interface WallLoss {
  surfaceArea?: number;           // ft²
  ambientTemperature?: number;    // °F
  surfaceTemperature?: number;    // °F
  windVelocity?: number;          // mph
  surfaceEmissivity?: number;     // dimensionless, 0–1
  surfaceShape?: number;          // enum: 0 = long cylinder, 1 = large flat, 2 = small object
  conditionFactor?: number;
  correctionFactor?: number;
  availableHeat?: number;         // stored result (computed, not user-entered)
}
```

### CoolingLoss

`coolingLossType` selects `'Gas'` → `GasCoolingLoss` or `'Liquid'` → `LiquidCoolingLoss`. Both sub-models have `initialTemperature` and `flowRate` but liquid uses `finalTemperature` while gas uses `outletTemperature` for the outlet value.

### DesignedEnergy

```typescript
interface DesignedEnergy {
  zones: DesignedZone[];     // one or more furnace zones
  fuel?: boolean;
  steam?: boolean;
  electricity?: boolean;     // active energy-type flags
}
interface DesignedZone {
  name: string;
  designedEnergyFuel: DesignedEnergyFuel;
  designedEnergySteam: DesignedEnergySteam;
  designedEnergyElectricity: DesignedEnergyElectricity;
}
```

Each zone sub-model holds `percentCapacityUsed` and `operatingHours`; the active energy type is determined by the boolean flags on `DesignedEnergy`.

### MeteredEnergy

```typescript
interface MeteredEnergy {
  fuel?: boolean;
  steam?: boolean;
  electricity?: boolean;
  meteredEnergyFuel?: MeteredEnergyFuel;
  meteredEnergySteam?: MeteredEnergySteam;
  meteredEnergyElectricity?: MeteredEnergyElectricity;
}
```

The relevant sub-model is selected by the boolean flags. `MeteredEnergyFuel.collectionTime` is the measurement period in hours; `fuelEnergy` is the total fuel energy used in that period (Btu).

### OperatingHours / OperatingCosts

```typescript
interface OperatingHours {
  weeksPerYear?: number;
  daysPerWeek?: number;
  hoursPerDay?: number;
  hoursPerYear?: number;     // pre-computed; used by most calculations
}
interface OperatingCosts {
  fuelCost?: number;         // $/MMBtu
  steamCost?: number;        // $/Mlb
  electricityCost?: number;  // $/kWh
  coalCarbonCost?: number;   // EAF only
  electrodeCost?: number;    // EAF only
}
```

### Modification

```typescript
interface Modification {
  id: string;
  phast?: PHAST;                        // full nested copy of the loss data for this scenario
  notes?: Notes;
  exploreOpportunities?: boolean;       // true = Explore Opportunities mode; false = Modify Conditions
  exploreOppsShowFlueGas?: SavingsOpportunity;
  exploreOppsShowAirTemp?: SavingsOpportunity;
  // ... one exploreOppsShow* per category
}
interface SavingsOpportunity {
  hasOpportunity: boolean;
  display: string;
}
```

Each `Modification` holds a complete `phast: PHAST` snapshot. There is no diff structure — the entire loss tree is duplicated per scenario.

## PhastResults

`PhastResultsService.getResults(phast, settings)` returns a `PhastResults` object. All energy totals are in MMBtu/hr (Imperial). Key computed fields:

| Field | Description |
|---|---|
| `grossHeatInput` | Total energy input to the furnace |
| `heatingSystemEfficiency` | % — ratio of useful heat to gross input |
| `availableHeatPercent` | % — heat available after flue-gas losses |
| `calculatedExcessAir` | % excess air from flue-gas calculation |
| `hourlyEAFResults` / `annualEAFResults` | EAF-specific breakdown; only populated for EAF furnace types |

`heatingSystemEfficiency` is a **computed field that is not persisted** — it is recalculated every time `getResults` is called.

## PhastValid

`PhastValidService.checkValid(phast, settings)` returns:

```typescript
interface PhastValid {
  isValid: boolean;
  operationsValid: boolean;
  chargeMaterialValid: boolean;
  flueGasValid: boolean;
  fixtureValid: boolean;
  wallValid: boolean;
  coolingValid: boolean;
  atmosphereValid: boolean;
  openingValid: boolean;
  leakageValid: boolean;
  extendedValid: boolean;
  otherValid: boolean;
  energyInputValid: boolean;
  systemEfficiencyValid: boolean;
  slagValid: boolean;
  exhaustGasValid: boolean;
  inputExhaustValid: boolean;
  auxPowerValid: boolean;
}
```

Validation is not based on the Angular form state — `PhastValidService` rebuilds reactive form groups internally from the stored data and calls `formGroup.valid`. This means validation is always recomputed from the persisted model, not from live form controls.

## Units of Measure

| Context | Unit system | Notes |
|---|---|---|
| `PHAST.losses` (storage) | Imperial | Always. `lossDataUnits` records the current state |
| Form display | User setting | `PhastService` methods convert before each calculation call |
| API calls (`ProcessHeatingApiService`) | Imperial | `PhastService` converts Metric → Imperial before every API call |
| Report output | User setting | `ConvertPhastService` converts results back for display |

Temperature: °F (storage) / °C (display when Metric)  
Energy: Btu/hr or MMBtu (storage) / kJ or GJ (display when Metric)  
Mass flow: lb/hr (storage) / kg/hr (display when Metric)

## Default Values

Default loss values come from the per-loss form services (e.g., `WallFormService.initForm()`, `CoolingFormService.initForm()`). There is no single defaults file — each loss type's form service owns its own `initForm()` which sets Angular `FormControl` default values. Material properties (specific heat, etc.) default to zero and must be selected from the material database (`FlueGasMaterialDbService`, `SolidLiquidMaterialDbService`).
