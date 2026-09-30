# Water Diagram and Assessment State Sync

How the water process diagram (a React web component) and the water assessment (Angular) keep their data consistent.

## Summary

A water assessment can have a linked diagram. Both describe the same water components (intakes, water-using systems, treatment, discharge) and their flows, and each is saved in its own IndexedDB record (`Assessment` and `Diagram`).

- The diagram owns its own state inside a Redux store in the web component. It is the source of truth while the user is editing the diagram.
- The assessment forms own the assessment state in Angular. They are the source of truth while the user is editing forms.
- `WaterDiagramSyncService` is the only place that writes either record and copies data between them. Everything it does runs one task at a time, in the order requested.

```
 Diagram edit                                    Assessment form edit
      |                                                   |
      v                                                   v
 React store --(debounced emit)--> Angular          WaterAssessmentComponent
      |                                |                  |
      |                     WaterProcessDiagramComponent  |
      |                                |                  |
      |                     saveDiagram(diagram)    assessmentChanged(assessment)
      |                                |                  |
      |                                v                  v
      |                       +-----------------------------------+
      |                       |       WaterDiagramSyncService     |
      |                       |  one queue, one task at a time    |
      |                       +-----------------------------------+
      |                          |                          |
      |          write diagram, then            write assessment, then
      |          rewrite assessment             refresh diagram nodes
      |          from diagram                   from assessment
      |                                                     |
      |                                          mark diagram "stale"
      |                                                     |
      +<------ re-mount (re-hydrate store) when the diagram tab is next shown
```

Rules to remember:

1. Never write a `Diagram` or linked `Assessment` to IndexedDB directly from a component. Go through `WaterDiagramSyncService`.
2. The diagram web component only receives data when it mounts. It does not react to later changes from Angular. To show assessment edits, it is re-mounted.
3. A sync only writes a record if something actually changed.

## Detail

### The pieces

| Piece | Location | Role |
| --- | --- | --- |
| Diagram store and save listener | `process-flow-diagram-component/src/components/Diagram/store.ts`, `diagramPersistence.ts`, `diagramReducer.ts` | Holds diagram state, decides which changes are worth saving, debounces, and emits the diagram data to Angular |
| `AppWebComponent` | `process-flow-diagram-component/src/` | The custom element. Emits `updateDiagramDetailEvent` (data to save) and `diagramReadyEvent` (canvas ready), and exposes `flush()` to emit a pending save immediately |
| `ProcessFlowDiagramWrapperComponent` | `src/app/shared/process-flow-diagram-wrapper/` | Angular host of the element. Pushes `parentstate` in, forwards the save event, re-emits ready as the `diagramReady` output, and flushes on destroy |
| `ProcessFlowDiagramService` | `src/app/shared/process-flow-diagram-wrapper/` | Receives the emitted data and puts it on `WaterProcessDiagramService.waterDiagram` |
| `WaterDiagramComponent` | `water-diagram/` in this folder | Builds the parent state, mounts (and re-mounts) the wrapper, and shows the loading skeleton |
| `WaterProcessDiagramComponent` | this folder | Watches `waterDiagram` and calls `WaterDiagramSyncService.saveDiagram` |
| `WaterAssessmentComponent` | `src/app/water/` | Calls `assessmentChanged`, `reconcileWithDiagram`, `whenIdle`, `remountDiagramIfStale`, and re-seeds its forms when a diagram sync changes the assessment |
| `WaterDiagramSyncService` | this folder | The queue and the two sync directions |
| `UpdateAssessmentFromDiagramService` | `src/app/water/` | Pure data copy: diagram to assessment (components, flows, settings) |
| `UpdateDiagramFromAssessmentService` | this folder | Pure data copy: assessment to diagram (nodes, settings), plus adding nodes for components the diagram lacks |
| `WaterProcessDiagramService` | this folder | Shared subjects: `waterDiagram`, `diagram` (open record), `parentContainer`, `diagramRemount` |
| `DiagramIdbService`, `AssessmentDbService` | `src/app/indexedDb/` | `upsertInCache` replaces one record in the in-memory cache after a save, without re-reading the store |

