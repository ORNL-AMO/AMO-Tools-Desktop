# Cascading Setpoint Optimization Algorithm

## Overview

Cascading setpoint optimization assigns specific pressure setpoints to each compressor in a multi-compressor system, creating a "cascade" where units load sequentially at progressively higher pressures. This prevents multiple compressors from operating simultaneously at part-load.

## Objective

Maximize system efficiency by:
- Ensuring most efficient compressor runs at full load
- Staging less efficient units only when needed
- Minimizing pressure while meeting demand
- Reducing simultaneous part-load operation

## Algorithm Inputs

### Compressor Configuration
- Number of compressors in system
- Efficiency ranking (specific power for each)
- Control type for each compressor
- Capacity of each unit

### Setpoint Parameters
- **Base Pressure** (psig or barg)
  - Lowest acceptable system pressure
  - Assigned to most efficient compressor
  
- **Staging Increment** (psi or bar)
  - Pressure difference between compressor setpoints
  - Typical: 5-10 psi (0.35-0.7 bar)
  - Too small: excessive cycling
  - Too large: higher average pressure

### Economic Parameters
- **Implementation Cost** ($)
  - Control adjustment/reprogramming: $1,000-$5,000
  - Pressure transducer validation: $500-$1,000
  - Commissioning and testing: $1,000-$3,000
  - Total typical: $2,500-$9,000

- **Electricity Rate** ($/kWh)
- **Demand Charge Rate** ($/kW-month)

## Calculation Algorithm

### Step 1: Rank Compressors by Efficiency

```
For each compressor:
    Specific Power = Full Load Power / Full Load Capacity × 100
    
Sort compressors by specific power (ascending):
    Rank 1 = Most efficient (lowest specific power)
    Rank 2 = Medium efficiency
    Rank 3+ = Less efficient
```

### Step 2: Assign Cascading Setpoints

```
Base Pressure = Minimum acceptable system pressure

For each compressor in efficiency order:
    Load Pressure = Base Pressure + ((Rank - 1) × Staging Increment)
    Unload Pressure = Load Pressure + Control Band
    
Example with 3 compressors, Base = 100 psi, Increment = 7 psi:
    Compressor A (most efficient, Rank 1):
        Load: 100 psi, Unload: 105 psi
    
    Compressor B (medium, Rank 2):
        Load: 107 psi, Unload: 112 psi
    
    Compressor C (least efficient, Rank 3):
        Load: 114 psi, Unload: 119 psi
```

### Step 3: Simulate Cascaded Operation

For each time interval:

```
Current System Pressure = Starting pressure
Required Air Flow = Demand at this interval

Compressor Loading:
    Initialize: All compressors unloaded
    
    IF Pressure < Compressor A Load Pressure:
        Start Compressor A
        A produces air until pressure reaches A Unload Pressure
        
    IF Pressure < Compressor B Load Pressure AND A at capacity:
        Start Compressor B
        B produces air until pressure reaches B Unload Pressure
    
    IF Pressure < Compressor C Load Pressure AND A,B at capacity:
        Start Compressor C
        C produces air
    
    As demand decreases and pressure rises:
        Compressors unload in reverse order (C, then B, then A)

Calculate power for each loaded compressor
Sum total system power for interval
```

### Step 4: Calculate System Energy

```
For each day type:
    For each time interval:
        Simulate cascaded operation
        Calculate power consumption
    
    Day Type Energy = Σ(Interval Power × Duration)

Total Annual Energy = Σ(Day Type Energy × Annual Days)
```

### Step 5: Calculate Savings

```
Baseline Energy = From baseline characterization
  (Compressors with overlapping setpoints or all at same pressure)

Cascaded Energy = With optimized setpoints

Energy Savings = Baseline Energy - Cascaded Energy
Annual Cost Savings = Energy Savings × Electricity Rate

Demand Savings:
  Cascaded Peak may be lower due to better staging
  Demand Savings = Peak Reduction × 12 × Rate

Total Savings = Energy Cost Savings + Demand Savings
Simple Payback = Implementation Cost / Total Savings
```

## Staging Increment Selection

The spacing between setpoints significantly impacts performance:

### Too Small (< 3 psi)

**Issues:**
- Excessive cycling (compressors load/unload frequently)
- Multiple compressors may load simultaneously
- Control instability
- Increased wear

```
Example: 2 psi increment
A loads at 100 psi, unloads at 105 psi
B loads at 102 psi, unloads at 107 psi

Overlap: Both can run simultaneously in 102-105 psi range
Result: Defeats purpose of cascading
```

### Optimal (5-10 psi)

**Benefits:**
- Clear staging separation
- Single compressor typically handles each demand level
- Stable control
- Good efficiency

```
Example: 7 psi increment
A: 100-105 psi
B: 107-112 psi  (2 psi gap prevents overlap)
C: 114-119 psi

Each compressor has distinct operating range
Sequential loading well-defined
```

### Too Large (> 15 psi)

**Issues:**
- Higher average system pressure
- Increased energy consumption
- May not meet low-pressure demand efficiently

```
Example: 20 psi increment
A: 100-105 psi
B: 120-125 psi
C: 140-145 psi

When B runs, system pressure 15-20 psi higher than needed
Wastes energy through higher pressure operation
```

