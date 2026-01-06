# CompressorInventoryItemClass

## Overview

The `CompressorInventoryItemClass` models individual compressor performance characteristics and behavior. It calculates performance at various operating points based on compressor type, control type, and operating conditions. This class is fundamental to accurate system simulation and modification analysis.

**Source File:** `CompressorInventoryItemClass.ts`

## Purpose

This class:
1. Defines compressor performance at multiple operating points
2. Adjusts calculations based on compressor and control types
3. Handles modification scenarios (pressure changes, sequencer adjustments)
4. Determines which performance points are applicable for a given configuration
5. Calculates derived metrics like specific power and isentropic efficiency

## Class Properties

### Basic Information

| Property | Type | Description |
|----------|------|-------------|
| itemId | string | Unique identifier for the compressor |
| name | string | User-assigned compressor name |
| description | string | Optional description |
| modifiedDate | Date | Last modification timestamp |
| isReplacementCompressor | boolean | Indicates if this is a replacement unit |

### Technical Specifications

| Property | Type | Description |
|----------|------|-------------|
| nameplateData | CompressorNameplateData | Rated capacity, pressure, power, and compressor type |
| compressorControls | CompressorControls | Control type and configuration |
| designDetails | DesignDetails | Installation details and design parameters |
| centrifugalSpecifics | CentrifugalSpecifics | Additional data for centrifugal compressors |

### Performance Points

| Property | Type | Description |
|----------|------|-------------|
| performancePoints | CompressorPerformancePointsClass | Complete set of performance points |

### Performance Point Visibility Flags

| Property | Type | Description |
|----------|------|-------------|
| showMaxFullFlow | boolean | Whether max full flow point applies |
| showMidTurndown | boolean | Whether mid turndown point applies (VFD only) |
| showTurndown | boolean | Whether turndown point applies (VFD only) |
| showUnloadPoint | boolean | Whether unload point applies |
| showNoLoadPoint | boolean | Whether no load point applies |
| showBlowoffPoint | boolean | Whether blowoff point applies (centrifugal only) |

## Constructor

```typescript
constructor(inventoryItem: CompressorInventoryItem)
```

**Process:**
1. Copies all properties from the inventory item
2. Initializes `CompressorPerformancePointsClass` with performance points
3. Calls visibility methods to determine which performance points apply

## Performance Points

Performance points define compressor operation at specific conditions. The applicable points depend on compressor type and control type.

### Full Load Performance Point

**Applies to:** All compressors (always visible)

**Description:** Operating point at rated capacity and design pressure

**Properties:**
- `dischargePressure` - Outlet pressure (psi or bar)
- `airflow` - Air delivery rate (CFM or m³/min)
- `power` - Power consumption (kW or hp)
- `isDefaultPressure`, `isDefaultAirFlow`, `isDefaultPower` - Flags indicating if values are calculated or user-specified

**Calculation:** Based on nameplate data (rated capacity, pressure, and power)

### Max Full Flow Performance Point

**Applies to:** Most configurations except:
- Centrifugal compressors with blowoff controls (control types 7, 9)
- Rotary screw with inlet modulation without unloading (control type 1)
- VFD control (control type 11)

**Description:** Maximum capacity at a specified pressure, typically at or near full load pressure

**Properties:** Same as Full Load

**Calculation:** 
- For non-centrifugal: Typically same as or slightly above full load
- For centrifugal: Maximum capacity before surge conditions
- Pressure may be adjusted for modifications (sequencer, pressure reduction)

### Mid Turndown Performance Point

**Applies to:** VFD-controlled compressors (control type 11) only

**Description:** Intermediate operating point between full load and minimum turndown

**Properties:** Same as Full Load

**Calculation:** Based on compressor curve, typically around 70-75% of full load capacity with proportionally reduced power

### Turndown Performance Point

**Applies to:** VFD-controlled compressors (control type 11) only

**Description:** Minimum stable operating point for VFD compressors

**Properties:** Same as Full Load

**Calculation:** Typically 40-50% of full load capacity, depends on compressor design

### Unload Point Performance Point

**Applies to:**
- Rotary screw with inlet modulation with unloading (control type 2)
- Rotary screw with variable displacement with unloading (control type 3)
- Centrifugal with inlet modulation with unloading (control types 8, 10)
- Reciprocating with multi-step unloading (control type 5)

**Description:** Operating point where compressor transitions from loaded to unloaded state

**Properties:** Same as Full Load

**Typical Values:**
- Airflow: 0 CFM (no air delivery)
- Pressure: Slightly higher than full load (upper control band)
- Power: Reduced but non-zero (compressor still running)

**Calculation:** Power based on unload power consumption percentage (typically 25-40% of full load power)

### No Load Performance Point

**Applies to:** Most compressors, except:
- Centrifugal with blowoff controls (control types 7, 9)

**Description:** Compressor running but not producing compressed air

**Properties:** Same as Full Load

**Typical Values:**
- Airflow: 0 CFM
- Pressure: At or near full load pressure
- Power: Reduced consumption (often similar to unload point)

