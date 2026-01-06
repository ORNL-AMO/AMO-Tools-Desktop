# CompressedAirAssessmentModificationResults

## Overview

The `CompressedAirAssessmentModificationResults` class evaluates the impact of energy efficiency measures (EEMs) on a compressed air system. It applies one or more modifications to the baseline system and calculates the resulting energy, cost, and emissions savings.

**Source File:** `modifications/CompressedAirAssessmentModificationResults.ts`

## Purpose

This class:
1. Applies energy efficiency measures to the baseline system
2. Calculates savings for each modification
3. Aggregates results across all day types
4. Provides comprehensive comparison between baseline and modified system performance
5. Calculates implementation costs and payback periods

## Class Properties

### Modification Summaries

#### modifiedDayTypeProfileSummaries
- **Type:** `Array<CompressedAirModifiedDayTypeProfileSummary>`
- **Description:** Detailed modification results for each day type, including all EEM calculations and adjusted profiles

### Baseline Totals

| Property | Type | Description |
|----------|------|-------------|
| totalBaselineCost | number | Total baseline annual energy cost |
| totalBaselinePower | number | Total baseline annual energy consumption |
| totalBaselineAnnualOperatingCost | number | Total baseline cost including demand charges |
| totalBaselineAnnualEmissionOutput | number | Total baseline annual CO2 emissions |
| baselineDemandCost | number | Baseline annual demand charges |

### Modified System Totals

| Property | Type | Description |
|----------|------|-------------|
| totalModificationCost | number | Total modified annual energy cost |
| totalModificationPower | number | Total modified annual energy consumption |
| totalModificationAnnualOperatingCost | number | Total modified cost including demand charges |
| totalModificationAnnualEmissionOutput | number | Total modified annual CO2 emissions |

### Savings

| Property | Type | Description |
|----------|------|-------------|
| totalCostSavings | number | Annual energy cost savings |
| totalPowerSavings | number | Annual energy savings |
| totalAnnualOperatingCostSavings | number | Total annual operating cost savings (including demand) |
| totalAnnualEmissionOutputSavings | number | Annual CO2 emission reductions |

### Other Properties

- **modification**: `Modification` - The modification configuration including all EEM settings
- **baselineDemandCost**: `number` - Baseline demand cost for comparison

## Constructor

```typescript
constructor(
  compressedAirAssessment: CompressedAirAssessment,
  modification: Modification,
  settings: Settings,
  _compressedAirCalculationService: CompressedAirCalculationService,
  _assessmentCo2SavingsService: AssessmentCo2SavingsService,
  compressedAirAssessmentBaselineResults?: CompressedAirAssessmentBaselineResults
)
```

**Parameters:**
- `compressedAirAssessment` - Complete system data
- `modification` - Configuration of EEMs to apply
- `settings` - Application settings
- `_compressedAirCalculationService` - Calculation service
- `_assessmentCo2SavingsService` - Emissions calculation service
- `compressedAirAssessmentBaselineResults` (optional) - Pre-calculated baseline; if not provided, it will be calculated

**Process Flow:**
1. Calculate or use provided baseline results
2. Create modified day type summaries by applying EEMs to each day type
3. Aggregate savings across all day types
4. Calculate total system savings

## Key Methods

### setModifiedDayTypeProfileSummaries()

Creates a `CompressedAirModifiedDayTypeProfileSummary` for each day type by applying all enabled EEMs.

**Process:**
- Iterates through each day type
- Applies modifications in the configured order
- Calculates cumulative impact of all EEMs
- Stores results for each day type

### setTotals()

Aggregates savings across all day types and calculates system-wide totals.

**Calculations:**

1. **Baseline Totals** (from baseline results):
   - Energy cost
   - Energy consumption
   - Annual operating cost
   - Annual emissions

2. **Modified System Totals** (sum across all modified day types):
   - Modified energy cost
   - Modified energy consumption
   - Modified emissions

3. **Savings** (baseline - modified):
   - Cost savings
   - Energy savings
   - Operating cost savings (including demand charge impacts)
   - Emission reductions

4. **Peak Demand Adjustments**:
   - Identifies new peak demand across modified day types
   - Calculates modified demand charges
   - Computes demand cost savings

