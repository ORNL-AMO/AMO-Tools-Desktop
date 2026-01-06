# Performance Points System

## Overview

The performance points system models compressor behavior at various operating conditions. Each compressor has multiple performance points that define its airflow, pressure, and power consumption characteristics at different load levels and control modes.

**Source Files:** `performancePoints/` directory

## Purpose

The performance points system:
1. Provides accurate modeling of compressor performance across operating ranges
2. Supports different compressor types and control strategies
3. Enables precise energy calculations for baseline and modified systems
4. Allows user overrides while maintaining calculated defaults
5. Adapts to changing system conditions (pressure, sequencer settings)

## Core Classes

### CompressorPerformancePointsClass

**File:** `CompressorPerformancePointsClass.ts`

**Description:** Container class that manages all performance points for a compressor

**Properties:**
- `fullLoad` - Full load performance point (always present)
- `maxFullFlow` - Maximum full flow performance point
- `midTurndown` - Mid turndown point (VFD only)
- `turndown` - Minimum turndown point (VFD only)
- `unloadPoint` - Unload transition point
- `noLoad` - No load running point
- `blowoff` - Blowoff point (centrifugal with blowoff controls)

**Key Methods:**
- `updatePerformancePoints()` - Recalculates all points based on current settings
- `adjustCompressorPerformancePointsWithSequencer()` - Adjusts for sequencer control

### Individual Performance Point Classes

Each performance point type has its own calculation class with specific logic:

## Performance Point Types

### 1. Full Load Performance Point

**File:** `FullLoadPerformancePoint.ts`

**Description:** Rated operating condition at design capacity and pressure

**Calculation Logic:**

#### Discharge Pressure:
- Default: Uses nameplate full load operating pressure
- User Override: Accepts user-specified pressure

#### Airflow:
**For Centrifugal Compressors:**
- Uses polynomial regression with surge and stonewall limits
- Three-point curve: (maxSurgePressure, maxSurgeFlow), (ratedPressure, ratedCapacity), (minStonewallPressure, minStonewallFlow)
- Interpolates airflow for current discharge pressure

**For Rotary Screw and Reciprocating:**
- Adjusts rated capacity based on pressure ratio
- Uses compression ratio calculations
- Applies atmospheric pressure correction

#### Power:
**For All Types:**
- Base calculation from nameplate rated power
- Adjusted for actual discharge pressure vs. rated
- Uses pressure ratio exponential relationship
- Applies motor efficiency and part-load factors

**Formula (Rotary Screw):**
```
pressureRatio = (dischargePressure + atmosphericPressure) / atmosphericPressure
ratedPressureRatio = (ratedPressure + atmosphericPressure) / atmosphericPressure
power = ratedPower × (pressureRatio / ratedPressureRatio)^exponent
```

### 2. Max Full Flow Performance Point

**File:** `MaxFullFlowPerformancePoint.ts`

**Description:** Maximum capacity at or near full load pressure conditions

**Calculation Logic:**

#### Discharge Pressure:
- Default: Slightly above full load pressure (control band upper limit)
- Modifications: Adjusted for sequencer or pressure reduction
- User Override: Accepts specified pressure

#### Airflow:
**For Centrifugal:**
- Maximum capacity before surge
- Calculated from performance curve at specified pressure
- Constrained by surge limit

**For Rotary Screw/Reciprocating:**
- Typically matches or slightly exceeds full load airflow
- Adjusted for pressure and control type

#### Power:
- Calculated based on airflow and pressure
- Similar methodology to full load but at max flow conditions

**When Not Used:**
- VFD control (continuous modulation instead)
- Centrifugal with blowoff (blowoff point used instead)
- Inlet modulation without unloading (control type 1)

### 3. Mid Turndown Performance Point

**File:** `MidTurndownPerformancePoint.ts`

**Description:** Intermediate operating point for VFD-controlled compressors

**Applies to:** VFD control (control type 11) only

**Calculation Logic:**

#### Discharge Pressure:
- Typically matches full load pressure
- VFD maintains pressure while varying speed

#### Airflow:
- 70-75% of full load capacity (typical)
- Based on design turndown ratio
- Linear interpolation between full load and turndown

#### Power:
- Reduced proportionally more than airflow (VFD efficiency benefit)
- Follows affinity laws for centrifugal equipment
- Accounts for part-load motor efficiency