**Calculation:** Power typically 20-30% of full load for rotary screw, varies by type

### Blowoff Performance Point

**Applies to:** Centrifugal compressors with blowoff controls (control types 7, 9) only

**Description:** Operating point with blowoff valve open to prevent surge

**Properties:** Same as Full Load

**Typical Values:**
- Airflow: Reduced (some air vented through blowoff)
- Pressure: At or below surge pressure
- Power: Reduced but higher than unload

**Calculation:** Based on centrifugal performance curve and blowoff valve capacity

## Performance Point Visibility Logic

The class automatically determines which performance points apply based on compressor and control type combinations.

### setShowMaxFlowPerformancePoint()

**Visibility Rules:**
- **Hidden for:**
  - Centrifugal (type 6) with blowoff controls (types 7, 9)
  - Rotary screw (types 1, 2) with inlet modulation without unloading (type 1)
  - VFD control (type 11)
- **Shown for:** All other combinations

### setShowMidTurndownPerformancePoint()

**Visibility Rules:**
- **Shown only for:** VFD control (type 11)
- **Hidden for:** All other control types

### setShowTurndownPerformancePoint()

**Visibility Rules:**
- **Shown only for:** VFD control (type 11)
- **Hidden for:** All other control types

### setShowUnloadPerformancePoint()

**Visibility Rules:**
- **Shown for:**
  - Rotary screw (types 1, 2) with controls 2 or 3
  - Centrifugal (type 6) with controls 8 or 10
- **Hidden for:** All other combinations

### setShowNoLoadPerformancePoint()

**Visibility Rules:**
- **Hidden only for:** Centrifugal (type 6) with blowoff controls (types 7, 9)
- **Shown for:** All other combinations

### setShowBlowoffPerformancePoint()

**Visibility Rules:**
- **Shown only for:** Centrifugal (type 6) with blowoff controls (types 7, 9)
- **Hidden for:** All other combinations

## Compressor Types

Reference from `inventoryOptions.md`:

| Value | Description |
|-------|-------------|
| 1 | Single stage lubricant-injected rotary screw |
| 2 | Two stage lubricant-injected rotary screw |
| 3 | Two stage lubricant-free rotary screw |
| 4 | Single stage reciprocating |
| 5 | Two stage reciprocating |
| 6 | Multiple Stage Centrifugal |

## Control Types

Reference from `inventoryOptions.md`:

| Value | Description |
|-------|-------------|
| 1 | Inlet modulation without unloading |
| 2 | Inlet modulation with unloading |
| 3 | Variable displacement with unloading |
| 4 | Load/unload |
| 5 | Multi-step unloading |
| 6 | Start/Stop |
| 7 | Inlet butterfly modulation with blowoff |
| 8 | Inlet butterfly modulation with unloading |
| 9 | Inlet guide vane modulation with blowoff |
| 10 | Inlet guide vane modulation with unloading |
| 11 | VFD |

## Key Methods

### adjustCompressorPerformancePointsWithSequencer()

**Purpose:** Adjusts performance points when an automatic sequencer is used

**Parameters:**
- `targetPressure` - Sequencer target pressure
- `variance` - Pressure control band (±)
- `atmosphericPressure` - Local atmospheric pressure
- `settings` - Application settings

**Process:**
1. Sets full load pressure to `targetPressure - variance`
2. Adjusts upper control points (unload, no load, blowoff) to `targetPressure + variance`
3. Flags modified values as non-default
4. Recalculates performance points

**Impact:**
- Optimizes compressor staging
- Minimizes pressure band operation
- Improves control efficiency

### reduceSystemPressure()

**Purpose:** Models the effect of reducing system discharge pressure

**Parameters:**
- `reduceSystemAirPressure` - Configuration including pressure reduction amount
- `atmosphericPressure` - Local atmospheric pressure
- `settings` - Application settings

**Process:**
1. Reduces full load pressure by specified amount
2. Adjusts max full flow pressure (except for certain control types)
3. Sets flags to indicate non-default values
4. Recalculates performance points

**Impact:**
- Reduces power consumption (lower pressure = less work)
- Maintains proportional compressor relationships
- Adjusts for compressor curve characteristics

### adjustCascadingSetPoints()

**Purpose:** Sets specific pressure setpoints for coordinated compressor control

**Parameters:**
- `adjustCascadingSetPoints` - Configuration with compressor-specific setpoints
- `atmosphericPressure` - Local atmospheric pressure
- `settings` - Application settings

**Process:**
1. Finds setpoint data for this compressor
2. Sets full load and max flow pressures to specified values
3. Marks pressures as user-defined (non-default)
4. Recalculates performance points

**Impact:**
- Enables staged compressor operation
- Optimizes pressure control strategy
- Reduces simultaneous operation

### updatePerformancePoints()

**Purpose:** Recalculates all performance point values based on current settings

**Parameters:**
- `atmosphericPressure` - Local atmospheric pressure
- `settings` - Application settings

**Process:**
1. Calls `performancePoints.updatePerformancePoints()`
2. Applies compressor-specific calculations for each point
3. Respects default flags (only recalculates default values)

