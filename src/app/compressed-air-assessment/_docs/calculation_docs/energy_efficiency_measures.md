# Energy Efficiency Measures (EEMs)

## Overview

Energy Efficiency Measures (EEMs) are modifications that can be applied to a compressed air system to reduce energy consumption, costs, and emissions. The system supports multiple EEMs that can be applied individually or in combination, with each building on the results of previous measures.

**Source Files:** `modifications/energyEfficiencyMeasures/` directory

## Purpose

The EEM system:
1. Models the impact of system improvements
2. Calculates energy and cost savings for each measure
3. Determines implementation costs and payback periods
4. Validates feasibility of proposed changes
5. Enables comparison of different improvement strategies

## EEM Application Order

EEMs are applied sequentially, with each measure building on the adjusted system from the previous measure. The order matters because:

- Earlier changes affect the baseline for later measures
- Interactive effects are captured accurately
- Cumulative savings are calculated correctly

**Typical Order:**
1. Flow Reallocation
2. Reduce Air Leaks
3. Reduce System Air Pressure
4. Improve End-Use Efficiency
5. Reduce Run Time
6. Use Automatic Sequencer
7. Adjust Cascading Set Points
8. Replace Compressor
9. Add Receiver Volume

## Individual Energy Efficiency Measures

### 1. Flow Reallocation

**File:** `FlowReallocationResults.ts`

**Purpose:** Optimizes distribution of air flow among available compressors

**How It Works:**
- Analyzes each time interval's air demand
- Assigns load to most efficient compressors first
- Minimizes part-load operation
- Balances compressor utilization

**Configuration:**
- Automatically calculated based on compressor characteristics
- `implementationCost` - Cost of control system changes (if needed)

**Algorithm:**
1. For each time interval:
   a. Determine total air flow demand
   b. Sort compressors by specific power (efficiency)
   c. Load most efficient compressor first
   d. Continue loading compressors until demand is met
   e. Use most efficient control mode for each compressor

2. Calculate power consumption for optimized allocation

3. Compare to baseline allocation

**Savings Calculation:**
```
powerSavings = baselinePower - optimizedPower
costSavings = powerSavings × electricityRate × operatingHours
```

**Typical Savings:** 5-15% of baseline energy

**Implementation Considerations:**
- May require control system upgrades
- Requires coordination among compressors
- Benefits increase with more compressors in system
- Most effective when compressors have varying efficiency

### 2. Reduce Air Leaks

**File:** `ReduceAirLeaksResults.ts`

**Purpose:** Models the impact of fixing compressed air leaks

**How It Works:**
- Reduces system air demand by leak reduction amount
- Reallocates flow based on reduced demand
- Calculates energy savings from lower demand

**Configuration:**
- `leakFlow` - Current total leak rate (CFM or m³/min)
- `leakReduction` - Percentage of leaks to be fixed (0-100%)
- `implementationCost` - Cost of leak detection and repairs

**Calculation:**
```
reducedAirflow = originalAirflow - (leakFlow × leakReduction / 100)

For each time interval:
  adjustedDemand[interval] = baseDemand[interval] - leakReduction
  if adjustedDemand[interval] < 0:
    adjustedDemand[interval] = 0
```

**Savings:**
- Direct: Reduced compressor power from lower demand
- Indirect: May allow compressor to operate in more efficient mode
- Potential: May enable downsizing or shutting off compressors

**Typical Savings:** 10-25% of baseline energy

**Implementation Considerations:**
- Requires leak detection survey (ultrasonic leak detector)
- Tag and track leaks for repair
- Ongoing maintenance program needed to sustain savings
- Quick payback (typically 3-12 months)

### 3. Reduce System Air Pressure

**File:** `ReduceSystemAirPressureResults.ts`

**Purpose:** Evaluates lowering the system discharge pressure

**How It Works:**
- Reduces discharge pressure for all compressors
- Adjusts compressor performance points
- Calculates power reduction from lower pressure ratio
- Validates that demand can still be met

**Configuration:**
- `averageSystemPressureReduction` - Pressure reduction (psi or bar)
- `implementationCost` - Cost of control adjustments and validation

