# System Pressure Reduction Algorithm

## Overview

System pressure reduction calculates energy savings from lowering the compressed air system's operating pressure. Power consumption is proportional to pressure ratio, so reducing discharge pressure directly reduces compressor power requirements.

## Objective

Quantify energy and cost savings achieved by operating the compressed air system at a lower pressure, while ensuring all end-use equipment can still function properly.

## Algorithm Inputs

### Pressure Reduction Parameters
- **Average System Pressure Reduction** (psi or bar)
  - Amount to reduce discharge pressure
  - Typical range: 5-20 psi (0.35-1.4 bar)
  - Must verify end-uses can operate at lower pressure

### System Data
- Current operating pressure for each compressor
- Compressor performance characteristics
- Baseline air demand profile
- Distribution system pressure drop

### Economic Parameters
- **Implementation Cost** ($)
  - Pressure transducer installation/calibration
  - Control system adjustments
  - Validation testing and commissioning
  - Typical: $2,000-$10,000

- **Electricity Rate** ($/kWh)
- **Demand Charge Rate** ($/kW-month)

## Calculation Algorithm

### Step 1: Adjust Compressor Setpoints

For each compressor in the system:

```
New Full Load Pressure = Current Full Load Pressure - Pressure Reduction

If compressor has Max Full Flow point:
    New Max Flow Pressure = Current Max Flow Pressure - Pressure Reduction

Exceptions (pressure not adjusted):
    - Inlet modulation without unloading (control type 1)
    - Centrifugal with blowoff (control types 7, 9)
```

### Step 2: Recalculate Performance Points

For each compressor, recalculate power at new pressure:

**Rotary Screw / Reciprocating:**
```
Pressure Ratio = (New Discharge Pressure + Atmospheric) / Atmospheric
Old Pressure Ratio = (Old Discharge Pressure + Atmospheric) / Atmospheric

Power Reduction Factor = (Pressure Ratio / Old Pressure Ratio)^0.286

New Power = Old Power × Power Reduction Factor
```

**Explanation of 0.286 Exponent:**
- Represents polytropic compression process
- Derived from thermodynamic relationship
- 0.286 = (k-1)/k where k ≈ 1.4 for air
- Accounts for compression work and heat losses

**Centrifugal:**
```
Use performance curve recalculation:
1. Determine new operating point on compressor map
2. Interpolate power from pressure-power relationship
3. Adjust for pressure ratio changes

Typically similar reduction to positive displacement types
```

### Step 3: Recalculate System Energy

With updated compressor performance:

```
For each time interval and day type:
    Allocate air demand to compressors
    Calculate power using new performance points
    Sum power consumption

Modified Total Energy = Σ(Modified Power × Time × Days)
```

### Step 4: Calculate Savings

**Energy Savings:**
```
Energy Savings = Baseline Energy - Modified Energy
Annual Energy Cost Savings = Energy Savings × Electricity Rate
```

**Demand Savings:**
```
Baseline Peak Demand = max(Baseline Power)
Modified Peak Demand = max(Modified Power with reduced pressure)

Demand Reduction = Baseline Peak - Modified Peak
Annual Demand Savings = Demand Reduction × 12 × Demand Rate
```

**Total Savings:**
```
Total Annual Savings = Energy Cost Savings + Demand Savings
```

### Step 5: Calculate Payback

```
Simple Payback = Implementation Cost / Total Annual Savings
```

## Rule of Thumb Estimation

For quick estimation without detailed modeling:

```
Energy Savings % ≈ 1% per 2 psi reduction

Example:
- 10 psi reduction → ~5% energy savings
- 15 psi reduction → ~7.5% energy savings
- 20 psi reduction → ~10% energy savings
```

This rule applies across compressor types but actual savings depend on:
- Starting pressure level
- Compressor efficiency
- Control type
- Load profile

## Example Calculation

**System Parameters:**
- Current operating pressure: 110 psig
- Proposed operating pressure: 100 psig
- Pressure reduction: 10 psi
- Atmospheric pressure: 14.7 psia
- Baseline energy: 600,000 kWh/year
- Implementation cost: $5,000

**Detailed Calculation:**
```
Compressor 1 (Rotary Screw, 200 kW at 110 psig):
Current Pressure Ratio = (110 + 14.7) / 14.7 = 8.48
New Pressure Ratio = (100 + 14.7) / 14.7 = 7.80

Power Reduction Factor = (7.80 / 8.48)^0.286 = 0.977

New Power = 200 × 0.977 = 195.4 kW
Power Savings = 4.6 kW (2.3% reduction)

For full system:
Modified Energy = 570,000 kWh/year (5% reduction)
Energy Savings = 30,000 kWh/year
Energy Cost Savings = 30,000 × $0.10 = $3,000/year

Peak demand reduced: 250 kW → 245 kW (5 kW reduction)
Demand Savings = 5 × 12 × $15 = $900/year

Total Annual Savings = $3,000 + $900 = $3,900/year
Simple Payback = $5,000 / $3,900 = 1.3 years
```