### getModificationResults()

Returns a structured summary of modification results.

**Returns:** `CompressedAirAssessmentResult`

**Includes:**
- Day-type specific modification results
- Total baseline and modified system metrics
- Total savings
- Modification configuration

## Energy Efficiency Measures (EEMs)

The modification system supports multiple types of energy efficiency measures, applied in a configurable order:

### 1. Reduce Air Leaks

**Purpose:** Models the impact of fixing compressed air leaks

**Configuration:**
- `leakFlow` - Current leak rate (CFM or m³/min)
- `leakReduction` - Percentage of leaks to be fixed (0-100%)
- `implementationCost` - Cost to implement leak repairs

**Impact:**
- Reduces system air demand
- Lowers compressor power consumption
- May allow compressors to run in more efficient modes

**Source:** `energyEfficiencyMeasures/ReduceAirLeaksResults.ts`

### 2. Reduce System Air Pressure

**Purpose:** Evaluates lowering the system discharge pressure

**Configuration:**
- `averageSystemPressureReduction` - Pressure reduction amount (psi or bar)
- `implementationCost` - Cost to implement changes

**Impact:**
- Reduces compressor power consumption (proportional to pressure reduction)
- Adjusts performance points for all compressors
- Affects both full load and max flow pressure settings

**Source:** `energyEfficiencyMeasures/ReduceSystemAirPressureResults.ts`

### 3. Improve End-Use Efficiency

**Purpose:** Models improvements to air-consuming equipment

**Configuration:**
- `reductionType` - Type of reduction (flow or run time)
- `reductionData` - Array of reduction amounts by time interval
- `implementationCost` - Cost to implement improvements

**Impact:**
- Reduces air demand at specific times or across the profile
- Can shift compressor loading patterns
- May allow compressors to operate more efficiently

**Source:** `energyEfficiencyMeasures/ImproveEndUseEfficiencyResults.ts`

### 4. Use Automatic Sequencer

**Purpose:** Implements coordinated compressor control

**Configuration:**
- `targetPressure` - Desired system pressure setpoint
- `variance` - Pressure control band
- `profileSummary` - Target air flow profile
- `implementationCost` - Cost for sequencer and installation

**Impact:**
- Optimizes compressor loading order
- Minimizes part-load operation
- Reduces blow-off and unloaded running time
- Improves pressure control

**Source:** `energyEfficiencyMeasures/UseAutomaticSequencerResults.ts`

### 5. Adjust Cascading Set Points

**Purpose:** Optimizes pressure set points for multiple compressors

**Configuration:**
- `setPointData` - Array of compressor-specific pressure setpoints
- `implementationCost` - Cost to adjust controls

**Impact:**
- Establishes optimal load/unload sequence
- Minimizes system pressure while meeting demand
- Reduces compressor cycling
- Improves overall efficiency

**Source:** `energyEfficiencyMeasures/AdjustCascadingSetPointsSavingsResults.ts`

### 6. Replace Compressor

**Purpose:** Models replacing an existing compressor with a more efficient unit

**Configuration:**
- `compressorId` - ID of compressor to replace
- `replaceWith` - New compressor specifications
- `implementationCost` - Cost of new compressor and installation

**Impact:**
- Changes compressor performance characteristics
- Typically improves specific power (kW per CFM)
- May enable different control strategies
- Updates system capacity

**Source:** `energyEfficiencyMeasures/ReplaceCompressorResults.ts`

### 7. Add Receiver Volume

**Purpose:** Evaluates adding compressed air storage capacity

**Configuration:**
- `additionalVolume` - Storage volume to add (gallons or liters)
- `implementationCost` - Cost of receiver and installation

**Impact:**
- Reduces compressor cycling
- Improves pressure stability
- Allows better handling of transient demands
- May reduce peak power demand

**Source:** `energyEfficiencyMeasures/FlowReallocationResults.ts`

### 8. Flow Reallocation

**Purpose:** Optimizes distribution of air flow among compressors

**Configuration:**
- Automatically calculated based on compressor characteristics
- `implementationCost` - Cost if control changes needed

