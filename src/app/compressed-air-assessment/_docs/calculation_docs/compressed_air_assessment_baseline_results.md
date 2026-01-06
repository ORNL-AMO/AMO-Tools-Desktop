# Baseline System Characterization Algorithm

## Overview

The baseline characterization algorithm quantifies current compressed air system performance by analyzing operational data across different day types and aggregating to annual totals. This establishes the reference point for evaluating energy efficiency improvements.

## Algorithm Purpose

The baseline algorithm:
1. Quantifies current system energy consumption and costs
2. Analyzes performance variations across operational patterns (day types)
3. Calculates annual totals from time-weighted operational data
4. Establishes comparison metrics for efficiency measure evaluation

## Algorithm Inputs

### System Configuration Data
- Compressor inventory (capacity, pressure, power ratings, type, control method)
- System air storage volume
- Atmospheric pressure at site
- Target operating pressure and control band

### Operational Profile Data
- Hourly air demand for each day type
- Number of annual occurrences per day type
- Data sampling interval (e.g., 1-hour, 15-minute)

### Economic Parameters
- Electricity energy rate ($/kWh)
- Electrical demand charge rate ($/kW-month)
- CO2 emission factors

## Calculation Methodology

### Step 1: Day Type Profile Analysis

For each operational day type:

**a) Compressor Performance Evaluation**
- For each time interval in the profile:
  - Determine required system air flow
  - Allocate load to available compressors based on control strategy
  - Calculate power consumption for each compressor at allocated load
  - Sum compressor power for interval

**b) Apply Sequencer Control (if configured)**
- Adjust compressor pressure setpoints for coordinated control
- Set base compressor to targetPressure - variance
- Set trim compressor to targetPressure + variance
- Optimize loading sequence to minimize energy

**c) Calculate Day Type Metrics**
- Sum energy consumption across all intervals: ΣPower × TimeInterval
- Calculate average air flow: (Σ(Flow × Days)) / TotalDays
- Identify peak power demand: max(PowerInterval)
- Calculate average capacity utilization
- Determine load factor: AveragePower / PeakPower
- Calculate CO2 emissions based on energy and emission factors

### Step 2: Annual Aggregation

Combine day type results into system totals:

**Annual Energy Metrics:**
```
Total Annual Energy = Σ(DayType Energy × Annual Occurrences)
Total Annual Cost = Total Energy × Energy Rate
Total CO2 Emissions = Σ(DayType Emissions × Annual Occurrences)
```

**Time-Weighted Averages:**
```
Average Air Flow = Σ(DayType Avg Flow × Days) / 365
Average Capacity % = Σ(DayType Capacity % × Days) / 365
Average Load Factor = Σ(DayType Load Factor × Days) / 365
```

**Peak Values:**
```
System Peak Demand = max(All DayType Peak Demands)
System Max Air Flow = max(All DayType Max Flows)
```

**Demand Charges:**
```
Annual Demand Cost = Peak Demand × 12 months × Demand Rate ($/kW-month)
Total Annual Operating Cost = Energy Cost + Demand Cost
```

## Algorithm Outputs

The baseline algorithm produces the following results:

### System-Wide Annual Totals
| Metric | Description |
|--------|-------------|
| Total Energy Consumption | Annual kWh across all day types |
| Total Energy Cost | Annual electricity cost (energy charges only) |
| Peak Power Demand | Maximum kW draw across all operational periods |
| Annual Demand Cost | 12 months × peak kW × demand rate |
| Total Annual Operating Cost | Sum of energy and demand costs |
| Annual CO2 Emissions | Total emissions based on energy use |
| Average Air Flow | Time-weighted average system flow |
| Average Capacity Utilization | Percentage of installed capacity utilized |
| Average Load Factor | Ratio of average to peak power |
| Maximum System Air Flow | Peak air demand across all periods |
| Total Operating Hours | Sum of compressor operating hours |

### Day Type Specific Results

For each operational day type:
| Metric | Description |
|--------|-------------|
| Day Type Energy Use | Energy consumption for this operational pattern |
| Day Type Cost | Energy cost for this pattern |
| Day Type Peak Demand | Maximum power for this pattern |
| Day Type Average Flow | Average air flow for this pattern |
| Operating Days per Year | Annual occurrence frequency |
| Day Type Operating Hours | Hours per occurrence |

## Operational Pattern Analysis

The algorithm supports segmented analysis by operational pattern:

### Typical Operational Patterns:

**Production Days** (e.g., Weekdays: 250 days/year)
- Full manufacturing operations
- Variable hourly air demand following production schedule
- Multiple compressors operating
- High capacity utilization

**Reduced Schedule Days** (e.g., Weekends: 100 days/year)
- Partial production or maintenance activities
- Lower average air demand
- Fewer compressors required
- Reduced capacity utilization

**Shutdown Periods** (e.g., Holidays: 15 days/year)
- No production activity
- Minimal air demand for pressure maintenance
- Single compressor intermittent operation
- Very low energy consumption

### Analysis Benefits:

- **Operational Accuracy**: Captures actual demand variation patterns
- **Cost Precision**: Annual costs based on real operating schedules
- **Opportunity Identification**: Reveals inefficiencies specific to operating modes
- **Validation**: Results correlate with utility billing data

## Example Calculation

For a system with three day types:

```
Day Type 1 (Weekdays): 250 days/year
  - Average Air Flow: 1,200 CFM
  - Energy Use: 450,000 kWh
  - Peak Demand: 250 kW

Day Type 2 (Weekends): 100 days/year
  - Average Air Flow: 600 CFM
  - Energy Use: 100,000 kWh
  - Peak Demand: 180 kW

Day Type 3 (Shutdown): 15 days/year
  - Average Air Flow: 50 CFM
  - Energy Use: 5,000 kWh
  - Peak Demand: 50 kW

System Totals Calculation:
  - Total Operating Days: 365
  - Average Air Flow: (1,200×250 + 600×100 + 50×15) / 365 = 988 CFM
  - Total Energy Use: 555,000 kWh
  - Peak Demand: 250 kW (maximum across all day types)
  - Annual Energy Cost: 555,000 kWh × $0.10/kWh = $55,500
  - Annual Demand Cost: 250 kW × 12 months × $15/kW = $45,000
  - Total Annual Operating Cost: $100,500
```

## Algorithm Applications

The baseline characterization algorithm provides:

1. **System Performance Quantification** - Current energy use and costs
2. **Efficiency Measure Baseline** - Reference for calculating savings
3. **Operational Analysis** - Load profiles and compressor utilization patterns
4. **Cost Attribution** - Energy and demand charge breakdown

## Related Algorithms

- **Day Type Profile Analysis** - Detailed calculations for individual operational patterns
- **Compressor Performance Modeling** - Power consumption calculations for individual units
- **Energy Efficiency Measure Evaluation** - Uses baseline as comparison reference

## Algorithm Considerations

- Calculations support both Imperial and Metric unit systems
- Peak demand determination evaluates all operational patterns
- Demand charges calculated as monthly peak extended annually
- Emission calculations use location-specific emission factors
- Time-weighted averaging accounts for varying annual frequencies

---

[← Back to Index](./index.md)
