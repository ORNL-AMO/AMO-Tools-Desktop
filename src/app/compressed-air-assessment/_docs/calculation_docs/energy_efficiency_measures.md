# Energy Efficiency Measures - Overview

## Introduction

Energy Efficiency Measures (EEMs) are system improvements that reduce compressed air energy consumption. This document provides an overview of available measures and links to detailed algorithmic documentation for each.

## Available Measures

The compressed air assessment evaluates the following energy efficiency measures:

### Demand-Side Measures

1. **[Air Leak Reduction](./eems/reduce_air_leaks.md)**
   - Reduces system air demand by repairing leaks
   - Typical savings: 10-25% of baseline energy
   - Quick payback: 3-12 months typical

2. **[End-Use Efficiency Improvements](./eems/improve_end_use_efficiency.md)**
   - More efficient air-consuming equipment
   - Typical savings: 5-30% depending on improvements
   - Variable payback based on equipment costs

### Supply-Side Pressure Measures

3. **[System Pressure Reduction](./eems/reduce_system_air_pressure.md)**
   - Lower operating pressure reduces power consumption
   - Typical savings: 5-10% for 10-20 psi reduction
   - Rule of thumb: 1% energy savings per 2 psi reduction

### Control System Measures

4. **[Automatic Sequencer Control](./eems/use_automatic_sequencer.md)**
   - Coordinates multiple compressor operation
   - Typical savings: 10-25% from optimized control
   - Eliminates inefficient simultaneous operation

5. **[Cascading Setpoint Optimization](./eems/adjust_cascading_setpoints.md)**
   - Optimizes pressure staging for load/unload compressors
   - Typical savings: 5-15%
   - Best for systems with multiple compressors

6. **[Flow Reallocation](./eems/flow_reallocation.md)**
   - Optimizes load distribution among compressors
   - Typical savings: 5-15%
   - Assigns load to most efficient units first

### Equipment Measures

7. **[Compressor Replacement](./eems/replace_compressor.md)**
   - Replace with more efficient technology
   - Typical savings: 10-30% when upgrading to VFD
   - Longer payback: 3-7 years typical

8. **[Receiver Volume Addition](./eems/add_receiver_volume.md)**
   - Increased storage reduces cycling losses
   - Typical savings: 2-8%
   - Primary benefit is reduced wear and improved stability

## Sequential Application Methodology

EEMs are applied sequentially, with each using the previous result as its baseline:

```
Original Baseline (100%)
   ↓
Measure 1 Applied → Adjusted Baseline 1 (95%)
   ↓
Measure 2 Applied → Adjusted Baseline 2 (91%)
   ↓
Measure 3 Applied → Final Modified System (86%)

Total Savings = 14% (captures interaction effects)
```

This approach ensures:
- Interaction effects are captured
- Cumulative savings are accurate
- Each measure shows incremental benefit

## Recommended Application Sequence

1. Flow Reallocation (baseline optimization)
2. Air Leak Reduction (demand reduction)
3. System Pressure Reduction (supply efficiency)
4. End-Use Efficiency (further demand reduction)
5. Automatic Sequencer (control optimization)
6. Cascading Setpoints (pressure staging)
7. Compressor Replacement (technology upgrade)
8. Receiver Addition (cycling reduction)

## Implementation Priority Framework

### Quick Wins (< 2 year payback)
- Air leak reduction
- System pressure reduction (if applicable)
- Flow reallocation (control changes only)

### Medium-Term (2-5 year payback)
- Automatic sequencer installation
- End-use equipment improvements
- Receiver volume addition

### Long-Term (> 5 year payback)
- Compressor replacement
- Major system redesign

## Measure Selection Criteria

When evaluating measures, consider:

**Technical Feasibility:**
- Can end-uses operate at lower pressure?
- Is control system capable of sequencing?
- Are compressor capacities appropriate?
- Is electrical service adequate?

**Economic Viability:**
- Implementation cost vs. annual savings
- Simple payback period
- Available capital budget
- Utility incentive programs

**Operational Impact:**
- Production schedule disruption
- Maintenance requirements
- Operator training needs
- System reliability effects

## Savings Calculation Framework

For each measure:

```
Energy Savings (kWh) = Baseline Energy - Modified Energy
Cost Savings ($/year) = Energy Savings × Electricity Rate
Demand Savings ($/year) = Peak Demand Reduction × 12 × Demand Rate
Total Annual Savings = Energy Cost Savings + Demand Cost Savings
Simple Payback (years) = Implementation Cost / Total Annual Savings
```

## Validation Requirements

All modifications must satisfy:

**Capacity:** System meets air demand at all times
**Pressure:** Minimum pressure requirements maintained
**Control:** Configuration achievable with available controls
**Safety:** Operating limits not exceeded

## Related Documentation

- [Baseline System Characterization](./compressed_air_assessment_baseline_results.md)
- [Modification Evaluation Algorithm](./compressed_air_assessment_modification_results.md)
- [Compressor Performance Modeling](./compressor_inventory_item_class.md)

---

[← Back to Index](./index.md)