## Feasibility Assessment

Before implementing pressure reduction, verify:

### End-Use Requirements

**Check each air-using process:**
```
For each end-use:
    Required Pressure = Process Requirement + Safety Margin
    
    If (New System Pressure - Distribution Loss) < Required Pressure:
        → Pressure reduction NOT feasible for this level
        → Reduce pressure reduction amount or
        → Install booster compressor for high-pressure uses
```

**Common End-Use Pressures:**
- Pneumatic tools: 90 psig typical
- Process controls: 60-80 psig
- Air cylinders: Varies, 60-100 psig typical
- Blowoff/cleaning: Can often accept lower pressure
- Spray painting: 40-60 psig
- Material conveying: Varies significantly

### Distribution System Analysis

Account for pressure losses:

```
Available Pressure at End-Use = 
    Compressor Discharge Pressure 
    - Dryer Pressure Drop (typical: 2-5 psi)
    - Filter Pressure Drop (typical: 2-5 psi)
    - Piping Friction Loss (varies: 1-10+ psi)
    - Elevation Change Effects
    - Control Valve Drops

Minimum Available ≥ Maximum End-Use Requirement
```

### System Capacity Check

Ensure adequate capacity at lower pressure:

```
For positive displacement compressors:
    Capacity typically slightly increases at lower pressure
    (Volumetric displacement remains constant)

For centrifugal compressors:
    Check performance map
    Ensure operation stays right of surge line
    May need flow adjustments
```

## Implementation Considerations

### Phased Approach

Recommended implementation strategy:

1. **Phase 1: Initial Reduction (5 psi)**
   - Test impact on most sensitive processes
   - Monitor system stability
   - Verify no adverse effects

2. **Phase 2: Further Reduction (Additional 5 psi)**
   - If Phase 1 successful
   - Monitor for 1-2 weeks
   - Adjust as needed

3. **Phase 3: Target Pressure (Final reduction)**
   - Achieve desired pressure
   - Document final settings
   - Train operators

### Monitoring During Implementation

**Key Parameters to Track:**
- End-use equipment performance
- Process quality metrics
- Compressor discharge pressures
- System pressure at various locations
- Compressor power consumption
- Any production issues

### Potential Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Equipment malfunction | Insufficient pressure | Increase pressure or install booster |
| Excessive cycling | Reduced pressure band | Widen control band or add storage |
| Unstable pressure | Inadequate control | Adjust sequencer or add regulation |
| Production quality | Process sensitivity | Identify sensitive process, provide local boost |

## Interactive Effects

### Amplified By:
- **Leak Reduction:** Fewer leaks means less flow demand
- **End-Use Efficiency:** Lower demand allows lower pressure operation

### Affects:
- **Flow Reallocation:** Changes optimal loading strategy
- **Sequencer Operation:** May require setpoint adjustments
- **Compressor Selection:** May allow smaller units in rotation

### Sequence Considerations:
Apply pressure reduction AFTER leak reduction:
- Leak reduction comes first in typical sequence
- Smaller leak flow at lower pressure (additional benefit)
- More accurate pressure reduction savings calculation

## Validation Criteria

System modification must satisfy:

```
Validation Checks:
1. New pressure ≥ (Maximum end-use requirement + distribution losses + safety margin)
2. New pressure ≥ Minimum compressor operating pressure
3. For centrifugal: New operating point within performance map
4. Pressure reduction ≤ 30 psi (avoid excessive single reduction)
5. Implementation cost reasonable for expected savings
```

## Algorithm Outputs

| Output | Description |
|--------|-------------|
| New Compressor Setpoints | Updated discharge pressures for each unit |
| Modified Performance Points | Recalculated power at each operating point |
| Modified Energy Consumption | Annual kWh with pressure reduction |
| Energy Savings | kWh saved annually |
| Energy Cost Savings | $ saved from energy |
| Demand Savings | $ saved from peak demand reduction |
| Total Annual Savings | Combined savings |
| Simple Payback | Years to recover investment |
| Pressure Reduction Amount | psi or bar reduced |

## Related Algorithms

- [Compressor Performance Modeling](../compressor_inventory_item_class.md) - How pressure affects power
- [Performance Points](../performance_points_system.md) - Detailed power calculations
- [Air Leak Reduction](./reduce_air_leaks.md) - Often implemented together

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
