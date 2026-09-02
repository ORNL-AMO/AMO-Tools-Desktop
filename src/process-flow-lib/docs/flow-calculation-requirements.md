# Flow Calculation & Propagation Behavior

## Purpose

Documents the behavior implemented for calculating and propagating Outflow/Inflow between Nodes and Calculations, as a reference for reasoning about changes to this logic.

## Cases Where the App Will Calculate or Populate Values

- **A.** Total Flow field when it has no user-entered value and the user enters individual flows on a connected component
- **B.** Total Flow field when it has no user-entered value and the user enters an individual flow on the same component
- **C.** Total Flow field when it has no user-entered value and the user clicks "Set all flows.." from a connected component
- **D.** Individual/connected flows when a user enters a value on a connected flow. (these are one in the same)
- **E.** Individual/connected flows that are populated by the "Set all flows..."
- **F.** Individual/connected flows on the same component, evenly divided, when the user enters a Total Flow value and distributes it across that component's flows. All of that side's edges are overwritten with the even split, not just the unset ones.
- **G.** Total Flow field explicitly set by summing the component's already-entered individual/connected flows (a user-triggered "sum to total" action, distinct from the auto-calculated total in A/B). If the edges don't add up to a usable sum, the field keeps its current value.
- **H.** Total Flow field (plus Known Losses and Water in Product) populated from the Water System Estimation dialog result for the selected component.
- **I.** "Set all flows..." cascade nuances (refines C/E):
  - An edge that already carries a real (non-zero) value is left untouched; only the remaining flow (that node's inflow minus its already-filled edges) is split across the edges still unset at that node.
  - A node whose outgoing edges are all already filled is skipped entirely; the cascade doesn't touch it.
  - When more than one outgoing edge is still unset, the remaining flow is divided evenly only among those unset edges.
  - Two branches that reconverge on the same downstream node have their inflows summed at that node instead of the later branch overwriting the earlier one; that node's outgoing edges are then re-split using the combined total.
  - Edges set by the cascade inherit the seed edge's flow confidence (metered/estimated); the seed edge itself keeps its own prior confidence.
  - A node's total flow confidence shows as "metered" only when every edge connected to it (not only the ones this cascade touched) is metered; otherwise it shows "estimated".

## Display Precedence

When a component has a user-entered Total Flow value, that value is always shown, even after a connected/individual flow edit (A, D, F, G, I) recalculates the underlying total. The calculated total is still kept up to date internally; it just isn't surfaced while a user-entered override exists.


