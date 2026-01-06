# Compressed Air System Assessment Calculation Algorithms

This documentation describes the calculation algorithms used to evaluate compressed air system performance and identify energy savings opportunities. The algorithms analyze system operation through baseline characterization, energy efficiency measure evaluation, and detailed compressor performance modeling.

## Overview

The compressed air assessment employs a three-phase algorithmic approach:

1. **Baseline System Characterization** - Quantifying current system energy consumption, costs, and operational patterns
2. **Modification Impact Analysis** - Calculating energy and cost savings from proposed system improvements
3. **Compressor Performance Modeling** - Predicting compressor power consumption at various operating points

## Main Algorithm Components

### [Baseline System Calculation Algorithm](./compressed_air_assessment_baseline_results.md)

The baseline algorithm characterizes current system performance by:
- Analyzing operations across different day types (weekdays, weekends, shutdown periods)
- Aggregating hourly performance data to annual totals
- Computing system-wide energy use, costs, emissions, and air flow metrics
- Calculating electrical demand charges based on peak power draw

**Algorithm Outputs:**
- Annual energy consumption and costs
- Peak electrical demand and associated charges
- Average air flow and system capacity utilization
- Annual CO2 emissions
- Operational metrics by day type

### [Energy Efficiency Measure Evaluation Algorithm](./compressed_air_assessment_modification_results.md)

The modification algorithm evaluates system improvement opportunities by:
- Sequentially applying energy efficiency measures to the baseline
- Computing cumulative energy and cost savings
- Analyzing impacts across different operational day types
- Comparing modified system performance against baseline

**Available Energy Efficiency Measures:**
- Air leak reduction
- System pressure reduction
- End-use efficiency improvements
- Automatic sequencer control
- Cascading setpoint optimization
- Compressor replacement
- Receiver volume addition
- Flow reallocation optimization

**Algorithm Outputs:**
- Total annual energy cost savings
- Total power reduction (kWh)
- Annual operating cost savings including demand charges
- Emissions reductions
- Implementation costs and simple payback periods

### [Compressor Performance Modeling Algorithm](./compressor_inventory_item_class.md)

The compressor model predicts individual unit performance by:
- Calculating power consumption at defined operating points
- Adapting calculations to compressor type and control strategy
- Modeling load/unload, modulation, VFD, and other control methods
- Adjusting performance for system modifications (pressure changes, sequencer control)

**Performance Operating Points:**
The algorithm evaluates compressor performance at key operating conditions:

#### Standard Operating Points:
- **Full Load** - Rated capacity at design discharge pressure
- **Maximum Flow** - Peak capacity at control band upper pressure
- **No Load** - Compressor running with zero air production
- **Unload Point** - Transition from loaded to unloaded operation

#### Variable Frequency Drive (VFD) Specific Points:
- **Mid Turndown** - Intermediate capacity between full load and minimum
- **Minimum Turndown** - Lowest stable operating capacity

#### Centrifugal Compressor Specific Points:
- **Blowoff** - Operation with surge prevention valve active

The specific operating points used depend on the compressor type (rotary screw, reciprocating, centrifugal) and control strategy (load/unload, modulation, VFD). Detailed operating point applicability is described in the [Compressor Performance Modeling documentation](./compressor_inventory_item_class.md) and [Performance Points Algorithm documentation](./performance_points_system.md).

### Additional Algorithm Documentation

For detailed technical methodology:

- **[Performance Points Calculation Algorithm](./performance_points_system.md)** - Algorithms for calculating power consumption, air flow, and pressure at each operating point for different compressor types and control strategies
- **[Energy Efficiency Measures Algorithms](./energy_efficiency_measures.md)** - Detailed calculation methodologies for each system improvement measure, including interaction effects and validation criteria

## Calculation Algorithm Flow

```
1. Baseline System Characterization
   ├── Load hourly system profile data for each day type
   ├── Initialize compressor performance models
   ├── Apply sequencer control adjustments (if applicable)
   ├── Calculate energy consumption for each day type
   └── Aggregate to annual totals with weighted averages

2. Energy Efficiency Measure Evaluation
   ├── Begin with baseline system state
   ├── Apply each enabled efficiency measure sequentially
   │   ├── Adjust system parameters per measure algorithm
   │   ├── Recalculate system energy consumption
   │   └── Track incremental savings
   └── Calculate total cumulative savings and payback

3. Compressor Performance Calculations
   ├── Determine applicable operating points per compressor
   ├── Calculate air flow, discharge pressure, and power at each point
   ├── Apply control strategy logic
   └── Adjust for modification scenarios
```

## Day Type Analysis Methodology

The algorithms analyze system performance separately for different operational patterns:
- **Production Days** - Normal manufacturing operations
- **Reduced Schedule Days** - Weekends or partial production
- **Shutdown Periods** - Maintenance or no production

For each operational pattern:
- Hourly air demand profile is analyzed
- Number of annual occurrences is specified
- Compressor control strategies may vary

This segmented approach ensures accurate annual energy projections by capturing operational variability.

## Algorithm Inputs and Data Requirements

The calculation algorithms require:
- Compressor specifications (capacity, rated pressure, rated power, type)
- Control system type (load/unload, modulation, VFD, etc.)
- Hourly system air demand profiles
- Operating schedule (day types and annual frequencies)
- Electricity rates (energy and demand charges)
- Atmospheric pressure at installation site
- System pressure requirements
- Air storage capacity

## Additional Resources

- Related calculation models documented in source files
- Compressor and control type definitions in inventory documentation

---

*This documentation describes calculation algorithms for compressed air system energy assessment.*
