import { ChangeDetectionStrategy, Component } from '@angular/core';

type PanelTab = 'results' | 'help';

@Component({
  selector: 'app-process-heating-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanelComponent {

  selectedPanelTab: PanelTab = 'results';

  setPanelTab(tab: PanelTab): void {
    this.selectedPanelTab = tab;
  }
}