**Called by:** All adjustment methods after changing pressure setpoints

### getRatedSpecificPower()

**Purpose:** Calculates specific power consumption

**Returns:** `number` - Power per unit flow (kW per 100 CFM or kW per m³/min)

**Calculation:**
```
specificPower = (totalPackageInputPower / fullLoadRatedCapacity) × 100
```

**Use:** Compressor efficiency metric; lower is better

### getRatedIsentropicEfficiency()

**Purpose:** Calculates theoretical thermodynamic efficiency

**Parameters:**
- `settings` - For unit conversion

**Returns:** `number` - Isentropic efficiency (%)

**Calculation:**
```
efficiency = ((16.52 × (pressureRatio^0.2857 - 1)) / specificPower) × 100
where pressureRatio = (dischargePressure + 14.5) / 14.5
```

**Use:** Indicates compressor efficiency relative to ideal process

### toModel()

**Purpose:** Converts class instance back to data model

**Returns:** `CompressorInventoryItem`

**Use:** Serialization for storage or transmission

### findItem()

**Purpose:** Checks if this compressor matches a given ID

**Parameters:**
- `itemId: string` - ID to compare

**Returns:** `boolean` - True if match

## Performance Point Calculation

Each performance point has a calculation method that determines airflow, pressure, and power based on:

### Input Factors:
- Nameplate data (rated values)
- Control type
- Atmospheric pressure
- Current discharge pressure setting
- Design details (modulation, capacity ratios)
- Centrifugal specifics (surge/stonewall limits for centrifugal)

### Calculation Methods:

#### For Rotary Screw and Reciprocating:
- Linear/polynomial relationships between pressure and power
- Capacity adjustments for modulation
- Part-load efficiency curves

#### For Centrifugal:
- Polynomial performance curves (pressure vs. flow)
- Surge and stonewall limit constraints
- Pressure ratio calculations for power

See individual performance point class files for detailed calculation formulas:
- `FullLoadPerformancePoint.ts`
- `MaxFullFlowPerformancePoint.ts`
- `MidTurndownPerformancePoint.ts`
- `TurndownPerformancePoint.ts`
- `UnloadPointPerformancePoint.ts`
- `NoLoadPerformancePoint.ts`
- `BlowoffPerformancePoint.ts`

## Usage in System Calculations

The `CompressorInventoryItemClass` is used throughout system calculations:

1. **Baseline Calculations** - Determine current compressor operation
2. **Modification Scenarios** - Adjust for pressure changes, control changes
3. **Flow Allocation** - Assign load to most efficient compressors
4. **Capacity Analysis** - Verify system can meet demand
5. **Energy Calculations** - Sum individual compressor power consumption

## Example: Performance Points for Different Configurations

### Example 1: Rotary Screw with Load/Unload Control

**Compressor Type:** 1 (Single stage lubricant-injected rotary screw)
**Control Type:** 4 (Load/unload)

**Applicable Performance Points:**
- ✓ Full Load
- ✓ Max Full Flow
- ✗ Mid Turndown
- ✗ Turndown
- ✗ Unload Point
- ✓ No Load
- ✗ Blowoff

**Operation:** Compressor runs at full load or no load. Cycles between states based on pressure band.

### Example 2: Centrifugal with Blowoff

**Compressor Type:** 6 (Centrifugal)
**Control Type:** 9 (Inlet guide vane modulation with blowoff)

**Applicable Performance Points:**
- ✓ Full Load
- ✗ Max Full Flow (blowoff takes precedence)
- ✗ Mid Turndown
- ✗ Turndown
- ✗ Unload Point
- ✗ No Load (blowoff prevents true no-load)
- ✓ Blowoff

**Operation:** Modulates capacity via inlet guide vanes. Uses blowoff to prevent surge at low flows.

### Example 3: Rotary Screw with VFD

**Compressor Type:** 1 (Single stage lubricant-injected rotary screw)
**Control Type:** 11 (VFD)

**Applicable Performance Points:**
- ✓ Full Load
- ✗ Max Full Flow (VFD provides continuous control)
- ✓ Mid Turndown
- ✓ Turndown
- ✗ Unload Point
- ✓ No Load
- ✗ Blowoff

**Operation:** Continuously variable capacity from turndown to full load. Most efficient control method.

## Related Classes

- **CompressorPerformancePointsClass** - Container for all performance points
- **Individual Performance Point Classes** - Calculation logic for each point type
- **CompressedAirBaselineDayTypeProfileSummary** - Uses compressor class for baseline
- **CompressedAirModifiedDayTypeProfileSummary** - Applies modifications to compressors

## Notes

- All calculations respect configured units (Imperial or Metric)
- Performance points are recalculated when operating conditions change
- Default flags allow user overrides while maintaining calculated values for non-overridden fields
- Centrifugal compressors require additional specifics (surge/stonewall limits)
- VFD compressors have the most flexible operating range
- The visibility flags guide the UI on which fields to display

---

[← Back to Index](./index.md)
