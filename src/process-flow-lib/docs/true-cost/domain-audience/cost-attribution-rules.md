**Date Generated:** May 1, 2026

# Cost Attribution Rules — Reference

**Document Scope:** This document provides a consolidated reference listing the attribution rules for each cost component type in the True Cost Attribution Algorithm. For detailed calculation procedures and worked examples, refer to the individual sub-routine documents listed in the companion document index.

---

## 1. Overview of Cost Components

The algorithm recognizes four types of cost-bearing nodes in the facility flow diagram. Each type has a distinct set of attribution rules.

| Cost Component | Node Type | Cost Basis | Walk Direction |
|---|---|---|---|
| Water Intake | External water source | Outflow from intake | Downstream |
| Water Discharge | External effluent destination | Inflow to discharge | Upstream |
| Water Treatment | Shared treatment unit | Inflow to treatment | Downstream |
| Wastewater Treatment | Shared WWT unit | Inflow to WWT | Downstream (Pass 1) and Upstream (Pass 2) |

---

## 2. Block Cost Calculation

Before any attribution occurs, the total annual cost (block cost) for each cost-component node is calculated. This is the amount to be distributed among water-using systems.

| Cost Component | Flow Used for Block Cost | Formula |
|---|---|---|
| Water Intake | Total outflow from intake node | ($/kgal) × (outflow in Mgal/yr × 1,000) |
| Water Discharge | Total inflow to discharge node | ($/kgal) × (inflow in Mgal/yr × 1,000) |
| Water Treatment | Total inflow to treatment node | ($/kgal) × (inflow in Mgal/yr × 1,000) |
| Wastewater Treatment | Total inflow to WWT node | ($/kgal) × (inflow in Mgal/yr × 1,000) |

---

## 3. Attribution Rules by Cost Component

### 3.1 Water Intake

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Systems that receive water — directly or through treatment — from this intake. Only the first system encountered on each downstream path is charged. |
| **Walk direction** | Downstream from the intake node. |
| **Stopping criterion** | First water-using system on each path. |
| **Attribution fraction — standard (no treatment losses)** | (System inflow from path) / (Total intake outflow). Capped at 1.0 per path. |
| **Attribution fraction — with intermediate treatment losses** | (System inflow) / (Total treatment unit outflow). Uses intake block cost as cost basis. |
| **Cost to system** | Attribution fraction × Intake total block cost. |
| **Pump/motor energy** | Also attributed to the system using the same attribution fraction. |
| **Systems excluded** | Systems further downstream that receive water only as reuse from the first-charged system. |
| **Adjusted attribution** | User-supplied override fraction replaces computed default for the specified system–intake pair. |

---

### 3.2 Water Discharge

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | The system immediately upstream of the discharge — the final user that directly causes the discharge. Systems further upstream whose water was reused by an intermediate system are excluded. |
| **Walk direction** | Upstream from the discharge node. |
| **Stopping criterion** | First water-using system on each upstream path. |
| **Attribution fraction** | (System discharge contribution to path) / (Total discharge inflow). Capped at 1.0 per path. |
| **Cost to system** | Attribution fraction × Discharge total block cost. |
| **Pump/motor energy** | Also attributed to the system using the same attribution fraction. |
| **Systems excluded** | Systems further upstream that reused their water before it reached this discharge point. |
| **Adjusted attribution** | User-supplied override fraction replaces computed default for the specified system–discharge pair. |

---

### 3.3 Water Treatment

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Systems that receive treated water — directly or through additional treatment units in series — from this treatment unit. Only the first system on each downstream path is charged. |
| **Walk direction** | Downstream from the treatment node. |
| **Stopping criterion** | First water-using system on each path. Intermediate treatment units in series are passed through; each is its own independent cost center. |
| **Attribution fraction — standard (no losses)** | (System inflow from path) / (Total treatment inflow). Capped at 1.0 per path. |
| **Attribution fraction — with treatment losses** | (System inflow) / (Total treatment outflow). Uses treatment block cost (based on inflow) as cost basis. |
| **Cost to system** | Attribution fraction × Treatment total block cost. |
| **Series treatment** | Each unit in a series is attributed independently. No duplication. A system receiving water through three units in series will accumulate three separate treatment cost charges. |
| **In-system treatment** | Treatment units located entirely within a single system are not evaluated by this sub-routine. They are costed separately in Step 3 using the full system inflow as the flow basis. |
| **Adjusted attribution** | User-supplied override fraction replaces computed default for the specified system–treatment pair. |

