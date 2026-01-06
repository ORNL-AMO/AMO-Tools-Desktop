# Receiver Volume Addition Algorithm

## Overview

Adding compressed air storage (receiver) volume reduces compressor cycling frequency, which decreases energy consumption from start/stop transitions and improves system stability.

## Objective

Calculate energy savings from:
- Reduced cycling losses
- Improved pressure stability
- Better handling of demand transients
- Potential peak demand reduction

## Algorithm Inputs

### Storage Addition
- **Additional Volume:** Gallons or liters to add
- **Implementation Cost:** Receiver, installation, piping, valves

### Calculation Method

```
Cycling Frequency Relationship:
    New Cycling Rate = Old Rate × (Old Volume / (Old Volume + New Volume))

Cycling Energy Loss:
    Each cycle wastes 1-3% of full load energy
    Fewer cycles = lower losses

Energy Savings = Baseline Cycles × Loss Per Cycle - 
                 Modified Cycles × Loss Per Cycle
```

## Typical Sizing Guidelines

| Application | Storage Ratio | Calculation |
|-------------|---------------|-------------|
| Minimum | 1-2 gal/CFM | Barely adequate |
| Standard | 3-5 gal/CFM | Good for most applications |
| High transient | 5-10 gal/CFM | Handles demand spikes well |
| Very high transient | 10+ gal/CFM | Specialized applications |

## Example Calculation

**Add 500-gallon Receiver:**
- Current storage: 200 gallons
- System capacity: 800 CFM
- Current cycling: 8 cycles/hour (excessive)
- Implementation cost: $12,000

```
New total storage = 200 + 500 = 700 gallons

Cycling reduction:
New rate = 8 × (200/700) = 2.3 cycles/hour

Energy savings from reduced cycling: 2-5% typical
Annual savings: $3,000-$7,000
Payback: 1.7-4.0 years

Additional benefits:
- Improved pressure stability
- Reduced compressor wear
- Better transient response
```

## Related Algorithms

- [Flow Reallocation](./flow_reallocation.md) - Benefits from stable demand
- [Automatic Sequencer](./use_automatic_sequencer.md) - Works well with adequate storage

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
