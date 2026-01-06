# Energy Efficiency Measure Evaluation Algorithm

## Overview

The energy efficiency measure (EEM) evaluation algorithm calculates the energy, cost, and emissions impact of proposed system improvements. It applies modifications sequentially to quantify cumulative savings potential.

## Algorithm Purpose

The EEM evaluation algorithm:
1. Applies individual or combined efficiency measures to baseline system
2. Calculates energy and cost savings for each measure
3. Aggregates results across operational day types
4. Compares modified system performance to baseline
5. Determines implementation costs and payback periods

## Algorithm Inputs

### Baseline System Data
- Baseline energy consumption by day type
- Baseline costs (energy and demand charges)
- Baseline operational profiles
- Baseline CO2 emissions

### Energy Efficiency Measure Specifications

For each enabled measure:
- Measure type (leak reduction, pressure reduction, etc.)
- Measure-specific parameters (reduction amounts, setpoints, etc.)
- Implementation cost estimate

### System Configuration
- Compressor inventory and performance characteristics
- Control system capabilities
- System pressure requirements
- Air storage capacity

## Calculation Methodology

### Sequential Application Process

Energy efficiency measures are applied in sequence, with each measure using the previous measure's results as its baseline:

```
Step 1: Initialize
├── Use baseline system characterization
├── Or calculate baseline if not provided

Step 2: For Each Day Type
├── Apply enabled measures in configured sequence
├── Calculate energy consumption after each measure
├── Track incremental savings from each measure

Step 3: Aggregate Results
├── Sum energy consumption across day types
├── Calculate total savings
├── Determine modified peak demand
└── Calculate payback periods
```

### Savings Calculation Algorithm

For each efficiency measure:

**Energy Savings:**
```
Measure Energy Savings = Baseline Energy - Modified Energy
Annual Energy Cost Savings = Energy Savings × Electricity Rate
```

**Demand Savings:**
```
Modified Peak Demand = max(Modified Power across all Day Types)
Demand Cost Savings = (Baseline Peak - Modified Peak) × 12 × Demand Rate
```

**Total Savings:**
```
Total Annual Operating Cost Savings = Energy Cost Savings + Demand Cost Savings
```

**Payback Period:**
```
Simple Payback = Implementation Cost / Annual Operating Cost Savings
```

### Cumulative Savings Tracking

Measures build upon each other:
```
Original Baseline (100% energy)
   ↓ Apply Measure 1 (e.g., leak reduction)
Adjusted State 1 (95% energy) → Measure 1 savings = 5%
   ↓ Apply Measure 2 (e.g., pressure reduction)
Adjusted State 2 (90% energy) → Measure 2 savings = 5% of Adjusted State 1
   ↓ Apply Measure 3 (e.g., sequencer)
Final Modified System (85% energy) → Measure 3 savings = 5% of Adjusted State 2

Total Cumulative Savings = 15% (not simply 5% + 5% + 5%)
```

This sequential approach captures interaction effects between measures.

## Algorithm Outputs

### System-Level Results

| Metric | Description |
|--------|-------------|
| Total Baseline Energy | Annual kWh before modifications |
| Total Modified Energy | Annual kWh after all measures applied |
| Total Energy Savings | Baseline - Modified energy |
| Total Energy Cost Savings | Energy savings × electricity rate |
| Baseline Peak Demand | Maximum kW in baseline operation |
| Modified Peak Demand | Maximum kW after modifications |
| Demand Cost Savings | Peak demand reduction × 12 × rate |
| Total Operating Cost Savings | Energy + demand cost savings |
| Total CO2 Reduction | Emissions savings from energy reduction |

### Measure-Specific Results

For each efficiency measure applied:
| Metric | Description |
|--------|-------------|
| Measure Baseline | Energy state before this measure |
| Measure Modified | Energy state after this measure |
| Incremental Savings | Savings from this specific measure |
| Implementation Cost | Capital cost for this measure |
| Simple Payback | Cost / annual savings |

## Available Energy Efficiency Measures

The algorithm supports the following system improvement measures:

### 1. Air Leak Reduction
**Objective:** Quantify savings from repairing compressed air leaks

**Algorithm:**
```
Adjusted Air Flow = Baseline Air Flow - (Leak Rate × Reduction %)
Modified Energy = Calculate power for adjusted flow
Savings = Baseline Energy - Modified Energy
```

**Typical Savings:** 10-25% of baseline energy

### 2. System Pressure Reduction
**Objective:** Calculate energy savings from lower operating pressure

**Algorithm:**
```
For each compressor:
  New Pressure = Current Pressure - Reduction Amount
  Power Reduction ≈ 1% per 2 psi reduction (rule of thumb)
  Modified Power = Baseline Power × (1 - Reduction Factor)
```

**Typical Savings:** 5-10% for 10-20 psi reduction

### 3. End-Use Efficiency Improvements
**Objective:** Model impact of more efficient air-consuming equipment

**Algorithm:**
```
For each time interval:
  Adjusted Demand = Baseline Demand - Equipment Improvement
  Modified Energy = Recalculate with adjusted demand profile
```

