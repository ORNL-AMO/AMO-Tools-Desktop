# Flow Reallocation Algorithm

## Overview

Flow reallocation optimizes the distribution of air demand among available compressors by loading the most efficient units first. This fundamental optimization forms the basis for many other energy efficiency measures.

## Objective

Minimize total system power consumption by intelligently assigning air flow demand to compressors in order of efficiency (specific power), ensuring the most efficient units handle the base load.

## Algorithm Inputs

### Compressor Inventory
- Specific power (kW per 100 CFM or kW per m³/min) for each compressor
- Full load capacity for each compressor
- Available operating points and control types
- Current operational status (available/unavailable)

### System Demand
- Hourly air flow requirements
- By day type and time interval

### Economic Parameters
- **Implementation Cost** ($)
  - If automated: Control system modifications ($5,000-$15,000)
  - If manual: Operator training and procedures ($0-$2,000)
- **Electricity Rate** ($/kWh)
- **Demand Charge Rate** ($/kW-month)

## Calculation Algorithm

### Step 1: Calculate Compressor Efficiency Rankings

For each compressor:

```
Specific Power = Full Load Power / Full Load Capacity × 100

Units: kW per 100 CFM (Imperial) or kW per m³/min (Metric)

Lower specific power = more efficient

Example Ranking:
Compressor A: 18.5 kW/100CFM (most efficient)
Compressor B: 20.2 kW/100CFM
Compressor C: 22.1 kW/100CFM (least efficient)
```

### Step 2: For Each Time Interval, Allocate Flow

```
Required Air Flow = System Demand at this interval

Initialize:
    Available Compressors = All operational units
    Remaining Demand = Required Air Flow
    Loaded Compressors = []

WHILE Remaining Demand > 0 AND Available Compressors exist:
    
    Select next most efficient available compressor
    
    IF Remaining Demand ≤ Compressor Capacity:
        // This compressor handles remaining demand
        Assign (Remaining Demand) to compressor
        Calculate power at this partial load
        Remaining Demand = 0
        
    ELSE:
        // Load this compressor to full capacity
        Assign (Full Capacity) to compressor
        Calculate power at full load
        Remaining Demand = Remaining Demand - Full Capacity
        Remove from Available Compressors
    
    Add compressor to Loaded Compressors list

IF Remaining Demand > 0:
    // Insufficient capacity - flag warning
    System cannot meet demand

Total Interval Power = Σ(Power for each Loaded Compressor)
```

### Step 3: Select Optimal Operating Mode

For the partially loaded compressor (trim unit):

```
IF compressor has VFD:
    // VFD offers best part-load efficiency
    Power = Calculate VFD power at required flow
    Mode = "VFD Control"

ELSE IF compressor has modulation:
    // Modulation moderate efficiency
    Power = Calculate modulated power
    Mode = "Modulation"

ELSE IF compressor is load/unload:
    // Cycling between loaded and unloaded
    Load Factor = Required Flow / Capacity
    Average Power = (Load Factor × Full Load Power) + 
                    ((1 - Load Factor) × Unload Power)
    Mode = "Load/Unload Cycling"

ELSE:
    // Start/stop
    Runtime Fraction = Required Flow / Capacity  
    Average Power = Runtime Fraction × Full Load Power
    Mode = "Start/Stop"
```

### Step 4: Calculate Total System Energy

```
For each day type:
    For each time interval:
        Apply flow allocation algorithm
        Calculate interval power
    
    Day Type Energy = Σ(Interval Power × Time Duration)
    Day Type Annual Energy = Day Type Energy × Annual Days

Total Annual Energy = Σ(All Day Type Annual Energies)
```

### Step 5: Calculate Savings

```
Baseline Energy = From baseline characterization
  (May use less optimal loading strategy)

Reallocated Energy = From optimized allocation

Energy Savings = Baseline Energy - Reallocated Energy
Annual Cost Savings = Energy Savings × Electricity Rate

Peak Demand Analysis:
  Reallocated Peak = max(Optimized Power across all intervals)
  Demand Savings = (Baseline Peak - Reallocated Peak) × 12 × Rate

Total Savings = Energy Cost Savings + Demand Savings
Simple Payback = Implementation Cost / Total Savings
```

## Example Calculation

**System Configuration:**
Three compressors with following characteristics:

| Unit | Capacity | Full Load Power | Specific Power | Efficiency Rank |
|------|----------|----------------|----------------|-----------------|
| A    | 500 CFM  | 92.5 kW        | 18.5 kW/100CFM | 1 (best)       |
| B    | 800 CFM  | 162 kW         | 20.2 kW/100CFM | 2              |
| C    | 600 CFM  | 133 kW         | 22.1 kW/100CFM | 3 (worst)      |

**Demand Scenario:** 1,000 CFM required

**Baseline Allocation** (poor strategy - load all equally):
```
A: 333 CFM → 61.6 kW (at part load)
B: 333 CFM → 67.4 kW (at part load)
C: 333 CFM → 73.6 kW (at part load)
Total: 202.6 kW
```

**Optimized Allocation** (flow reallocation):
```
Step 1: Load A fully
  A: 500 CFM → 92.5 kW (full load - efficient)

Step 2: Remaining demand = 500 CFM, load B partially
  B: 500 CFM → 101.3 kW (modulation - moderate efficiency)
  
C: 0 CFM → 0 kW (off)

Total: 193.8 kW
```