**Calculation:**

For each compressor:
```
newPressure = currentPressure - pressureReduction

Power reduction (approximate):
powerReduction = basePower × (1 - (newPressureRatio / oldPressureRatio)^0.286)

where:
pressureRatio = (dischargePressure + atmosphericPressure) / atmosphericPressure
```

**Impact on Compressors:**
- Full load pressure reduced
- Max full flow pressure reduced (if applicable)
- All performance points recalculated for new pressure

**Savings:**
- Direct relationship between pressure and power
- Rule of thumb: 1% energy savings per 2 psi reduction
- Savings apply to all operating modes

**Typical Savings:** 5-10% of baseline energy (for 10-20 psi reduction)

**Implementation Considerations:**
- Verify all end uses can operate at lower pressure
- Check for pressure drop issues in distribution system
- May reveal hidden problems (leaks, restrictions)
- Monitor closely during implementation
- Consider pressure regulators for high-pressure users

**Cautions:**
- Some processes may require minimum pressure
- Distribution losses may limit feasibility
- Oversized piping may be needed if pressure drop is excessive

### 4. Improve End-Use Efficiency

**File:** `ImproveEndUseEfficiencyResults.ts`

**Purpose:** Models improvements to air-consuming equipment

**How It Works:**
- Reduces air demand at specific times or intervals
- Can model equipment upgrades, process changes, or operational improvements
- Reallocates flow based on reduced demand

**Configuration:**
- `reductionType` - Type of reduction:
  - `Flow Meter Method` - Measured flow reductions
  - `Nameplate Method` - Calculated from equipment specifications
- `reductionData` - Array of reduction amounts by time interval
- `implementationCost` - Cost of equipment upgrades

**Calculation:**

For each time interval:
```
adjustedAirflow = baselineAirflow - reductionAmount[interval]

if adjustedAirflow < 0:
  adjustedAirflow = 0
```

**Examples of End-Use Improvements:**
- Replace pneumatic tools with more efficient models
- Add nozzles or engineered solutions for blowoff applications
- Optimize pneumatic cylinder sizing
- Use electric actuators instead of pneumatic where feasible
- Improve process controls to reduce waste

**Savings:**
- Proportional to demand reduction
- May enable operating fewer compressors
- Can reduce cycling and part-load operation

**Typical Savings:** Highly variable, 5-30% depending on improvements

**Implementation Considerations:**
- Requires detailed end-use assessment
- May involve capital equipment purchases
- Payback varies widely by improvement type
- Often combined with other measures

### 5. Use Automatic Sequencer

**File:** `UseAutomaticSequencerResults.ts`

**Purpose:** Implements coordinated control of multiple compressors

**How It Works:**
- Coordinates compressor operation to optimize efficiency
- Controls which compressors run based on demand
- Manages load/unload cycles to minimize inefficiency
- Maintains target pressure with tight control band

**Configuration:**
- `targetPressure` - Desired system pressure setpoint (psi or bar)
- `variance` - Pressure control band (± psi or bar)
- `profileSummary` - Optional target profile for sequencer to follow
- `implementationCost` - Cost of sequencer and installation

**Calculation:**

1. Adjust compressor setpoints:
```
For each compressor:
  fullLoadPressure = targetPressure - variance
  unloadPressure = targetPressure + variance
```

2. Simulate sequencer operation:
   - Most efficient compressor becomes base load
   - Additional compressors staged in order of efficiency
   - Trim compressor modulates to meet variable demand
   - Non-essential compressors kept off

3. Calculate power based on optimized staging

**Sequencer Benefits:**
- Eliminates compressors fighting each other
- Reduces excessive cycling
- Minimizes blow-off and unloaded running
- Improves pressure stability
- Enables targeting specific compressors as base/trim

**Savings:**
- Reduced part-load operation: 5-15%
- Eliminated blow-off: 5-10%
- Reduced cycling losses: 2-5%
- Total typical savings: 10-25%

**Implementation Considerations:**
- Requires compatible compressor controls
- May need pressure transducers and communication
- Programming and commissioning critical for success
- Monitor and tune after installation

