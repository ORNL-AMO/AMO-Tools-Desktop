# Air Leak Reduction Algorithm

## Overview

Air leak reduction calculates energy savings achieved by repairing compressed air leaks in the distribution system. Leaks represent wasted compressed air that requires continuous compressor operation to maintain system pressure.

## Objective

Quantify the energy and cost savings from reducing compressed air leakage through systematic leak detection and repair programs.

## Algorithm Inputs

### Leak Assessment Data
- **Current Leak Rate** (CFM or m³/min)
  - Measured during plant shutdown or
  - Estimated from compressor unloaded runtime or
  - Calculated from system pressure decay test

- **Leak Reduction Percentage** (%)
  - Percentage of identified leaks to be repaired
  - Typically 50-100% depending on program scope
  - Conservative: 50%, Moderate: 75%, Aggressive: 100%

### Economic Parameters
- **Implementation Cost** ($)
  - Leak detection equipment (ultrasonic detector rental/purchase)
  - Labor for survey and tagging
  - Repair materials and labor
  - Typical: $0.50-$2.00 per CFM of leak rate repaired

- **Electricity Rate** ($/kWh)
- **Demand Charge Rate** ($/kW-month)

### System Data
- Baseline hourly air demand profile
- Compressor inventory and performance
- Operating schedule (day types)

## Calculation Algorithm

### Step 1: Calculate Leak Reduction

For each time interval in each day type:

```
Leak Reduction Flow = Current Leak Rate × (Reduction Percentage / 100)

Adjusted Air Demand = Baseline Air Demand - Leak Reduction Flow

If Adjusted Air Demand < 0:
    Adjusted Air Demand = 0
```

**Rationale:** Leaks are constant 24/7, so reduction applies to all time intervals equally.

### Step 2: Reallocate Compressor Load

With reduced air demand, recalculate compressor operation:

```
For each time interval:
    Required Air Flow = Adjusted Air Demand
    
    Allocate flow to compressors (efficiency order):
        1. Sort compressors by specific power (kW/100 CFM)
        2. Load most efficient compressor first
        3. Add next most efficient if more capacity needed
        4. Continue until demand met
    
    Calculate power for each loaded compressor:
        Power = f(Allocated Flow, Operating Point, Control Type)
    
    Sum power across all compressors for interval
```

### Step 3: Calculate Energy Savings

Sum across all time intervals and day types:

```
Baseline Total Energy = Σ(Baseline Power × Time Interval × Operating Days)
Modified Total Energy = Σ(Modified Power × Time Interval × Operating Days)

Energy Savings = Baseline Total Energy - Modified Total Energy
```

### Step 4: Calculate Cost Savings

**Energy Cost Savings:**
```
Annual Energy Cost Savings = Energy Savings × Electricity Rate
```

**Demand Cost Savings:**
```
Baseline Peak Demand = max(Baseline Power across all intervals)
Modified Peak Demand = max(Modified Power across all intervals)

If Modified Peak Demand < Baseline Peak Demand:
    Demand Reduction = Baseline Peak Demand - Modified Peak Demand
    Annual Demand Savings = Demand Reduction × 12 months × Demand Rate
Else:
    Annual Demand Savings = 0
```

**Total Annual Savings:**
```
Total Annual Operating Cost Savings = Energy Cost Savings + Demand Savings
```

### Step 5: Calculate Payback

```
Simple Payback Period = Implementation Cost / Total Annual Operating Cost Savings
```

## Example Calculation

**System Parameters:**
- Current leak rate: 200 CFM
- Leak reduction target: 50%
- Implementation cost: $15,000
- Electricity rate: $0.10/kWh
- Demand rate: $15/kW-month
- Baseline energy: 600,000 kWh/year
- Baseline cost: $60,000/year

**Calculation:**
```
Leak Reduction = 200 CFM × 0.50 = 100 CFM

Adjusted demand profile: Reduce each interval by 100 CFM

Recalculate compressor operation:
- Fewer compressor hours
- More efficient loading
- Less part-load operation

Modified Energy = 540,000 kWh/year (10% reduction typical)
Energy Savings = 60,000 kWh/year
Energy Cost Savings = 60,000 × $0.10 = $6,000/year

Peak demand reduced from 250 kW to 238 kW
Demand Reduction = 12 kW
Demand Savings = 12 × 12 × $15 = $2,160/year

Total Annual Savings = $6,000 + $2,160 = $8,160/year
Simple Payback = $15,000 / $8,160 = 1.8 years
```

