import { Component, computed, input, signal } from '@angular/core';

export type WorkspaceVariant = 'even' | 'weighted' | 'solo';
export type WorkspacePanel = 'main' | 'aside';

let nextWorkspaceId = 0;

/**
 * Main + aside panel split from the layout platform (layout-platform.css).
 * Wide screens show both panels; at the medium tier one panel shows at a time and this component renders the switcher.
 * Views project content with the lyMain and lyAside attributes and never hold switcher state themselves.
 *   - variant: 'even' (50/50), 'weighted' (2:1), 'solo' (main only, no switcher)
 *   - mainLabel / asideLabel: switcher labels
 *   - mainClass / asideClass: extra classes for each panel. Temporary bridge for legacy global classes
 *     (e.g. modification, scroll-item) that content still depends on; remove once views use ly-* primitives.
 */
@Component({
  selector: 'app-layout-workspace',
  templateUrl: './layout-workspace.component.html',
  standalone: true,
  host: {
    'class': 'ly-workspace',
    '[class.ly-workspace--even]': "variant() === 'even'",
    '[class.ly-workspace--weighted]': "variant() === 'weighted'",
    '[class.ly-workspace--solo]': "variant() === 'solo'",
    '[attr.data-active-panel]': 'visiblePanel()',
  },
})
export class LayoutWorkspaceComponent {
  variant = input<WorkspaceVariant>('even');
  mainLabel = input<string>('Form');
  asideLabel = input<string>('Details');
  mainClass = input<string>('');
  asideClass = input<string>('');

  readonly id = `ly-workspace-${nextWorkspaceId++}`;
  private activePanel = signal<WorkspacePanel>('main');

  hasAside = computed(() => this.variant() !== 'solo');
  visiblePanel = computed<WorkspacePanel>(() => this.hasAside() ? this.activePanel() : 'main');

  showPanel(panel: WorkspacePanel) {
    if (panel === this.activePanel()) {
      return;
    }
    this.activePanel.set(panel);
    // * Charts drawn while their panel was hidden have the wrong size. Plotly and billboard redraw on window resize,
    // * so signal one after the newly shown panel has laid out.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
}