**Savings:**
```
Power Reduction = 202.6 - 193.8 = 8.8 kW (4.3%)
If operated 8,000 hours/year:
Energy Savings = 8.8 × 8,000 = 70,400 kWh/year
Cost Savings = 70,400 × $0.10 = $7,040/year

Demand Savings = 8.8 × 12 × $15 = $1,584/year

Total Annual Savings = $7,040 + $1,584 = $8,624/year

If manual (training only):
  Implementation Cost = $1,000
  Payback = 0.12 years (1.4 months)

If automated (control system):
  Implementation Cost = $10,000
  Payback = 1.2 years
```

## Trim Compressor Selection

The "trim" compressor (partially loaded unit) significantly impacts efficiency:

### VFD Compressor as Trim (Best)

```
Power at partial load:
  Power ≈ Full Load Power × (Flow Ratio)³

Example: 50% flow
  Power = 100 kW × (0.5)³ = 12.5 kW
  vs. 50 kW if power scaled linearly
  
Savings from cubic law: ~37.5 kW in this example
```

### Modulation as Trim (Good)

```
Power typically reduces to 60-80% of full load at 50% flow

Example: 50% flow, modulation
  Power ≈ 70% of full load
  Power = 100 kW × 0.70 = 70 kW
```

### Load/Unload as Trim (Fair)

```
Cycles between full load and unload
Average power = (Load Factor × Full Power) + 
                ((1-Load Factor) × Unload Power)

Example: 50% average flow
  Power = (0.5 × 100) + (0.5 × 30) = 65 kW
  
Also introduces cycling losses
```

### Start/Stop as Trim (Poor)

```
For reciprocating compressors
Runtime fraction matches flow ratio
High starting currents, wear, maintenance

Generally avoid using for frequent modulation
```

## Multi-Compressor Optimization

For systems with many compressors:

```
Sorting Algorithm:
1. Calculate specific power for all units
2. Sort ascending (most efficient first)
3. Create loading sequence

Example 5-Compressor System:
Sequence: [VFD-200hp] → [2-Stage-150hp] → [1-Stage-150hp] → 
          [1-Stage-100hp] → [Old-125hp]

Loading Logic:
- VFD always trim (best part-load)
- 2-Stage base load (most efficient)
- Others stage in as needed
- Old unit only for emergencies
```

## Operational Considerations

### Automated vs. Manual Implementation

**Automated (Sequencer/PLC):**
- Continuous optimization
- Responds to demand changes immediately  
- Consistent execution
- Higher initial cost
- Best for variable demand

**Manual (Operating Procedures):**
- Operators follow loading sequence
- Based on demand level ranges
- Lower cost
- Requires training and discipline
- Best for predictable demand patterns

### Load Rotation

To equalize compressor runtime:

```
Strategy 1: Periodic Role Rotation
  Week 1: A=base, B=trim, C=backup
  Week 2: B=base, C=trim, A=backup
  Week 3: C=base, A=trim, B=backup
  Repeat...

Strategy 2: Runtime Equalization
  Track cumulative hours
  Assign roles to balance total runtime
  Swap when difference exceeds threshold

Balance between efficiency and runtime equity
```

### Special Situations

**Unequal Capacities:**
```
May need multiple base load compressors
Example: Demand 1500 CFM
  A: 500 CFM (most efficient)
  B: 800 CFM (next efficient) 
  Both run at full load, then trim

Better than using one larger, less efficient compressor
```

**Compressor Unavailability:**
```
If most efficient unit down for maintenance:
  Use next in efficiency sequence
  Temporary increase in energy cost
  Maintain adequate capacity
```

## Validation Criteria

```
1. Capacity Check:
   Σ(Assigned Flows) = Required Demand at each interval
   All compressor capacities respected

2. Efficiency Verification:
   Confirm loading sequence follows efficiency ranking
   Trim compressor appropriate for modulation

3. Operational Limits:
   No compressor exceeds rated capacity
   Minimum turndown limits respected (VFD)
   Cycling frequency acceptable (load/unload)

4. System Stability:
   Adequate capacity margin for transients
   Backup compressor available
   Pressure requirements maintained
```

## Interactive Effects

### Foundation for Other Measures

Flow reallocation provides the baseline optimization for:
- **Sequencer Control:** Automated implementation of reallocation
- **Leak Reduction:** Reduced demand allows better allocation
- **Pressure Reduction:** Lower power benefits magnified by optimal loading
- **All modifications:** Use reallocation as starting point

### Application Sequence

Typically applied FIRST in measure sequence:
```
1. Flow Reallocation ← Establishes efficient baseline
2. Air Leak Reduction
3. Pressure Reduction
4. (Other measures)
```

This ensures all subsequent measures build on optimized allocation.

## Algorithm Outputs

| Output | Description |
|--------|-------------|
| Loading Sequence | Compressor efficiency ranking |
| Trim Compressor Assignment | Which unit modulates |
| Interval-by-Interval Loading | Specific assignments for each time period |
| Modified Energy Consumption | Annual kWh with optimized allocation |
| Energy Savings | kWh saved annually |
| Cost Savings | $ saved from energy and demand |
| Simple Payback | Years to recover investment |
| Capacity Utilization | % of time each compressor operates |

## Related Algorithms

- [Automatic Sequencer](./use_automatic_sequencer.md) - Automated implementation
- [Cascading Setpoints](./adjust_cascading_setpoints.md) - Alternative control approach
- [Compressor Performance](../compressor_inventory_item_class.md) - Part-load calculations

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
