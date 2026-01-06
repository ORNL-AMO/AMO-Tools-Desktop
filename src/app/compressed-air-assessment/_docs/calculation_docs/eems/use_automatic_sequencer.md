# Automatic Sequencer Control Algorithm

## Overview

An automatic sequencer coordinates multiple compressor operation to optimize energy efficiency. It determines which compressors run, in what order, and at what loading to meet system demand while minimizing energy consumption.

## Objective

Calculate energy savings from implementing coordinated compressor control that:
- Loads compressors in optimal sequence
- Minimizes part-load and unloaded operation
- Eliminates compressors "fighting" each other
- Maintains tight pressure control

## Algorithm Inputs

### Sequencer Configuration
- **Target System Pressure** (psig or barg)
  - Desired operating pressure setpoint
  - Typically at minimum acceptable system pressure

- **Pressure Control Band** (psi or bar)
  - ± Variance from target pressure
  - Typical range: 2-5 psi
  - Tighter band = better control, more cycling

### Compressor Roles
The algorithm assigns compressors to specific roles:
- **Base Load:** Most efficient unit, runs continuously
- **Trim:** Variable load unit, modulates to meet changing demand
- **Backup:** Additional capacity for peak demand

### Economic Parameters
- **Implementation Cost** ($)
  - Sequencer controller: $10,000-$30,000
  - Pressure transducers: $1,000-$3,000 each
  - Communication wiring/network
  - Programming and commissioning
  - Typical total: $20,000-$50,000

- **Electricity Rate** ($/kWh)
- **Demand Charge Rate** ($/kW-month)

## Calculation Algorithm

### Step 1: Assign Compressor Roles

Analyze compressor inventory to determine optimal assignments:

```
Efficiency Ranking:
    Calculate specific power for each compressor:
        Specific Power = Full Load Power / Full Load Capacity
    
    Sort compressors by specific power (lowest = most efficient)

Base Load Selection:
    Base Load = Most efficient compressor
    Rationale: Runs most hours, maximize efficiency

Trim Selection:
    If VFD available:
        Trim = VFD compressor (best part-load efficiency)
    Else if modulation available:
        Trim = Modulation compressor (better than load/unload)
    Else:
        Trim = Next most efficient compressor
    
    Rationale: Trim follows varying demand, needs good part-load performance

Backup Selection(s):
    Backup = Remaining compressors in efficiency order
    Rationale: Run only during peak demand periods
```

### Step 2: Adjust Compressor Setpoints

Apply sequencer pressure control strategy:

```
Base Load Compressor:
    Load Setpoint = Target Pressure - Variance
    Unload Setpoint = Target Pressure + Variance
    
    Operates in narrow band around lower pressure

Trim Compressor:
    If VFD:
        Maintains Target Pressure via speed control
    Else:
        Load Setpoint = Target Pressure
        Unload Setpoint = Target Pressure + Variance

Backup Compressor(s):
    Load Setpoint = Target Pressure + Variance
    Unload Setpoint = Target Pressure + 2×Variance
    
    Only loads if trim at capacity and pressure continues rising
```

### Step 3: Simulate Sequenced Operation

For each time interval in each day type:

```
Required Air Flow = System Demand at interval

Stage 1: Base Load
    If Required Flow ≤ Base Compressor Capacity:
        Base Load Power = Calculate at required flow
        Other compressors OFF
    
    Else:
        Base Load Power = Full load power
        Remaining Demand = Required Flow - Base Capacity

Stage 2: Trim
    If Remaining Demand > 0:
        If Trim is VFD:
            Trim Power = Calculate at required flow (excellent part-load efficiency)
        Else if Trim is modulation:
            Trim Power = Calculate at modulated flow (moderate part-load efficiency)
        Else:
            If Remaining Demand < Trim Capacity:
                Trim cycles load/unload (average power calculated)
            Else:
                Trim at full load
                Additional Remaining = Remaining - Trim Capacity

Stage 3: Backup(s)
    If Additional Remaining > 0:
        Load backup compressors in sequence
        Calculate power for each
    
Total Interval Power = Σ(All loaded compressor powers)
```