**Typical Savings:** Variable, 5-30% depending on improvements

### 4. Automatic Sequencer Control
**Objective:** Optimize compressor loading through coordinated control

**Algorithm:**
```
Establish pressure control band:
  Base Load Target = System Pressure - Variance
  Trim Load Target = System Pressure + Variance

Load sequence optimization:
  1. Assign most efficient unit as base load
  2. Stage additional units in efficiency order
  3. Designate most flexible unit as trim
  4. Minimize part-load and blow-off operation
```

**Typical Savings:** 10-25% from reduced inefficient operation

### 5. Cascading Setpoint Optimization
**Objective:** Establish optimal pressure staging for multiple compressors

**Algorithm:**
```
Setpoint Assignment:
  Compressor 1 (most efficient): Pressure P
  Compressor 2 (medium efficient): Pressure P + ΔP
  Compressor 3 (least efficient): Pressure P + 2ΔP

Where ΔP = 5-10 psi typical staging increment
```

**Typical Savings:** 5-15% for load/unload compressors

### 6. Compressor Replacement
**Objective:** Calculate savings from replacing with more efficient unit

**Algorithm:**
```
Remove old compressor performance from system
Add new compressor performance to system
Reallocate loads based on updated efficiencies
Modified Energy = Recalculate with new configuration
```

**Typical Savings:** 10-30% when replacing with modern VFD unit

### 7. Receiver Volume Addition
**Objective:** Reduce cycling losses through increased storage

**Algorithm:**
```
Cycling Frequency ∝ 1 / Storage Volume
New Cycling Rate = Old Rate × (Old Volume + New Volume) / Old Volume
Cycling Losses ≈ 1-3% per cycle
Savings = Reduced cycling frequency × cycle loss factor
```

**Typical Savings:** 2-8% primarily from reduced cycling

### 8. Flow Reallocation
**Objective:** Optimize load distribution among compressors

**Algorithm:**
```
For each time interval:
  1. Sort compressors by specific power (efficiency)
  2. Load most efficient unit first to capacity
  3. Load next efficient unit for remaining demand
  4. Continue until demand met
  5. Select most efficient operating mode for each unit
```

**Typical Savings:** 5-15% of baseline energy

## Measure Application Sequence

Recommended application order for capturing interaction effects:

1. **Flow Reallocation** - Initial optimization baseline
2. **Air Leak Reduction** - Reduces total demand
3. **System Pressure Reduction** - Lowers power per unit flow
4. **End-Use Efficiency** - Further demand reduction
5. **Automatic Sequencer** - Optimizes control strategy
6. **Cascading Setpoints** - Refines pressure staging
7. **Compressor Replacement** - Technology upgrade
8. **Receiver Addition** - Reduces cycling losses

The sequence matters because:
- Earlier measures change the baseline for later measures
- Demand reductions amplify control optimization benefits
- Interactive effects are automatically captured

## Demand Charge Impact

Peak electrical demand significantly affects total operating costs:

**Baseline Peak Determination:**
```
Baseline Peak Demand = max(Peak Power across all Day Types)
```

**Modified Peak Determination:**
```
Modified Peak Demand = max(Peak Power after Measures across all Day Types)
```

**Demand Cost Calculation:**
```
Annual Demand Cost = Peak Demand × 12 months × Demand Rate ($/kW)
Demand Cost Savings = (Baseline Peak - Modified Peak) × 12 × Rate
```

Measures affecting peak demand include:
- Automatic sequencer (optimized staging reduces peaks)
- Pressure reduction (lower power requirements)
- Air leak reduction (reduced simultaneous compressor operation)
- Compressor replacement (more efficient units, lower power)

## Validation Criteria

Modified system configurations must satisfy:

**Capacity Validation:**
- Total available capacity ≥ maximum demand at all times
- Individual compressor limits not exceeded
- Turndown limits respected for VFD units

**Pressure Validation:**
- System can maintain minimum required pressure
- Pressure drops in distribution accounted for
- Compressor discharge pressure adequate

**Control Validation:**
- Sequencer configuration feasible with available instrumentation
- Cascading setpoints provide adequate staging separation
- Storage volume adequate for demand fluctuations

## Algorithm Applications

The EEM evaluation algorithm provides:

1. **Opportunity Quantification** - Energy and cost savings for each measure
2. **Implementation Prioritization** - Payback periods guide investment decisions
3. **Package Optimization** - Combined measures show cumulative benefits
4. **Financial Analysis** - Simple payback and annual savings

## Related Algorithms

- **Baseline System Characterization** - Provides comparison baseline
- **Day Type Modification Analysis** - Applies measures to individual operational patterns
- **Individual EEM Algorithms** - Detailed calculation methods for each measure type
- **Flow Reallocation Algorithm** - Load optimization calculations

## Algorithm Considerations

- Sequential application captures measure interactions
- Simple payback calculation (no discounting or inflation)
- Both Imperial and Metric unit systems supported
- Emission reductions use site-specific factors
- Validation prevents infeasible configurations
- Day-type granularity maintains accuracy across operational patterns

---

[← Back to Index](./index.md)