**Impact:**
- Assigns load to most efficient compressors first
- Minimizes part-load operation
- Balances compressor utilization
- Reduces total system power consumption

**Source:** `energyEfficiencyMeasures/FlowReallocationResults.ts`

## Modification Order

EEMs are applied sequentially, with each building on the results of the previous one. The order matters because:

1. Earlier modifications affect the baseline for later ones
2. Savings are calculated incrementally
3. Interactive effects are captured accurately

**Typical Order:**
1. Flow Reallocation (initial optimization)
2. Reduce Air Leaks
3. Reduce System Air Pressure
4. Improve End-Use Efficiency
5. Use Automatic Sequencer
6. Adjust Cascading Set Points
7. Replace Compressor
8. Add Receiver Volume

The order can be configured via the modification's `order` properties for each EEM.

## Day Type Breakdown

Like baseline calculations, modifications are evaluated separately for each day type:

- Each day type may have different EEM impacts
- Day-specific load profiles affect savings
- Results are aggregated for annual totals

This approach ensures accurate representation of varying operational patterns.

## Savings Calculation

For each EEM and for the overall modification:

```typescript
interface EemSavingsResults {
  baselineResults: SavingsItem;     // Before this EEM
  adjustedResults: SavingsItem;     // After this EEM
  savings: SavingsItem;              // Difference
  implementationCost: number;        // Cost to implement
  paybackPeriod: number;             // Years to recover cost
  dayTypeId: string;                 // Associated day type
}

interface SavingsItem {
  cost: number;                      // Annual energy cost
  power: number;                     // Annual energy consumption
  annualEmissionOutput?: number;     // Annual CO2 emissions
  annualEmissionOutputSavings?: number;
  percentSavings?: number;           // Percentage reduction
}
```

**Payback Calculation:**
```
paybackPeriod = implementationCost / annualCostSavings
```

## Peak Demand Handling

Peak demand calculations are critical for accurate cost projections:

1. **Baseline Peak Demand** - Maximum demand across all baseline day types
2. **Modified Peak Demand** - Maximum demand across all modified day types
3. **Demand Cost Impact** - Difference in monthly demand charges

```typescript
peakDemand = max(allDayTypes.peakDemand)
demandCost = peakDemand × 12 months × demandRate
```

Some modifications (like sequencers or pressure reduction) can reduce peak demand, providing additional savings beyond energy cost.

## Validation

The system includes validation for modified profiles:

- **ResultingSystemProfileValidation** - Ensures modified profiles are achievable
- Checks for:
  - Pressure requirements met
  - Capacity constraints satisfied
  - Compressor operating limits respected
  - Storage capacity adequate for demand fluctuations

Invalid configurations are flagged for user review.

## Usage Example

```typescript
// Create modification configuration
const modification: Modification = {
  name: "Efficiency Improvement Package",
  reduceAirLeaks: {
    leakFlow: 200,           // CFM
    leakReduction: 50,        // 50% reduction
    implementationCost: 15000
  },
  reduceSystemAirPressure: {
    averageSystemPressureReduction: 10,  // 10 psi
    implementationCost: 5000
  },
  // ... other EEMs
};

// Calculate modification results
const modResults = new CompressedAirAssessmentModificationResults(
  assessment,
  modification,
  settings,
  calculationService,
  co2Service
);

// Access results
console.log(`Annual Savings: $${modResults.totalCostSavings}`);
console.log(`Energy Reduction: ${modResults.totalPowerSavings} kWh`);
console.log(`Payback: ${modification.totalImplementationCost / modResults.totalCostSavings} years`);
```

## Related Classes

- **CompressedAirAssessmentBaselineResults** - Baseline calculations
- **CompressedAirModifiedDayTypeProfileSummary** - Day-type specific modification results
- **CompressedAirEemSavingsResult** - Individual EEM savings tracking
- **FlowReallocationResults** - Flow optimization calculations

## Notes

- Modifications are applied to a copy of the baseline; the original baseline is preserved
- All EEMs can be enabled/disabled independently
- Implementation costs are user-configurable
- Payback periods are calculated using simple payback (no discounting)
- Emission savings use the same factors as baseline calculations
- Results are always calculated in the system's configured units

---

[← Back to Index](./index.md)
