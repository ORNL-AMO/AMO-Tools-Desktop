# Compressor Performance Modeling Algorithm

## Overview

The compressor performance modeling algorithm predicts individual compressor power consumption and air delivery at various operating points. Calculations adapt to compressor type (rotary screw, reciprocating, centrifugal), control strategy (load/unload, modulation, VFD), and system modifications.

## Algorithm Purpose

The compressor model:
1. Calculates power consumption at defined operating points
2. Determines air flow and pressure characteristics
3. Adapts to different compressor types and control strategies
4. Adjusts for system modifications (pressure changes, sequencer control)
5. Computes efficiency metrics (specific power, isentropic efficiency)

## Required Input Parameters

### Compressor Specifications
- Rated capacity (CFM or m³/min)
- Rated discharge pressure (psi or bar)
- Rated power consumption (kW or hp)
- Compressor type (rotary screw, reciprocating, centrifugal)
- Staging configuration (single stage, two stage, multiple stage)
- Lubrication method (oil-injected, oil-free)

### Control System Configuration
- Control type (load/unload, modulation, VFD, etc.)
- Control band (variance in psi or bar)
- Unload power consumption (% of full load)
- Modulation type (inlet, variable displacement, guide vanes)

### Installation Details
- Atmospheric pressure at site
- Design pressure settings
- Storage volume
- System target pressure

### Centrifugal-Specific Data (when applicable)
- Surge line limits (pressure vs. flow)
- Stonewall line limits (pressure vs. flow)
- Performance curve coefficients

## Performance Operating Points

The algorithm evaluates compressor operation at key operating conditions. The specific points used depend on compressor and control type.

### 1. Full Load Point
**Applicability:** All compressors

**Description:** Rated operation at design capacity and pressure

**Calculation Inputs:**
- Nameplate rated capacity
- Nameplate rated pressure
- Nameplate rated power

**Power Calculation (Rotary Screw/Reciprocating):**
```
Pressure Ratio = (Discharge Pressure + Atmospheric) / Atmospheric
Rated Pressure Ratio = (Rated Pressure + Atmospheric) / Atmospheric
Power = Rated Power × (Pressure Ratio / Rated Pressure Ratio)^0.286
```

**Air Flow Calculation (Centrifugal):**
```
Use polynomial regression with 3 points:
- (Max Surge Pressure, Max Surge Flow)
- (Rated Pressure, Rated Capacity)
- (Min Stonewall Pressure, Min Stonewall Capacity)

Interpolate flow at current discharge pressure
```

### 2. Maximum Full Flow Point
**Applicability:** Most configurations except VFD and centrifugal with blowoff

**Description:** Maximum capacity at upper control band pressure

**Calculation:**
- Pressure = Control target + variance
- Air flow and power calculated using same methods as full load

### 3. Mid Turndown Point (VFD Only)
**Applicability:** VFD-controlled compressors only

**Description:** Intermediate capacity between full load and minimum

**Calculation:**
```
Air Flow = Full Load Capacity × Turndown Ratio (typically 0.70-0.75)
Power = Full Load Power × (Turndown Ratio)³ × Motor Efficiency Factor
```

### 4. Minimum Turndown Point (VFD Only)
**Applicability:** VFD-controlled compressors only

**Description:** Minimum stable operating capacity

**Calculation:**
```
Air Flow = Full Load Capacity × Minimum Turndown Ratio (typically 0.40-0.50)
Power = Full Load Power × (Minimum Ratio)³ + Fixed Losses
```

### 5. Unload Point
**Applicability:** Modulation with unloading controls

**Description:** Transition to unloaded state (zero air production)

**Calculation:**
```
Air Flow = 0
Pressure = Control target + variance
Power = Full Load Power × Unload Factor (typically 0.25-0.40)
```

### 6. No Load Point
**Applicability:** Most compressors except centrifugal with blowoff

**Description:** Running with zero air production

**Calculation:**
```
Air Flow = 0
Pressure = System pressure
Power = Full Load Power × No Load Factor (typically 0.20-0.30)
```

### 7. Blowoff Point (Centrifugal Only)
**Applicability:** Centrifugal with blowoff surge prevention

**Description:** Operation with surge prevention valve active

**Calculation:**
```
Pressure = At or below surge pressure
Air Flow = From surge curve (portion vented)
Power = 50-70% of full load power (compression work on vented air)
```

## Operating Point Applicability Matrix