## Example Calculation

**System Parameters:**
- 3 compressors: 150 hp (most efficient), 125 hp (medium), 100 hp (least efficient)
- Base pressure: 95 psig
- Staging increment: 7 psi
- Baseline: All at 100 psig setpoint
- Annual operating hours: 6,000

**Baseline Operation:**
```
All three at same 100 psig setpoint:
- Frequently run simultaneously at part-load
- Fight each other, cause pressure swings
- Inefficient part-load operation
- Average power: 265 kW
```

**Cascaded Setpoints:**
```
Compressor 150hp (most efficient): 95-100 psig
Compressor 125hp (medium): 102-107 psig  
Compressor 100hp (least efficient): 109-114 psig

Operating Pattern:
- 150hp runs ~70% of time (handles base load efficiently)
- 125hp runs ~25% of time (medium demand periods)
- 100hp runs ~5% of time (peak demand only)

Average power: 238 kW (10% reduction)
```

**Savings Calculation:**
```
Power Reduction = 265 - 238 = 27 kW
Energy Savings = 27 × 6,000 = 162,000 kWh/year
Energy Cost Savings = 162,000 × $0.10 = $16,200/year

Demand Savings = 27 × 12 × $15 = $4,860/year

Total Annual Savings = $16,200 + $4,860 = $21,060/year
Implementation Cost = $5,000
Simple Payback = 5,000 / 21,060 = 0.24 years (3 months)
```

## Compressor Type Considerations

### Load/Unload Compressors (Ideal Application)

Most benefit from cascading:
```
Each compressor has clear load/unload points
Staging naturally prevents overlap
Typical savings: 10-20%
```

### Modulation Compressors

Some benefit, but less dramatic:
```
Can still modulate within their assigned range
Cascading ensures most efficient unit modulates first
Typical savings: 5-10%
```

### VFD Compressors

Limited benefit from cascading alone:
```
VFD already provides good part-load efficiency
Cascading ensures VFD handles trim duty
Better implemented with full sequencer
Typical savings: 3-7%
```

### Centrifugal Compressors

Cascading applicable with modifications:
```
Use surge prevention controls
Ensure adequate staging separation
Monitor for surge conditions
Typical savings: 8-15%
```

## Implementation Procedure

### Step 1: Document Baseline

```
1. Record current setpoints for all compressors
2. Measure current system pressure profile (1 week minimum)
3. Document power consumption
4. Note any operational issues
```

### Step 2: Calculate Optimal Setpoints

```
1. Rank compressors by efficiency (kW/100CFM)
2. Determine minimum acceptable system pressure
3. Select staging increment (7 psi typical)
4. Calculate setpoints per algorithm
```

### Step 3: Implement Gradually

```
Week 1: Adjust most efficient compressor to base pressure
  - Monitor system closely
  - Verify no end-use issues
  - Confirm pressure adequate

Week 2: Adjust second compressor to cascaded setpoint
  - Observe staging behavior
  - Verify sequential loading
  - Check for cycling issues

Week 3: Adjust remaining compressors
  - Complete cascade implementation
  - Fine-tune staging increment if needed
```

### Step 4: Optimize and Validate

```
1. Monitor for 2-4 weeks
2. Adjust staging increment if:
   - Excessive cycling observed
   - Multiple units loading together
   - Pressure too high/low
3. Measure energy consumption
4. Calculate actual savings
5. Document final settings
```

## Validation Criteria

```
1. Staging Verification:
   - Compressors load in efficiency order
   - Clear separation between load points
   - No simultaneous part-load operation (except trim)

2. Pressure Control:
   - System pressure adequate for all end-uses
   - Acceptable pressure variation
   - No production issues

3. Cycling Check:
   - Load/unload frequency reasonable (< 4-6 cycles/hour)
   - Compressors have adequate runtime when loaded
   - Control stable

4. Efficiency:
   - Most efficient unit has highest load factor
   - Least efficient unit minimal runtime
   - Measurable energy reduction
```

## Interactive Effects

### Works Well With:
- **Load/Unload Compressors:** Primary application
- **Leak Reduction:** Lower demand allows better staging
- **Pressure Reduction:** Can reduce base pressure further

### May Conflict With:
- **Automatic Sequencer:** Sequencer provides superior control
  - Use cascading OR sequencer, not both
  - Sequencer preferred if available and affordable
  
- **VFD Compressors:** VFD better suited for trim duty
  - Assign VFD to trim role regardless of efficiency
  - Cascade other fixed-speed units

## Algorithm Outputs

| Output | Description |
|--------|-------------|
| Compressor Setpoints | Load/unload pressures for each unit |
| Loading Sequence | Expected order of operation |
| Modified Energy Consumption | Annual kWh with cascaded setpoints |
| Energy Savings | kWh saved annually |
| Cost Savings | $ saved from energy and demand |
| Simple Payback | Years to recover investment |
| Average System Pressure | Expected pressure with cascading |

## Related Algorithms

- [Automatic Sequencer](./use_automatic_sequencer.md) - More sophisticated control alternative
- [Flow Reallocation](./flow_reallocation.md) - Efficiency ranking methodology
- [Compressor Performance](../compressor_inventory_item_class.md) - Power calculations

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