The two `Update...` services only change objects in memory. `WaterDiagramSyncService` decides when to call them and when to persist.

### Direction 1: diagram edit to assessment

1. The user changes the diagram. A Redux action updates the store.
2. `isPersistableChange` (in `diagramPersistence.ts`) decides if the action matters. It ignores selection, measured sizes, mid-drag positions (the drag end, with `dragging: false`, is saved), and hydration on open. If a diagram was upgraded from an older version on load, that hydration is saved so the upgrade sticks. The upgrade check runs on both `diagramInitialized` and `diagramReady`, because a save requested before the canvas is ready is skipped and must be re-requested.
3. A store listener marks a save as pending (`hasPendingSave`), waits 100 ms (`DIAGRAM_SAVE_DEBOUNCE_MS`), restarting the wait on each new change, then dispatches `saveDiagramState`.
4. `saveDiagramState` builds the `FlowDiagramData` and calls the Angular callback. Its `condition` skips it until the store has been hydrated (`isInitialized`, set by `diagramReady`) and unless a save is pending, so opening a diagram never rewrites it and a flush with nothing pending does nothing.
5. On unmount the last edit must not be lost. See "Leaving the page" below.
6. Angular puts the data on `waterDiagram`. `WaterProcessDiagramComponent` sees it and calls `saveDiagram(diagram)`. Its subscription skips the first value, because the subject replays its current value on subscribe and that is a load, not a change.
7. `saveDiagram` queues a diagram write. If the diagram has an `assessmentId`, it also queues an assessment sync.
8. The assessment sync (`syncAssessmentFromDiagram`) copies components, flows, calculated data, and settings onto the assessment. It saves the settings only if units of measure or flow precision changed, and saves the assessment only if its water data changed. When it changes the assessment, `WaterDiagramSyncService` emits `assessmentSyncedFromDiagram`, and the open `WaterAssessmentComponent` re-seeds its forms from the updated assessment (marked as seeding, so it is not saved again).

### Direction 2: assessment edit to diagram

1. The user edits an assessment form. `WaterAssessmentComponent` calls `assessmentChanged`.
2. The service queues an assessment write. If the assessment has a `diagramId`, it also queues a diagram sync.
3. The diagram sync (`syncDiagramFromAssessment`) works on a copy of the diagram, refreshes its settings and nodes from the assessment, and compares the result to the current diagram. If nothing differs, it stops.
4. If something differs, the diagram is updated and written, and `isDiagramStale` is set to `true`.
5. When the user next opens the diagram tab, `remountDiagramIfStale` runs. It bumps `diagramRemount`, which makes `WaterDiagramComponent` destroy and re-create the web component. The new store hydrates from the updated diagram.

Why a re-mount: the Redux store is created once per web component instance and hydrates only from the initial parent state. There is no inbound channel for later changes, so re-creating the component is the mechanism for pushing new data in. `WaterDiagramComponent` only ever takes the first loaded diagram as parent state (`take(1)`), so later `waterDiagram` emissions, which are the diagram's own saves, do not feed back into the web component.

### The queue

`enqueue` chains every task onto `lastTask`, a promise chain used as a serial queue, so tasks run strictly one after another. This removes the original race: overlapping saves could complete out of order (last write wins with stale data), and each side could be rebuilt from a stale snapshot of the other.

- The stored tail is `thisTask.catch(() => undefined)`, while the caller gets the original `thisTask`. A rejection therefore reaches the caller but does not poison the chain. Errors from queued syncs are logged.
- `queueAssessmentSync` and `queueDiagramSync` coalesce with an "already queued" flag. A sync reads current state when it executes, not when it was requested, so requests made while one is waiting are already covered. A burst of 3 diagram saves runs the assessment sync once.
- The flag is cleared at the start of the task, not the end, so a request arriving mid-run queues a fresh sync instead of being dropped.
- `whenIdle` resolves when no tasks are pending. `WaterAssessmentComponent` awaits it before leaving the diagram tab, so the diagram's last save has landed before the assessment tab reads data.