**Validation:**
- `ResultingSystemProfileValidation` checks if configuration is feasible
- Ensures capacity meets demand
- Verifies pressure requirements satisfied

### 6. Adjust Cascading Set Points

**File:** `AdjustCascadingSetPointsSavingsResults.ts`

**Purpose:** Optimizes pressure set points for multiple compressors

**How It Works:**
- Sets specific pressure setpoints for each compressor
- Creates a "cascade" where compressors load sequentially
- Most efficient compressor runs at lowest pressure
- Less efficient compressors stage in at higher pressures

**Configuration:**
- `setPointData` - Array of compressor-specific setpoints:
  - `compressorId` - Identifier for each compressor
  - `fullLoadDischargePressure` - Load pressure for this compressor
  - `maxFullFlowDischargePressure` - Max pressure for this compressor
- `implementationCost` - Cost of control adjustments

**Calculation:**

For each compressor:
```
Set full load pressure to specified setpoint
Set max full flow pressure to specified setpoint
Recalculate all performance points
```

Simulate operation with cascaded setpoints:
```
Base compressor: Lowest setpoint, runs continuously
Trim compressor(s): Higher setpoints, load as needed
Backup compressor(s): Highest setpoints, rarely operate
```

**Example Cascade:**
```
Compressor A (most efficient): 100 psi load, 105 psi unload
Compressor B (medium efficient): 105 psi load, 110 psi unload
Compressor C (least efficient): 110 psi load, 115 psi unload
```

**Savings:**
- Ensures most efficient compressor maximized
- Reduces simultaneous operation of multiple compressors
- Minimizes high-pressure operation

**Typical Savings:** 5-15% (works well with load/unload compressors)

**Implementation Considerations:**
- Best for systems with multiple compressors
- Requires controllable setpoints on each compressor
- 5-10 psi spread between compressors typical
- Must accommodate system pressure requirements

### 7. Replace Compressor

**File:** `ReplaceCompressorResults.ts`

**Purpose:** Models replacing an existing compressor with a more efficient unit

**How It Works:**
- Substitutes new compressor data for existing compressor
- Recalculates system performance with new unit
- Compares baseline (old) vs. modified (new) energy consumption

**Configuration:**
- `compressorId` - ID of compressor to replace
- `replaceWith` - New compressor specifications:
  - Nameplate data (capacity, pressure, power)
  - Control type
  - Performance characteristics
- `implementationCost` - Cost of new compressor plus installation

**Calculation:**

1. Create new compressor inventory item with replacement specs
2. Remove old compressor from system
3. Add new compressor to system
4. Recalculate flow allocation and power consumption
5. Compare old system vs. new system

**When to Consider:**
- Old compressor is inefficient or oversized
- Technology upgrade available (e.g., to VFD)
- Maintenance costs high
- Reliability issues

**Typical Savings:** 10-30% (when replacing with modern VFD unit)

**Implementation Considerations:**
- Capital intensive
- Longer payback period (3-7 years typical)
- Consider air-cooled vs. water-cooled
- Match capacity to actual needs
- VFD units offer widest operating range
- May enable decommissioning other units

**Validation:**
- `ResultingSystemProfileValidation` ensures new system meets demand
- Checks capacity at all time intervals
- Verifies pressure requirements

### 8. Add Receiver Volume

**File:** `FlowReallocationResults.ts` (with additional storage parameter)

**Purpose:** Evaluates adding compressed air storage capacity

**How It Works:**
- Increases storage volume in system
- Reduces compressor cycling frequency
- Allows better handling of demand transients
- May reduce peak power demand

**Configuration:**
- `additionalVolume` - Storage to add (gallons or liters)
- `implementationCost` - Cost of receiver, piping, installation

**Calculation:**

Storage impact on cycling:
```
cyclingFrequency ∝ 1 / storageVolume

newCyclingTime = oldCyclingTime × (oldStorage + newStorage) / oldStorage
```

Power savings from reduced cycling:
```
Cycling losses ≈ 1-3% per load/unload cycle
Fewer cycles = lower average power
```

**Benefits:**
- Reduces wear on compressor
- Improves pressure stability
- Handles short-term demand spikes without starting additional compressor
- May reduce peak electrical demand

