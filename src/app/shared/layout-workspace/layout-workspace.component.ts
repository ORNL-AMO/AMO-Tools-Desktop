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
 *   - raisedMain: give the main panel the raised surface (white, shadow over the aside)
 */
@Component({
  selector: 'app-layout-workspace',
  templateUrl: './layout-workspace.component.html',
  standalone: true,
  host: {
    'class': 'layout-workspace',
    '[class.layout-workspace--even]': "variant() === 'even'",
    '[class.layout-workspace--weighted]': "variant() === 'weighted'",
    '[class.layout-workspace--solo]': "variant() === 'solo'",
    '[attr.data-active-panel]': 'visiblePanel()',
  },
})
export class LayoutWorkspaceComponent {
  variant = input<WorkspaceVariant>('even');
  mainLabel = input<string>('Form');
  asideLabel = input<string>('Details');
  raisedMain = input<boolean>(false);

  readonly id = `layout-workspace-${nextWorkspaceId++}`;
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
