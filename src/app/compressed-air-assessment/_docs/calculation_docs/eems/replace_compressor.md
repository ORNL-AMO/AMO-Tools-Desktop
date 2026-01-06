# Compressor Replacement Algorithm

## Overview

Compressor replacement models the energy savings from replacing an existing compressor with a more efficient unit, typically a newer technology such as a VFD-controlled compressor.

## Objective

Calculate energy and cost savings from:
- Replacing old inefficient compressor with modern efficient unit
- Upgrading fixed-speed to VFD control
- Right-sizing oversized equipment
- Improving specific power (kW per 100 CFM)

## Algorithm Inputs

### Replacement Configuration
- **Compressor to Replace:** ID of existing unit
- **Replacement Unit Specifications:**
  - Capacity (CFM or m³/min)
  - Rated power (kW or hp)
  - Control type
  - Performance characteristics
- **Implementation Cost:** Equipment, installation, electrical, commissioning

### Calculation Method

```
Step 1: Remove old compressor from system inventory

Step 2: Add new compressor to system inventory

Step 3: Recalculate flow allocation with updated compressor set
  - New efficiency ranking
  - New capacity mix
  - New control capabilities

Step 4: Calculate system energy with new configuration

Energy Savings = Baseline Energy - Modified Energy
```

## Common Replacement Scenarios

| Replacement Type | Typical Savings | Payback |
|------------------|----------------|---------|
| Old fixed-speed → New VFD | 20-35% | 3-6 years |
| Oversized → Right-sized | 10-20% | 4-7 years |
| Two-stage → Single-stage (if appropriate) | 5-15% | 5-8 years |
| Reciprocating → Rotary screw VFD | 15-30% | 4-7 years |

## VFD Replacement Benefits

Variable Frequency Drive compressors provide:
- **Excellent Part-Load Efficiency:** Power scales with cubic law
- **Precise Pressure Control:** No load/unload cycling
- **Reduced Maintenance:** Less mechanical stress
- **Soft Starting:** Lower electrical demand

## Example Calculation

**Replace Old Load/Unload with VFD:**
- Old compressor: 100 hp, fixed-speed, 20.5 kW/100CFM
- New compressor: 100 hp, VFD, 17.8 kW/100CFM
- Runs 60% of time at 70% capacity average
- Implementation cost: $75,000

```
Old compressor part-load: Cycles, average 85 kW
New compressor part-load: VFD at 70% → 60 kW

Savings: 25 kW × 4,000 hours = 100,000 kWh/year
Cost savings: $10,000/year + demand savings $2,000/year
Total: $12,000/year

Payback = $75,000 / $12,000 = 6.3 years
```

## Related Algorithms

- [Flow Reallocation](./flow_reallocation.md) - Recalculates system loading
- [Compressor Performance](../compressor_inventory_item_class.md) - Models new unit

---

[← Back to EEM Overview](../energy_efficiency_measures.md) | [← Back to Index](../index.md)