**Formula:**
```
airflow = fullLoadAirflow × midTurndownRatio
power = fullLoadPower × (midTurndownRatio)^3 × motorEfficiencyFactor
```

### 4. Turndown Performance Point

**File:** `TurndownPerformancePoint.ts`

**Description:** Minimum stable operating point for VFD compressors

**Applies to:** VFD control (control type 11) only

**Calculation Logic:**

#### Discharge Pressure:
- Matches target pressure
- Maintained by VFD control

#### Airflow:
- 40-50% of full load (typical minimum)
- Based on compressor design limits
- Below this, operation becomes unstable or inefficient

#### Power:
- Minimum power for stable operation
- Follows cubic relationship with speed/flow
- Includes fixed losses (motor, controls)

**Formula:**
```
airflow = fullLoadAirflow × turndownRatio
power = fullLoadPower × (turndownRatio)^3 + fixedLosses
```

### 5. Unload Point Performance Point

**File:** `UnloadPointPerformancePoint.ts`

**Description:** Transition point where compressor unloads (stops producing air)

**Applies to:**
- Inlet modulation with unloading (control type 2)
- Variable displacement with unloading (control type 3)
- Centrifugal with unloading (control types 8, 10)
- Multi-step unloading (control type 5)

**Calculation Logic:**

#### Discharge Pressure:
- Upper limit of control band
- Pressure at which unloading occurs
- Typically 5-15 psi above full load setpoint

#### Airflow:
- Zero (no air production)

#### Power:
- Unload power consumption (25-40% of full load typical)
- Compressor running but not compressing
- Includes motor, controls, and parasitic losses

**Typical Values:**
- Rotary Screw: 25-35% of full load power
- Reciprocating: 10-20% of full load power
- Centrifugal: 30-40% of full load power

### 6. No Load Performance Point

**File:** `NoLoadPerformancePoint.ts`

**Description:** Compressor running but not producing compressed air

**Applies to:** Most compressors except centrifugal with blowoff

**Calculation Logic:**

#### Discharge Pressure:
- Maintains system pressure
- Similar to full load pressure

#### Airflow:
- Zero (no air production)

#### Power:
- Similar to unload point
- Typically 20-30% of full load power for rotary screw
- Varies by compressor type and size

**Usage:**
- Inlet modulation without unloading (control type 1)
- Load/unload control during unloaded state
- Start/stop control when running unloaded

### 7. Blowoff Performance Point

**File:** `BlowoffPerformancePoint.ts`

**Description:** Operating point with blowoff valve open to prevent surge

**Applies to:** Centrifugal with blowoff controls (control types 7, 9) only

**Calculation Logic:**

#### Discharge Pressure:
- At or below surge pressure
- Pressure where blowoff activates
- Typically 5-10% below full load pressure

#### Airflow:
- Reduced from full load
- Some air vented through blowoff valve
- Calculated from surge curve

#### Power:
- Higher than no load but less than full load
- Includes compression work even though some air is vented
- Typically 50-70% of full load power

**Centrifugal Specifics:**
- Uses surge and stonewall limits from `CentrifugalSpecifics`
- Polynomial curve fitting for performance map
- Critical for preventing surge damage

## Performance Point Calculation Flow

```
1. Initialize with nameplate data
   ↓
2. Set default values for each point
   ↓
3. Check control type and compressor type
   ↓
4. Calculate applicable performance points:
   - Full Load (always)
   - Determine which other points apply
   ↓
5. For each applicable point:
   a. Calculate discharge pressure (if default)
   b. Calculate airflow (if default)
   c. Calculate power (if default)
   ↓
6. Apply modifications if needed:
   - Sequencer adjustments
   - Pressure reductions
   - Cascading setpoints
   ↓
7. Recalculate affected points
```

## Default Flags System

Each performance point has three boolean flags:
- `isDefaultPressure` - If true, pressure is calculated; if false, user-specified
- `isDefaultAirFlow` - If true, airflow is calculated; if false, user-specified
- `isDefaultPower` - If true, power is calculated; if false, user-specified

**Purpose:**
- Allows user overrides for specific values
- Maintains calculated values for non-overridden fields
- Enables partial user customization while preserving system calculations