---

### 3.4 Wastewater Treatment

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Two groups: (1) downstream systems receiving recycled water from the WWT unit; and (2) upstream systems that sent effluent into the WWT unit and whose treated water was discharged (not recycled). |
| **Walk direction — Pass 1** | Downstream from the WWT node (reuse paths). |
| **Walk direction — Pass 2** | Upstream from the WWT node (discharge paths). |
| **Stopping criterion — Pass 1** | First water-using system on each downstream path. |
| **Stopping criterion — Pass 2** | First water-using system on each upstream path. Systems already charged in Pass 1 are excluded from Pass 2. |
| **Attribution fraction — Pass 1** | (System recycled inflow) / (Total WWT inflow). Capped at 1.0 per path. |
| **Attribution fraction — Pass 2** | (System upstream outflow − Total Pass 1 charged portion) / (Total WWT inflow). |
| **Cost to system** | Attribution fraction × WWT total block cost (applies to both passes). |
| **Balance check** | Sum of all Pass 1 and Pass 2 fractions should equal 1.0 for a lossless WWT unit. |
| **Adjusted attribution** | User-supplied override fraction replaces computed default for the specified system–WWT pair. Applies independently to each pass. |

---

## 4. Additional Cost Categories (Step 3 Only)

The following cost categories are computed in Step 3 (finalization) and are not part of the Step 2 graph-walk attribution. They are assigned directly to each system without a flow-proportional walk.

### 4.1 In-System Treatment

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Any water-using system with treatment equipment configured as "in-system treatment." |
| **Flow basis** | 100% of the system's total annual inflow. In-system treatment is assumed to process all water entering the system. |
| **Cost** | Sum over all in-system treatment units: (unit cost per kgal) × (total system inflow × 1,000). |
| **Cost category** | Added to the system's treatment cost total. |

---

### 4.2 Heat Energy

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Any water-using system with heat energy data entered (heating fuel type, temperatures, efficiency). |
| **Flow basis** | 100% of the system's total annual inflow. |
| **Formula** | Q = [V × ρ × C_p × (T_out − T_in)] / η; Heat cost = Q × energy unit cost. |
| **Cost category** | Assigned to the system's heat energy cost field. |

---

### 4.3 System Pump and Motor Energy

| Rule | Specification |
|---|---|
| **Which systems are eligible?** | Any water-using system with pump/motor entries configured directly on the system node. |
| **Flow basis** | Motor count, rated power, load factor, efficiency, and hours per year — from the system's motor entries. |
| **Formula** | E = (0.746 × hp × N × L / η) × H; Energy cost = E × electricity unit cost ($/kWh). |
| **Cost category** | Assigned to the system's pump and motor energy cost field. **This overwrites any pump/motor energy accumulated from intake and discharge node attributions during Step 2.** See *Known Limitations.* |

---

## 5. Adjusted Attribution — General Rules

Adjusted attributions apply to all four cost-component types. The rules are the same in each case:

| Rule | Specification |
|---|---|
| **Source** | User-entered override fractions in the system attribution map, keyed by system ID and cost-component ID. |
| **Effect** | The override fraction replaces the computed default fraction for cost-to-system calculation. |
| **Audit trail** | The default computed fraction is always preserved in the attribution record alongside the override. |
| **Application timing** | Override costs are applied as a batch after all path walks complete for a given cost component, not during individual path iterations. |
| **Energy attribution (intake/discharge)** | Pump/motor energy from intake or discharge nodes is also re-calculated using the adjusted fraction when an override is in effect. |
