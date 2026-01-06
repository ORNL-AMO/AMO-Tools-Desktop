# Performance Points Calculation Algorithms

## Overview

Performance points define compressor operation at specific conditions. This document describes the algorithms used to calculate air flow, pressure, and power consumption at each operating point.

## Performance Point Types

Compressors operate at multiple performance points depending on load and control strategy:

1. **Full Load** - Rated operation at design conditions
2. **Maximum Full Flow** - Peak capacity at upper control band
3. **Mid Turndown** - Intermediate capacity (VFD only)
4. **Minimum Turndown** - Lowest stable capacity (VFD only)
5. **Unload Point** - Transition to unloaded state
6. **No Load** - Running with zero air production
7. **Blowoff** - Surge prevention mode (centrifugal only)

## Calculation Algorithm Framework

For each performance point:

```
1. Determine Applicable Points
   ├── Based on compressor type
   └── Based on control type

2. Calculate Discharge Pressure
   ├── Use default from nameplate
   ├── Or apply modification adjustments
   └── Or use user-specified override

3. Calculate Air Flow
   ├── For Rotary Screw/Reciprocating:
   │   └── Adjust rated capacity for pressure
   ├── For Centrifugal:
   │   └── Interpolate from performance curve
   └── Or use user-specified override

4. Calculate Power Consumption
   ├── Base on pressure ratio relationship
   ├── Apply part-load efficiency factors
   ├── Account for control type characteristics
   └── Or use user-specified override

5. Apply Atmospheric Correction
   └── Adjust for site elevation
```

## Full Load Point Algorithm

**Applicability:** All compressors

**Pressure Calculation:**
```
Discharge Pressure = Nameplate Full Load Operating Pressure
(Unless modified by sequencer, pressure reduction, or cascading setpoints)
```

**Air Flow Calculation - Rotary Screw/Reciprocating:**
```
If at rated pressure:
  Air Flow = Nameplate Rated Capacity

If pressure differs:
  Air Flow = Rated Capacity × Pressure Adjustment Factor
  (Typically 1-2% change per 10 psi)
```

**Air Flow Calculation - Centrifugal:**
```
Use 3-point polynomial regression:
  Point 1: (Max Surge Pressure, Max Surge Flow)
  Point 2: (Rated Pressure, Rated Capacity)
  Point 3: (Min Stonewall Pressure, Min Stonewall Capacity)

Fit 2nd order polynomial: Flow = f(Pressure)
Interpolate flow at operating pressure
```

**Power Calculation:**
```
Pressure Ratio = (Discharge Pressure + Atmospheric) / Atmospheric
Rated Pressure Ratio = (Rated Pressure + Atmospheric) / Atmospheric

Power = Rated Power × (Pressure Ratio / Rated Pressure Ratio)^0.286

This exponent represents the polytropic compression relationship
```

## VFD Operating Points Algorithm

**Mid Turndown Point:**
```
Air Flow = Full Load Capacity × 0.70 to 0.75 (typical)
Pressure = Maintains full load pressure via speed control
Power = Full Load Power × (Flow Ratio)³ × Motor Efficiency Factor

The cubic relationship follows fan/pump affinity laws
```

**Minimum Turndown Point:**
```
Air Flow = Full Load Capacity × 0.40 to 0.50 (typical)
Pressure = Maintains full load pressure via speed control
Power = Full Load Power × (Flow Ratio)³ + Fixed Losses

Fixed losses include controls, cooling, bearing friction
```

## Unload and No Load Algorithm

**Unload Point** (Modulation with Unloading):
```
Air Flow = 0 (compressor producing no air)
Pressure = Control Target + Variance (upper control band)
Power = Full Load Power × Unload Factor

Unload Factor by Compressor Type:
- Rotary Screw: 0.25 - 0.35
- Reciprocating: 0.10 - 0.20  
- Centrifugal: 0.30 - 0.40
```

**No Load Point:**
```
Air Flow = 0
Pressure = System operating pressure
Power = Full Load Power × No Load Factor

No Load Factor typically 0.20 - 0.30 for rotary screw
Represents motor, controls, and parasitic losses
```

## Centrifugal Blowoff Algorithm

**Blowoff Point:**
```
Pressure = At or below surge limit pressure
Air Flow = Reduced capacity (portion vented through blowoff)
Power = 0.50 - 0.70 × Full Load Power

Compressor performs compression work, but some air vented
to prevent surge damage
```

## Performance Curve Fitting (Centrifugal)

Centrifugal compressors use polynomial curves:

```
Performance Map Boundaries:
- Surge Line: Minimum stable flow at each pressure
- Stonewall Line: Maximum flow at each pressure

3-Point Regression:
- Use least-squares fit for 2nd order polynomial
- Coefficients calculated from surge, rated, and stonewall points
- Ensure solution stays within physical limits

Pressure-Flow Relationship:
Flow(P) = a₀ + a₁·P + a₂·P²

Where coefficients determined from known points
```

## Atmospheric Pressure Correction

All calculations adjust for site elevation:

```
Standard Atmospheric = 14.7 psia (sea level)
Site Atmospheric = Varies with elevation

Pressure Ratios:
Compression Ratio = (Discharge + Atmospheric) / Atmospheric

Lower atmospheric pressure (higher elevation):
- Reduces absolute pressure ratio
- Slightly reduces power requirement
- May affect capacity for positive displacement types
```

## User Override Capability

The algorithm allows user-specified values:

```
For each performance point:
  If user specifies pressure → use specified value
  Else → calculate from algorithm

  If user specifies air flow → use specified value
  Else → calculate from algorithm

  If user specifies power → use specified value
  Else → calculate from algorithm

This preserves field measurements or test data
```

## Algorithm Validation

Calculated values are validated:

```
Checks:
- Air flow ≤ maximum capacity limits
- Pressure within compressor operating range
- Power consumption reasonable (compare to specific power)
- For centrifugal: ensure within surge/stonewall limits
- VFD turndown within mechanical limits

Out-of-range values flagged for review
```

## Related Documentation

- [Compressor Performance Modeling](./compressor_inventory_item_class.md) - Overall compressor algorithm
- [Energy Efficiency Measures](./energy_efficiency_measures.md) - How modifications affect performance points

---

[← Back to Index](./index.md)
