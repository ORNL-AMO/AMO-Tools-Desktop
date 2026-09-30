import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, take } from 'rxjs';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { environment } from '../../../environments/environment';
import { ProcessFlowParentState, ConvertValueFn } from 'process-flow-lib';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';

const SKELETON_MINIMUM_MS = 500;
const DIAGRAM_READY_FAILSAFE_MS = 10000;

@Component({
  selector: 'app-water-diagram',
  standalone: false,
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterDiagramComponent {
  private readonly waterProcessDiagramService = inject(WaterProcessDiagramService);

  // * The diagram store is created once per web component, so re-hydrating it means creating a new component.
  // * The template tracks this count in an @for, so each bump destroys and re-creates the wrapper.
  protected readonly remountCount = toSignal(this.waterProcessDiagramService.diagramRemount);

  // * Covers the wait for the web component to mount and React Flow to initialize. Resets on every remount.
  protected readonly isDiagramReady = linkedSignal<number, boolean>({ source: () => this.remountCount(), computation: () => false });

  // * Keeps the skeleton up long enough that a fast load reads as a transition, not a flicker. Restarts on every remount.
  protected readonly isMinimumTimeElapsed = linkedSignal<number, boolean>({ source: () => this.remountCount(), computation: () => false });

  protected readonly isSkeletonVisible = computed(() => !(this.isDiagramReady() && this.isMinimumTimeElapsed()));

  protected readonly convertValueFn: ConvertValueFn = (value, from, to) => new ConvertValue(value, from, to).convertedValue;

  constructor() {
    // * Both timers wait for parent state: in an assessment this component exists while the diagram tab is hidden,
    // * and the skeleton should time from when the diagram actually mounts, not from when the assessment opened.
    effect((onCleanup) => {
      if (!this.processFlowParentState() || this.isMinimumTimeElapsed()) {
        return;
      }
      const minimumTimer = setTimeout(() => this.isMinimumTimeElapsed.set(true), SKELETON_MINIMUM_MS);
      onCleanup(() => clearTimeout(minimumTimer));
    });

    // * failsafe so a diagram that never reports ready cannot leave the skeleton up forever
    effect((onCleanup) => {
      if (!this.processFlowParentState() || this.isDiagramReady()) {
        return;
      }
      const failsafeTimer = setTimeout(() => this.isDiagramReady.set(true), DIAGRAM_READY_FAILSAFE_MS);
      onCleanup(() => clearTimeout(failsafeTimer));
    });
  }

  protected onDiagramReady() {
    this.isDiagramReady.set(true);
  }

  // * Empty until the diagram has loaded and the container is measured, so the web component never mounts with
  // * empty data. Only the first loaded diagram is used: later waterDiagram emissions are saves of that same
  // * object and must not push new parent state (and a re-render) into the web component.
  protected readonly processFlowParentState = toSignal(
    combineLatest([
      this.waterProcessDiagramService.waterDiagram.pipe(filter(Boolean), take(1)),
      this.waterProcessDiagramService.parentContainer.pipe(filter(Boolean))
    ]).pipe(
      map(([waterDiagram, parentContainer]): ProcessFlowParentState => ({
        context: 'water',
        parentContainer,
        waterDiagram,
        appVersion: environment.version
      }))
    )
  );
}