### Which copy of an object is used

`getLinkedDiagram` and `getLinkedAssessment` prefer the instance a component has open (`WaterProcessDiagramService.diagram`, `WaterAssessmentService.assessmentValue`) over the IndexedDB cache. The open instance carries the in-progress edits and the cache can lag it. The cache is the fallback for records that are not open. `persistDiagram` and `persistAssessment` call `upsertInCache` after each write to keep it aligned. `upsertInCache` stores a deep copy of the saved record (so cache consumers never share an object with the one a component is editing), replaces the entry with the same id or appends a new one, and emits a new array. It avoids re-reading the whole store on every save.

The diagram to assessment sync deep-clones the diagram first. The store emits Immer-frozen objects and the copy code mutates in place, so applying it to the live diagram would throw or corrupt shared state.

### Opening an assessment

`WaterAssessmentComponent.setDiagram` calls `reconcileWithDiagram`:

1. Clears the stale flag (a fresh mount will hydrate from current data anyway).
2. If the assessment has components missing from the diagram, adds nodes for them and saves the diagram.
3. Runs the diagram to assessment sync, so both start from the same components.

The first assessment emission after opening only seeds the forms. `isSeedingWaterAssessment` stops it from being treated as a user edit and saved.

### Leaving the diagram tab

`WaterAssessmentComponent` awaits `whenIdle` before it switches away from the diagram tab, so queued writes have landed. If the diagram's debounce has not fired yet, that save arrives after the tab switch; the resulting assessment sync emits `assessmentSyncedFromDiagram`, which re-seeds the forms so they do not show stale components.

### Leaving the page

The diagram must not lose an edit made in the last 100 ms before the page is left. React's own unmount cleanup runs too late for this: by then Angular has already destroyed the view, removed the wrapper's template listener, and unsubscribed `WaterProcessDiagramComponent` from `waterDiagram`, so an emitted save has no receiver.

The flush therefore starts from Angular:

1. `Diagram` hands the host a flush function through the `registerFlush` prop; `AppWebComponent` keeps it and exposes `flush()`.
2. `ProcessFlowDiagramWrapperComponent.ngOnDestroy` adds a temporary `updateDiagramDetailEvent` listener on the element and calls `flush()`. A temporary listener is needed because this hook runs in the parent view's cleanup, after the wrapper's own template listener has been removed.
3. `flush()` dispatches `saveDiagramState`, which emits only if a save is pending. The event reaches `onUpdateDiagramState`, then `waterDiagram`, and `WaterProcessDiagramComponent` (not yet destroyed) saves it through the queue.
4. React's unmount cleanup still dispatches `saveDiagramState` as a backstop. With nothing pending it does nothing.

### Diagram without an assessment

A standalone diagram (no `assessmentId`) is only written to its own record. No assessment sync is queued.

### Rendering constraints

The diagram is a native web component with its own React tree. It has constraints that are easy to break and produce a blank canvas with no error.

1. **It hydrates once, at mount.** Data arrives only through the element's `parentstate` property. Later Angular changes are ignored, so new data means re-mounting (see the remount section above).
2. **`parentstate` must be pushed after the element exists.** `ProcessFlowDiagramWrapperComponent` sets it in `ngOnChanges` and again in `ngAfterViewInit`. The first `ngOnChanges` runs before the element exists, so without `ngAfterViewInit` a wrapper created with final inputs never sets it (the element renders, but `$0.parentstate` is `undefined`).
3. **It must mount in a visible, measured container.** `WaterDiagramComponent` builds the web component only when both a diagram and `parentContainer` (the measured height of the area) exist. Mounting while hidden or zero-size lays the nodes out into nothing.
4. **Measure only while visible.** Standalone, `WaterProcessDiagramComponent.getContainerHeight` measures after the view renders. Integrated, the diagram tab is hidden with `d-none` until selected, so `WaterAssessmentComponent.setContainerHeight` emits only when the diagram tab is active. It also needs its `#content` element rendered, and does nothing if it is missing.
5. **`parentContainer` outlives the diagram.** `WaterProcessDiagramService` lives for the session, so `WaterProcessDiagramComponent.ngOnDestroy` resets `parentContainer`, `diagram` and `waterDiagram` to `undefined`. Otherwise the next diagram, such as the hidden one in an assessment opened from a standalone diagram, mounts at once with the old measurement and renders blank, or (because of `take(1)`, below) mounts with the previous diagram's data.
6. **Show the tab before re-mounting.** `remountDiagramIfStale` runs after `detectChanges()` on the tab switch so the new web component is created in a visible container.
7. **Only the first loaded diagram is used as parent state** (`take(1)` in `WaterDiagramComponent`). The diagram's own saves come back on the same subject and must not be pushed into the web component.