### Step 4: Compare to Baseline

Baseline operation (without sequencer):
- Multiple compressors may run simultaneously at part-load
- Compressors may have conflicting setpoints
- More cycling, more unloaded running
- Less efficient loading patterns

```
Baseline Energy = From baseline characterization
Sequenced Energy = Σ(Sequenced Power × Time × Days)

Energy Savings = Baseline Energy - Sequenced Energy
```

### Step 5: Calculate Cost Savings

```
Energy Cost Savings = Energy Savings × Electricity Rate

Peak Demand Analysis:
    Baseline Peak = max(Baseline Power)
    Sequenced Peak = max(Sequenced Power)
    
    Typically sequenced peak is lower:
    - Avoids multiple compressors ramping simultaneously
    - Better staging prevents pressure overshoot
    
    Demand Savings = (Baseline Peak - Sequenced Peak) × 12 × Rate

Total Annual Savings = Energy Cost Savings + Demand Savings
```

### Step 6: Calculate Payback

```
Simple Payback = Implementation Cost / Total Annual Savings
```

## Sequencer Control Logic

### Basic Sequencing Algorithm

```
INITIALIZE:
    Set base load to run continuously
    Set trim ready to load as needed
    Set backups offline

EVERY CONTROL CYCLE (e.g., every second):
    Read current system pressure
    Read current air flow (if available)
    
    IF Pressure < (Target - Variance):
        // Pressure too low, need more capacity
        IF Trim not running:
            Start trim compressor
        ELSE IF Trim at full capacity:
            IF Backup available:
                Start next backup in sequence
    
    ELSE IF Pressure > (Target + Variance):
        // Pressure too high, reduce capacity
        IF Backup running:
            Unload backup compressor
        ELSE IF Trim can reduce:
            Reduce trim load (VFD) or unload (load/unload)
    
    ELSE:
        // Pressure within band, maintain current state
        Continue current loading pattern
```

### Advanced Features

**Load Rotation:**
```
Periodically rotate compressor roles:
    - Equalizes runtime across fleet
    - Prevents single unit overuse
    - Typical rotation: weekly or monthly
```

**Demand Anticipation:**
```
If historical demand data available:
    Anticipate load increases/decreases
    Pre-stage compressors before demand spike
    Prevents pressure sag during ramp-up
```

**Pressure Optimization:**
```
Continuously analyze system:
    IF pressure consistently at high end of band:
        Reduce target pressure slightly
        Maximize savings
    
    Ensure minimum end-use requirements still met
```

## Example Calculation

**System Configuration:**
- 3 compressors: 200 hp (150 kW), 150 hp (112 kW), 100 hp (75 kW)
- Current operation: All run in load/unload, uncoordinated
- Baseline energy: 800,000 kWh/year
- Baseline cost: $80,000/year

**Sequencer Assignment:**
- Base Load: 100 hp unit (most efficient per CFM)
- Trim: 150 hp unit (modulation capable)
- Backup: 200 hp unit (peak demand only)

**Results:**
```
Baseline Operation:
- All 3 units cycle frequently
- Simultaneous unloaded running: ~20% of time
- Part-load inefficiency
- Pressure swings: ±10 psi

Sequenced Operation:
- Base load runs 90% time at full load (efficient)
- Trim modulates for varying demand (good part-load)
- Backup only during peak (10% time)
- Pressure swings: ±3 psi

Energy Savings:
Modified Energy = 680,000 kWh/year (15% reduction typical)
Energy Savings = 120,000 kWh
Energy Cost Savings = 120,000 × $0.10 = $12,000/year

Demand Savings:
Baseline Peak = 337 kW (all 3 units)
Sequenced Peak = 300 kW (better staging)
Demand Reduction = 37 kW
Demand Savings = 37 × 12 × $15 = $6,660/year

Total Annual Savings = $12,000 + $6,660 = $18,660/year

Implementation Cost = $35,000
Simple Payback = $35,000 / $18,660 = 1.9 years
```

## Savings Mechanisms

Sequencer saves energy through multiple mechanisms:

### 1. Reduced Unloaded Running
```
Baseline: Multiple compressors unloaded simultaneously
Sequenced: Only trim compressor modulates; others fully loaded or OFF

Unloaded Power Waste = Unload Power × Unloaded Hours
Typical savings from this alone: 5-10%
```

### 2. Eliminated Blow-Off
```
Baseline: Excess capacity vented (centrifugal) or blown off
Sequenced: Tight control prevents overproduction

Typical savings: 5-10% if blow-off was significant
```

### 3. Optimized Part-Load Operation
```
Baseline: Wrong compressor modulating (e.g., large fixed-speed cycling)
Sequenced: Best part-load compressor (VFD) handles varying demand

Typical savings: 3-8%
```

### 4. Reduced Cycling Losses
```
Each load/unload cycle wastes energy:
- Acceleration power
- Control system power
- Transition inefficiencies

Sequenced operation: Fewer total cycles
Typical savings: 2-5%
```

### 5. Lower Operating Pressure
```
Tight control allows lower average pressure:
- Baseline: Higher setpoint for safety margin
- Sequenced: Confidence in control allows lower target

Pressure reduction benefit: 1% per 2 psi
```

## Implementation Considerations

### System Requirements

**Minimum Requirements:**
- At least 2 compressors (preferably 3+)
- Controllable setpoints (local or remote)
- Communication capability (hardwired or network)
- Pressure transducer(s) at key locations

**Ideal Configuration:**
- Mix of compressor types (fixed + VFD)
- Different capacities for flexible staging
- Modern controls with network capability
- Multiple pressure monitoring points

### Communication Methods

**Option 1: Hardwired I/O**
- Start/stop signals to each compressor
- Analog inputs for pressure sensors
- Reliable, deterministic
- Limited flexibility

**Option 2: Network (Modbus, Ethernet/IP, etc.)**
- More data available (power, alarms, etc.)
- More flexible control
- Requires compatible equipment
- Potential network issues

**Option 3: Hybrid**
- Critical controls hardwired
- Additional data via network
- Best reliability with enhanced features

### Commissioning Process

```
1. Baseline Data Collection (1-2 weeks)
   - Record current operation
   - Pressure profiles
   - Power consumption
   - Identify issues

2. Sequencer Programming
   - Configure roles
   - Set pressures
   - Test communication
   - Program logic

3. Initial Testing (1 week)
   - Monitor closely
   - Verify compressor responses
   - Check pressure stability
   - Adjust parameters

4. Optimization (2-4 weeks)
   - Fine-tune setpoints
   - Adjust staging
   - Optimize rotation
   - Train operators

5. Verification (1 week)
   - Measure savings
   - Document settings
   - Create operating procedures
```

## Validation Criteria

Sequenced system must satisfy:

```
1. Pressure Control:
   - System pressure maintained within control band
   - No end-use equipment issues
   - Acceptable pressure variation

2. Capacity:
   - Adequate capacity for all demand scenarios
   - Backup available for contingencies
   - Peak demand can be met

3. Control Response:
   - Compressors respond to commands
   - Communication reliable
   - No excessive cycling

4. Efficiency:
   - Base load runs at high load factor
   - Trim handles variations efficiently
   - Backup only during true peaks
```

## Algorithm Outputs

| Output | Description |
|--------|-------------|
| Compressor Role Assignments | Base, trim, backup designations |
| Setpoint Configuration | Load/unload pressures for each unit |
| Modified Energy Consumption | Annual kWh with sequencer |
| Energy Savings | kWh saved annually |
| Energy Cost Savings | $ saved from energy |
| Demand Savings | $ saved from peak demand management |
| Total Annual Savings | Combined savings |
| Simple Payback | Years to recover investment |
| Pressure Control Performance | Average pressure, variation, stability |

## Related Algorithms

- [Cascading Setpoints](./adjust_cascading_setpoints.md) - Alternative pressure staging approach
- [Flow Reallocation](./flow_reallocation.md) - Basis for optimal loading sequence
- [Compressor Performance](../compressor_inventory_item_class.md) - Power calculations at various loads

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
