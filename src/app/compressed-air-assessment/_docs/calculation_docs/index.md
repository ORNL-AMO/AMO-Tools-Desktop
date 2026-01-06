# Compressed Air Assessment Calculation Documentation

This documentation provides detailed information about the calculation logic for the compressed air assessment tool. The calculations are organized into three main components that work together to evaluate compressed air system performance and potential energy savings.

## Overview

The compressed air assessment calculation system analyzes compressed air systems by:

1. **Establishing a Baseline** - Calculating current system performance across different day types
2. **Evaluating Modifications** - Applying energy efficiency measures to identify savings opportunities
3. **Modeling Compressor Performance** - Accurately predicting compressor behavior at various operating points

## Main Components

### [CompressedAirAssessmentBaselineResults](./compressed_air_assessment_baseline_results.md)

The baseline results class calculates the current state of the compressed air system. It:
- Breaks down calculations by day type (e.g., weekday, weekend, shutdown)
- Aggregates performance metrics across all day types
- Provides system-wide totals for energy use, cost, emissions, and air flow
- Calculates demand costs based on peak power usage

**Key Outputs:**
- Total annual energy cost and consumption
- Peak demand and associated costs
- Average air flow and capacity utilization
- Annual CO2 emissions
- Day-type specific performance metrics

### [CompressedAirAssessmentModificationResults](./compressed_air_assessment_modification_results.md)

The modification results class evaluates the impact of energy efficiency measures. It:
- Applies various energy efficiency measures (EEMs) to the baseline
- Calculates savings from each modification
- Breaks down results by day type
- Compares baseline vs. modified system performance

**Energy Efficiency Measures (EEMs) Include:**
- Reduce air leaks
- Reduce system air pressure
- Improve end-use efficiency
- Use automatic sequencer
- Adjust cascading set points
- Replace compressors
- Add receiver volume
- Flow reallocation

**Key Outputs:**
- Total energy cost savings
- Total power savings (kWh or energy units)
- Annual operating cost savings
- Emissions reductions
- Implementation costs and payback periods

### [CompressorInventoryItemClass](./compressor_inventory_item_class.md)

The compressor inventory item class models individual compressor performance. It:
- Defines performance characteristics at various operating points
- Adjusts calculations based on compressor and control types
- Handles different control strategies (load/unload, modulation, VFD, etc.)
- Supports modification scenarios (pressure reduction, sequencer adjustments)

**Performance Points:**
The performance points used depend on the compressor type and control type:

#### Common Performance Points:
- **Full Load** - Rated capacity at design pressure
- **Max Full Flow** - Maximum capacity at specified pressure
- **No Load** - Compressor running but not producing air
- **Unload Point** - Transition point for load/unload controls

#### VFD-Specific Performance Points:
- **Mid Turndown** - Intermediate capacity point
- **Turndown** - Minimum stable operating point

#### Centrifugal-Specific Performance Points:
- **Blowoff** - Operating point with blowoff valve active

For detailed information about which performance points apply to specific compressor and control type combinations, see the [CompressorInventoryItemClass documentation](./compressor_inventory_item_class.md).

## Calculation Flow

```
1. Baseline Calculation
   ├── Load system profile data by day type
   ├── Initialize compressor inventory items
   ├── Apply sequencer adjustments (if applicable)
   ├── Calculate day-type specific performance
   └── Aggregate to annual totals

2. Modification Calculation
   ├── Start with baseline results
   ├── Apply energy efficiency measures in order
   │   ├── Adjust system parameters
   │   ├── Recalculate performance
   │   └── Track cumulative savings
   └── Calculate total savings and payback

3. Performance Point Calculations
   ├── Determine applicable performance points
   ├── Calculate airflow, pressure, and power
   ├── Apply control type logic
   └── Adjust for modifications
```

## Day Type Breakdown

The system analyzes performance separately for different operational day types, such as:
- **Weekdays** - Normal production days
- **Weekends** - Reduced production schedules
- **Shutdown Days** - Minimal or no production

Each day type has:
- Unique system profile data (hourly air demand)
- Number of operating days per year
- Specific compressor control strategies

This granular analysis ensures accurate annual energy and cost projections.

## Data Models

For technical implementation details about the data structures used in these calculations, refer to:
- `caCalculationModels.ts` - Core interfaces for results, savings, and baseline data
- `caCalculationHelpers.ts` - Utility functions for calculations

## Additional Resources

- [Inventory Options Documentation](../inventory_options.md) - Compressor and control type definitions
- Source code: `src/app/compressed-air-assessment/calculations/`

---

*For questions or contributions, please refer to the main project repository.*
