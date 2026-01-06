# CompressedAirAssessmentBaselineResults

## Overview

The `CompressedAirAssessmentBaselineResults` class calculates and stores the baseline (current state) performance metrics for a compressed air system. It aggregates results across all configured day types to provide both detailed and summary views of system operation.

**Source File:** `CompressedAirAssessmentBaselineResults.ts`

## Purpose

This class serves as the foundation for compressed air assessment by:
1. Establishing baseline performance metrics before any modifications
2. Breaking down system performance by day type (e.g., weekdays, weekends, shutdown days)
3. Calculating annual totals for energy use, costs, emissions, and air flow
4. Providing comparison data for evaluating energy efficiency measures

## Class Properties

### baselineDayTypeProfileSummaries
- **Type:** `Array<CompressedAirBaselineDayTypeProfileSummary>`
- **Description:** Array containing detailed calculation results for each day type. Each summary includes hourly profile data, compressor performance, and day-type specific totals.

### baselineResults
- **Type:** `BaselineResults`
- **Description:** Aggregated results containing both day-type specific results and overall system totals.

## Constructor

```typescript
constructor(
  compressedAirAssessment: CompressedAirAssessment,
  settings: Settings,
  _compressedAirCalculationService: CompressedAirCalculationService,
  _assessmentCo2SavingsService: AssessmentCo2SavingsService
)
```

**Parameters:**
- `compressedAirAssessment` - Complete compressed air system data including inventory, profiles, and system information
- `settings` - Application settings (units, calculation preferences)
- `_compressedAirCalculationService` - Service for performing compressor calculations
- `_assessmentCo2SavingsService` - Service for calculating CO2 emissions

**Process Flow:**
1. Creates baseline profile summaries for each day type
2. Aggregates results across all day types
3. Calculates system-wide totals

## Key Methods

### setBaselineProfileSummaries()

Creates a `CompressedAirBaselineDayTypeProfileSummary` object for each configured day type.

**Process:**
- Iterates through all day types in the assessment
- For each day type, creates a detailed profile summary
- Stores results in `baselineDayTypeProfileSummaries` array

### setBaselineResults()

Aggregates day-type results into system-wide totals.

**Calculated Metrics:**

#### Annual Totals:
- **Total Energy Use** - Sum of energy consumption across all day types (kWh or appropriate energy unit)
- **Total Energy Cost** - Annual electricity cost based on energy use and rates
- **Annual Emission Output** - Total CO2 emissions based on energy use and emission factors
- **Total Operating Days** - Sum of operating days across all day types (typically 365)
- **Total Operating Hours** - Sum of operating hours across all day types

#### Weighted Averages:
- **Average Air Flow** - Weighted by operating days for each day type
- **Average Air Flow Percent Capacity** - Weighted average capacity utilization
- **Load Factor Percent** - Weighted average load factor across all day types

#### Peak Values:
- **Peak Demand** - Maximum power demand across all day types (kW)
- **Max Air Flow** - Maximum air flow requirement across all day types
- **Demand Cost** - Monthly demand charges based on peak demand (peak demand × 12 months × demand rate)

#### Total Annual Operating Cost:
- **Total Annual Operating Cost** = Annual Energy Cost + Annual Demand Cost

**Aggregation Logic:**
```typescript
// Weighted averages calculated as:
averageValue = sum(dayTypeValue × operatingDays) / totalDays

// Peak values use maximum across all day types:
peakDemand = max(dayTypeResults.peakDemand)
```

### getCompressorSummaries()

Returns compressor performance summaries organized by day type.

**Returns:** `Array<Array<CompressorSummary>>`

**Description:** Provides a detailed breakdown of each compressor's performance for each day type, including:
- Energy consumption per compressor
- Operating hours and modes
- Air flow contribution
- Power usage

### getDayTypeBaselineResult()

Retrieves baseline results for a specific day type.

**Parameters:**
- `dayTypeId: string` - Unique identifier for the day type

**Returns:** `BaselineResult` - Complete result set for the specified day type

### getDayTypeProfileSummary()

Retrieves the detailed profile summary for a specific day type.

**Parameters:**
- `dayTypeId: string` - Unique identifier for the day type

**Returns:** `Array<ProfileSummary>` - Hourly or interval-based profile data for the day type

## BaselineResults Interface

```typescript
interface BaselineResults {
  total: BaselineResult;
  dayTypeResults: Array<BaselineResult>;
}
```

## BaselineResult Interface

Each baseline result (whether for a day type or system total) contains:

| Property | Type | Description |
|----------|------|-------------|
| cost | number | Annual energy cost for this scope |
| energyUse | number | Annual energy consumption |
| peakDemand | number | Peak power demand (kW) |
| demandCost | number | Annual demand charges |
| name | string | Name/label for this result |
| maxAirFlow | number | Maximum air flow |
| averageAirFlow | number | Average air flow |
| averageAirFlowPercentCapacity | number | Average capacity utilization (%) |
| operatingDays | number | Number of operating days |
| totalOperatingHours | number | Total hours of operation |
| annualEmissionOutput | number | Annual CO2 emissions |
| loadFactorPercent | number | Average load factor (%) |
| dayTypeId | string (optional) | Day type identifier |
| totalAnnualOperatingCost | number | Total annual cost (energy + demand) |

## Day Type Breakdown

The system supports multiple day types to accurately model varying operational patterns:

### Common Day Type Examples:

1. **Weekday**
   - Typical production schedule
   - Full compressor utilization
   - Variable load throughout the day

2. **Weekend**
   - Reduced production or maintenance
   - Lower air demand
   - Fewer operating hours

3. **Shutdown**
   - No production
   - Minimal compressor use (for maintaining pressure)
   - Very low energy consumption

### Benefits of Day Type Analysis:

- **Accuracy**: Captures real-world variation in compressed air demand
- **Precision**: Annual projections based on actual operating patterns
- **Insights**: Identifies opportunities specific to different operational modes
- **Validation**: Ensures calculations match observed energy bills

## Calculation Example

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

System Totals:
  - Total Operating Days: 365
  - Average Air Flow: (1,200×250 + 600×100 + 50×15) / 365 = 988 CFM
  - Total Energy Use: 555,000 kWh
  - Peak Demand: 250 kW (maximum across all day types)
  - Annual Energy Cost: 555,000 kWh × $0.10/kWh = $55,500
  - Annual Demand Cost: 250 kW × 12 months × $15/kW = $45,000
  - Total Annual Operating Cost: $100,500
```

## Usage in Application

The baseline results are used throughout the application:

1. **Assessment Reports** - Display current system performance
2. **Modification Analysis** - Provide comparison baseline for savings calculations
3. **Graphical Displays** - Show system load profiles and compressor utilization
4. **Cost Analysis** - Break down energy and demand costs

## Related Classes

- **CompressedAirBaselineDayTypeProfileSummary** - Detailed calculations for a single day type
- **CompressorInventoryItemClass** - Individual compressor modeling
- **CompressedAirAssessmentModificationResults** - Modification analysis that uses baseline results

## Notes

- All calculations respect the configured units of measure (Imperial or Metric)
- Peak demand calculations consider all day types to find the system-wide maximum
- Demand costs are annualized (monthly peak × 12 months)
- Emission calculations use site-specific or default emission factors
- The class uses lodash for efficient array operations (e.g., `_.maxBy`, `_.sumBy`)

---

[← Back to Index](./index.md)