**Behavior:**
When `updatePerformancePoints()` is called:
- Values with default flag = true are recalculated
- Values with default flag = false are preserved (user override)

## Calculation Dependencies

### Required Inputs:
- **Nameplate Data:** Rated capacity, pressure, power, compressor type
- **Control Type:** Determines which points apply and calculation methods
- **Design Details:** Capacity ratios, modulation percentages, unload power
- **Centrifugal Specifics:** Surge/stonewall limits (for centrifugal compressors)
- **Atmospheric Pressure:** Local atmospheric pressure for corrections
- **Settings:** Unit system (Imperial/Metric)

### Calculation Order:
1. Full Load (base for all others)
2. Max Full Flow (based on full load)
3. Mid Turndown (VFD, based on full load)
4. Turndown (VFD, based on full load)
5. Unload Point (based on control type)
6. No Load (based on unload or control type)
7. Blowoff (centrifugal specific)

## Helper Functions

**File:** `performancePointHelpers.ts`

### calculateAirFlow()
- Calculates airflow based on pressure and compressor characteristics
- Handles centrifugal and positive displacement types differently
- Applies atmospheric pressure corrections

### calculatePower()
- Calculates power consumption for a given airflow and pressure
- Uses pressure ratio relationships
- Accounts for part-load efficiency

### roundAirFlowForPresentation()
- Formats airflow values for display
- Appropriate significant figures based on magnitude

### roundPowerForPresentation()
- Formats power values for display
- Consistent precision across different scales

## Centrifugal Compressor Special Considerations

Centrifugal compressors have unique performance characteristics:

### Performance Map:
- **Surge Line:** Minimum stable flow at each pressure
- **Stonewall Line:** Maximum flow at each pressure
- Operating range bounded by these limits

### Polynomial Curve Fitting:
Uses 3-point regression for accuracy:
1. Maximum pressure at surge flow
2. Rated pressure and capacity
3. Minimum pressure at stonewall flow

### Control Methods:
- **Inlet Butterfly/Guide Vanes:** Modulate capacity
- **Blowoff Valve:** Prevents surge at low flows
- **Unloading:** Reduces capacity to zero

## Modifications Impact on Performance Points

### Sequencer Adjustments:
- Narrows pressure band
- Optimizes load/unload points
- Coordinates multiple compressors

### Pressure Reduction:
- Lowers all pressure setpoints proportionally
- Reduces power consumption
- Maintains performance relationships

### Cascading Setpoints:
- Sets specific pressures for each compressor
- Optimizes staging order
- Reduces overlapping operation

## Usage in System Calculations

Performance points are used for:

1. **Baseline Calculations:**
   - Determine compressor operating mode at each time interval
   - Calculate energy consumption based on load
   - Sum power across all active compressors

2. **Flow Allocation:**
   - Identify most efficient operating points
   - Assign load to best-suited compressors
   - Minimize part-load operation

3. **Capacity Verification:**
   - Check if system can meet demand
   - Identify capacity constraints
   - Validate modifications

4. **Savings Calculations:**
   - Compare baseline vs. modified operation
   - Quantify impact of control changes
   - Calculate energy and cost savings

## Example: Load/Unload Compressor Operation

**Configuration:**
- Compressor Type: Rotary Screw
- Control Type: Load/Unload
- Full Load: 1,000 CFM @ 100 psi, 200 kW
- Unload Point: 0 CFM @ 110 psi, 60 kW
- No Load: 0 CFM @ 100 psi, 50 kW

**Operation:**
1. System demand drops below capacity
2. Compressor reaches 110 psi (unload point)
3. Compressor unloads, consuming 60 kW
4. Pressure bleeds down as system uses air
5. At 100 psi, compressor loads and produces 1,000 CFM @ 200 kW
6. Cycle repeats

**Energy Impact:**
- Average power = (time loaded × 200 kW) + (time unloaded × 60 kW)
- Cycling frequency depends on storage and demand
- More cycling = higher average power = lower efficiency

## Notes

- All calculations maintain unit consistency (Imperial or Metric)
- Atmospheric pressure corrections are critical for accuracy
- Performance points are interdependent; changes cascade
- User overrides should be validated for reasonableness
- Centrifugal calculations are more complex due to non-linear behavior
- VFD compressors offer the most efficient part-load operation

---

[← Back to Index](./index.md)