| Compressor Type | Control Type | Applicable Points |
|----------------|--------------|-------------------|
| Rotary Screw | Load/Unload | Full Load, Max Flow, No Load |
| Rotary Screw | Modulation w/ Unload | Full Load, Max Flow, Unload, No Load |
| Rotary Screw | VFD | Full Load, Mid Turndown, Turndown, No Load |
| Reciprocating | Load/Unload | Full Load, Max Flow, No Load |
| Reciprocating | Multi-Step Unload | Full Load, Max Flow, Unload, No Load |
| Centrifugal | Modulation w/ Unload | Full Load, Max Flow, Unload |
| Centrifugal | Modulation w/ Blowoff | Full Load, Blowoff |

## Modification Adjustments

### Sequencer Control Adjustment
**Objective:** Coordinate multiple compressor operation

**Algorithm:**
```
For base load compressor:
  Full Load Pressure = Target Pressure - Variance

For trim/backup compressors:
  Unload/No Load/Blowoff Pressure = Target Pressure + Variance

Recalculate all performance points with new pressures
```

### System Pressure Reduction
**Objective:** Lower overall operating pressure

**Algorithm:**
```
For all compressors:
  New Full Load Pressure = Current Pressure - Reduction Amount
  New Max Flow Pressure = Current Max Pressure - Reduction Amount
  
Recalculate power (proportional to pressure ratio)
Power Savings ≈ 1% per 2 psi reduction (rule of thumb)
```

### Cascading Setpoint Adjustment
**Objective:** Stage compressors at different pressures

**Algorithm:**
```
Assign specific setpoints to each compressor:
  Most efficient unit: Pressure P
  Medium efficient: Pressure P + ΔP
  Least efficient: Pressure P + 2ΔP
  
Where ΔP = 5-10 psi typical staging increment
```

## Efficiency Metrics

### Specific Power
**Definition:** Power per unit flow

**Calculation:**
```
Specific Power = (Total Package Input Power / Full Load Capacity) × 100
Units: kW per 100 CFM or kW per m³/min

Lower values indicate better efficiency
```

### Isentropic Efficiency
**Definition:** Actual vs. ideal thermodynamic efficiency

**Calculation:**
```
Pressure Ratio = (Discharge Pressure + 14.5) / 14.5
Ideal Work = 16.52 × (Pressure Ratio^0.2857 - 1)
Isentropic Efficiency = (Ideal Work / Specific Power) × 100

Higher values indicate better thermodynamic efficiency
```

## Compressor Types

| Type | Value | Description |
|------|-------|-------------|
| 1 | Single stage lubricant-injected rotary screw |
| 2 | Two stage lubricant-injected rotary screw |
| 3 | Two stage lubricant-free rotary screw |
| 4 | Single stage reciprocating |
| 5 | Two stage reciprocating |
| 6 | Multiple stage centrifugal |

## Control Types

| Type | Value | Description | Applicable Compressors |
|------|-------|-------------|----------------------|
| 1 | Inlet modulation without unloading | Rotary screw |
| 2 | Inlet modulation with unloading | Rotary screw |
| 3 | Variable displacement with unloading | Rotary screw |
| 4 | Load/unload | All types |
| 5 | Multi-step unloading | Reciprocating |
| 6 | Start/Stop | All except centrifugal |
| 7 | Inlet butterfly modulation with blowoff | Centrifugal |
| 8 | Inlet butterfly modulation with unloading | Centrifugal |
| 9 | Inlet guide vane modulation with blowoff | Centrifugal |
| 10 | Inlet guide vane modulation with unloading | Centrifugal |
| 11 | VFD | All except centrifugal |

## Algorithm Applications

The compressor performance model is used in:

1. **Baseline Energy Calculation** - Determine power at each operating interval
2. **Efficiency Measure Evaluation** - Model modifications to operating points
3. **Flow Allocation Optimization** - Select most efficient compressors for load
4. **Capacity Analysis** - Verify system can meet demand requirements
5. **Control Strategy Evaluation** - Compare different control methods

## Related Algorithms

- **Baseline System Characterization** - Uses compressor models for system calculation
- **Energy Efficiency Measure Evaluation** - Adjusts compressor performance for modifications
- **Performance Points Algorithm** - Detailed calculation methods for each operating point
- **Flow Reallocation** - Uses efficiency metrics to optimize loading

## Algorithm Considerations

- Calculations support both Imperial and Metric units
- Atmospheric pressure corrections applied for site elevation
- Performance points recalculated when system parameters change
- User overrides allowed for specific values (preserves specified data)
- Centrifugal compressors require surge/stonewall limit data
- VFD compressors offer most flexible operating range with best part-load efficiency

---

[← Back to Index](./index.md)