## Leak Measurement Methods

### Method 1: Pressure Decay Test
```
1. Isolate system (close all demand valves)
2. Pressurize to operating pressure
3. Shut off compressors
4. Measure time for pressure to drop (e.g., 10 psi)

Leak Rate (CFM) = (System Volume × ΔP) / (Atmospheric Pressure × Time × 14.7)

Where:
- System Volume in cubic feet
- ΔP in psi (pressure drop during test)
- Time in minutes
```

### Method 2: Unloaded Runtime
```
Measure compressor unloaded runtime during non-production:

Leak Rate = (Unloaded Runtime / Total Runtime) × Compressor Capacity

More accurate if system fully unloaded overnight
```

### Method 3: Ultrasonic Survey
```
Use ultrasonic leak detector to identify individual leaks
Estimate flow rate for each leak based on:
- Leak size (orifice diameter)
- System pressure
- Leak type (hole, fitting, etc.)

Total Leak Rate = Σ(Individual Leak Estimates)
```

## Implementation Considerations

### Leak Detection
- **Ultrasonic Detection:** Most accurate, identifies specific locations
- **Soap Solution:** Low-tech, works for accessible fittings
- **Thermal Imaging:** Identifies temperature drops from expanding air
- **Acoustic Detection:** For large leaks in noisy environments

### Leak Types and Locations
**Common Sources:**
- Pipe fittings and connections (40-50% of leaks)
- Quick disconnects and couplings (25-30%)
- Pressure regulators (10-15%)
- Shut-off valves (5-10%)
- Point-of-use equipment (5-10%)

**Leak Size Categories:**
- Small: < 0.1 CFM (difficult to hear, often ignored)
- Medium: 0.1-1 CFM (audible, moderate cost)
- Large: 1-10 CFM (loud, significant cost)
- Very Large: > 10 CFM (obvious, critical to repair)

### Repair Priorities
1. Large leaks in high-pressure areas (maximum savings)
2. Accessible leaks with low repair cost
3. Leaks on equipment not in use
4. Small leaks if repair is simple (tighten fitting)

### Program Sustainment
Leak reduction is not permanent without ongoing program:

**Recommended Approach:**
- Quarterly or semi-annual leak surveys
- Tag and track all identified leaks
- Prioritize repairs by cost/benefit
- Monitor system leak rate (pressure decay or unloaded runtime)
- Typical leak rate growth: 10-20% per year without program

## Typical Savings Range

Based on system characteristics:

| System Condition | Estimated Leak Rate | Potential Savings |
|------------------|---------------------|-------------------|
| Well-maintained | 5-10% of capacity | 10-15% energy |
| Average | 15-25% of capacity | 15-20% energy |
| Poor maintenance | 25-40% of capacity | 20-25% energy |
| Very poor | > 40% of capacity | 25-35% energy |

## Interactive Effects with Other Measures

**Amplifies Benefits Of:**
- **Pressure Reduction:** Lower pressure reduces leak flow rate
- **Flow Reallocation:** Less demand allows more efficient loading
- **End-Use Efficiency:** Combined demand reductions compound

**Considerations:**
- Apply leak reduction before pressure reduction in sequence
- Leak reduction benefits calculated first, then used as baseline for other measures
- Some leaks may become apparent only after pressure increase from other improvements

## Validation Criteria

Modified system must satisfy:

```
Check 1: Adjusted demand ≥ 0 at all time intervals
Check 2: System capacity adequate for reduced demand
Check 3: Leak reduction percentage ≤ 100%
Check 4: Implementation cost reasonable ($0.50-$5/CFM typical range)
```

## Algorithm Outputs

| Output | Description |
|--------|-------------|
| Adjusted Air Demand Profile | Hourly demand reduced by leak repair amount |
| Modified Energy Consumption | Annual kWh after leak reduction |
| Energy Savings | kWh saved annually |
| Energy Cost Savings | $ saved from energy reduction |
| Demand Savings | $ saved from peak demand reduction |
| Total Annual Savings | Combined energy and demand savings |
| Implementation Cost | Total cost to implement leak program |
| Simple Payback | Years to recover investment |
| Leak Reduction Flow | CFM of leaks repaired |

## Related Algorithms

- [Flow Reallocation](./flow_reallocation.md) - Used to recalculate compressor loading
- [Baseline Characterization](../compressed_air_assessment_baseline_results.md) - Provides starting point
- [Modification Evaluation](../compressed_air_assessment_modification_results.md) - Overall calculation framework

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