**Typical Savings:** 2-8% (primary benefit is reduced cycling)

**Implementation Considerations:**
- Most beneficial for systems with:
  - Frequent cycling
  - Large demand fluctuations
  - Small existing storage
- Diminishing returns with larger volumes
- Proper sizing critical (typically 3-5 gallons per CFM)
- Location matters (near demand centers best)

**Sizing Rules of Thumb:**
- Minimum: 1-2 gallons per CFM of system capacity
- Standard: 3-5 gallons per CFM
- High transient demand: 5-10 gallons per CFM

### 9. Reduce Run Time

**Purpose:** Models operational changes that reduce compressor operating hours

**How It Works:**
- Applies runtime reductions to specific time intervals
- May represent:
  - Shutting down during breaks/lunches
  - Weekend/overnight shutdowns
  - Seasonal production changes

**Configuration:**
- `reductionData` - Array specifying when and how much to reduce runtime
- Part of `ImproveEndUseEfficiency` or separate operational change

**Calculation:**
Similar to end-use efficiency but focuses on complete shutdown periods

**Typical Savings:** Highly variable based on operational flexibility

## Common Features Across EEMs

### Savings Tracking

Each EEM tracks:
```typescript
interface EemSavingsResults {
  baselineResults: SavingsItem;      // Before this EEM
  adjustedResults: SavingsItem;      // After this EEM
  savings: SavingsItem;              // Difference
  implementationCost: number;        // Cost to implement
  paybackPeriod: number;             // Simple payback in years
  dayTypeId: string;                 // Associated day type
}
```

### Payback Calculation

Simple payback period:
```
paybackPeriod = implementationCost / annualCostSavings
```

### Profile Summary Tracking

Each EEM maintains:
- Baseline profile (before measure)
- Adjusted profile (after measure)
- Difference between them

This enables:
- Detailed analysis of when savings occur
- Validation of system capability
- Graphical presentation of results

### Validation

Many EEMs include validation:
- **ResultingSystemProfileValidation** - Checks feasibility
- Ensures:
  - System capacity meets demand at all times
  - Pressure requirements satisfied
  - Operating limits respected

## Combining Multiple EEMs

### Sequential Application

EEMs are applied in order, each using the previous EEM's results as its baseline:

```
Original Baseline
  ↓ Apply EEM 1
Adjusted Baseline 1 (EEM 1 savings calculated)
  ↓ Apply EEM 2
Adjusted Baseline 2 (EEM 2 savings calculated)
  ↓ Apply EEM 3
Final Modified System (Total savings = sum of all EEMs)
```

### Cumulative vs. Individual Savings

- **Individual Savings:** Each EEM vs. its immediate baseline
- **Cumulative Savings:** Final modified system vs. original baseline

```
cumulativeSavings = sum(individualEemSavings)
```

### Interactive Effects

The sequential approach captures interactions:
- Leak reduction makes pressure reduction more effective
- Pressure reduction reduces potential savings from other measures
- Sequencer optimization builds on flow reallocation
- Effects can be additive, multiplicative, or offsetting

## Best Practices for EEM Selection

### Assessment Phase:
1. Start with low-cost/high-return measures:
   - Leak repair
   - Pressure reduction
   - Control optimization

2. Consider capital improvements:
   - Equipment replacement
   - Sequencer installation
   - Storage addition

3. Evaluate combined packages for best overall result

### Implementation Priority:
1. **Quick Wins** (< 2 year payback):
   - Leak repairs
   - Pressure reduction
   - Control adjustments

2. **Medium-Term** (2-5 year payback):
   - Sequencer installation
   - End-use improvements
   - Storage addition

3. **Long-Term** (> 5 year payback):
   - Compressor replacement
   - Major system redesign

## Notes

- All EEMs respect configured units (Imperial or Metric)
- Validation ensures modifications are achievable
- Implementation costs are user-configurable
- Payback calculations use simple payback (no discounting)
- Day-type specific results enable detailed analysis
- Interactive effects automatically captured through sequential application

---

[← Back to Index](./index.md)