Symptom guide: element present but `$0.parentstate` is `undefined` means constraint 2; `parentstate` is set with correct data but the canvas is blank means constraints 3 to 5.

### Loading skeleton

The canvas has to render before React Flow can initialize, so there is an unavoidable blank wait after navigation. `WaterDiagramComponent` covers it with a skeleton overlay (`role="status"`, hidden "Loading diagram" text) drawn over the wrapper. The wrapper keeps rendering underneath, because it must mount to initialize.

- **Layout:** it mirrors the real layout: the open left menu drawer (`drawerWidthPx`, 525 px), the closed 65 px right rail, and a matted placeholder panel in the canvas area between them. Keep the sizes in `water-diagram.component.css` in step with `SharedDrawer.tsx`.
- **Ready signal:** `Diagram` calls its `onReady` prop right after dispatching `diagramReady`. `AppWebComponent` turns it into a `diagramReadyEvent` (dispatched from the shadow root, like the save event), and the wrapper re-emits it as its `diagramReady` output.
- **Minimum time:** the skeleton stays up for at least 500 ms (`SKELETON_MINIMUM_MS`) so a fast load reads as a transition, not a flicker. It hides when both the minimum has passed and the diagram is ready. A slow load adds no extra wait.
- **Failsafe:** if ready never arrives, the skeleton hides after 10 s (`DIAGRAM_READY_FAILSAFE_MS`).
- **Timing starts at mount:** both timers start when parent state exists (the wrapper actually mounts), not when the component is created. In an assessment the component exists while the diagram tab is hidden and unmeasured, so timing from creation would expire before the tab is ever shown.
- **Re-mounts:** every `diagramRemount` resets the ready flag and restarts both timers, so the skeleton shows again while the new element hydrates.

### Where to look when something is wrong

- Diagram edit not saved: check `isPersistableChange` (is the action treated as transient?) and `isInitialized`.
- Assessment did not pick up a diagram change: check the `assessmentId` on the diagram and `syncAssessmentFromDiagram`.
- Diagram shows old data after a form edit: check that `isDiagramStale` was set and that `remountDiagramIfStale` runs when the tab shows.
- Data reverting after quick edits: check that every write goes through the service so it lands in the queue.
- Last edit lost when leaving the page: check the order of the flush (see "Leaving the page"). The wrapper's `ngOnDestroy` flush must run before `WaterProcessDiagramComponent.ngOnDestroy`.
- Skeleton never shows, or flashes: check that the timers start from parent state, and that `diagramReadyEvent` reaches the wrapper.
- Behavior is covered by:
  - `water-diagram-sync.service.spec.ts`: queue order, coalescing, write-only-on-change, `assessmentSyncedFromDiagram`
  - `process-flow-diagram-component/src/__tests__/diagramPersistence.test.ts`: debounce, transient changes, upgrade saves, flush
  - `update-assessment-from-diagram.service.spec.ts`: settings-change detection
  - `diagram-idb.service.spec.ts`, `assessment-db.service.spec.ts`: `upsertInCache`
  - `water-process-diagram.component.spec.ts`: shared state reset on destroy
  - `water-diagram/water-diagram.component.spec.ts`: skeleton, minimum time, failsafe
  - Not unit-tested: the unmount flush wiring (`registerFlush`, `flush()`, the wrapper's `ngOnDestroy` listener) and the `diagramReadyEvent` path. Verify these in the running app.
