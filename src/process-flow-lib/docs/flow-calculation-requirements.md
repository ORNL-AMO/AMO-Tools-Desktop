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
  - Every outgoing edge at each downstream node is overwritten with an even split of that node's inflow, regardless of any value the edge already carries - EXCEPT an edge the user has explicitly locked to "metered" (a real, vouched-for measurement). A metered edge, and the path past it, is left untouched; its value is conserved against the total so the remaining edges only split what's left. A node whose outgoing edges are all metered is left alone entirely.
  - Two branches that reconverge on the same downstream node have their inflows summed at that node instead of the later branch overwriting the earlier one; that node's outgoing edges are then re-split using the combined total.
  - Edges set by the cascade become "calculated"; the seed edge itself keeps its own prior confidence unchanged.
  - For a node side (source or discharge) the cascade wrote a value into, the total's confidence is redetermined per the unified rule in "Confidence States" below (same rule a direct edit uses) - it does not matter whether that side has one edge or many.

## Confidence States

Individual flow edges and each node's Total Flow fields (source and discharge, tracked separately) carry a confidence: "estimated" (default), "metered", or "calculated". "Calculated" is only ever set by the "Set all flows..." cascade (case I above) - it can never be entered manually.

- Editing an edge's value directly (D) downgrades that edge from "calculated" to "estimated" (an edge already estimated/metered is unaffected).
- A node's Total Flow field is considered "touched" once the user either toggles that total's own confidence explicitly, or types directly into the total flow value field. Bulk actions (F, G, H) do not count as touching it.
- Whenever an edge feeding a total's side gets a new value - from a direct edit (D) or the cascade (I), whether that side has one edge or several - the total's confidence is redetermined:
  - If the total is **touched**: it becomes "estimated" and its touched flag clears, unconditionally, regardless of how many edges feed that side or what the total was set to before.
  - If the total is **untouched**: it becomes the least-confident value among that side's edges, ranked "estimated" < "calculated" < "metered". A cascade's seed edge counts as its own real (unchanged) confidence; every other edge the cascade writes counts as "calculated". (A direct edit that doesn't change the edited edge's own confidence therefore leaves an untouched total unchanged too - it only propagates when the edit itself downgrades that edge to "estimated".)
  - Toggling a node's sole connected edge's confidence (a manual toggle, not the cascade), in either direction, still mirrors that directly onto an untouched total for that side, per the existing single-edge mirror behavior.

## Display Precedence

When a component has a user-entered Total Flow value, that value is always shown, even after a connected/individual flow edit (A, D, F, G, I) recalculates the underlying total. The calculated total is still kept up to date internally; it just isn't surfaced while a user-entered override exists.


