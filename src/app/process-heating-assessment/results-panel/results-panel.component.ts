import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AssessmentScenario } from '../services/process-heating-assessment.service';

type PanelTab = 'results' | 'help';

@Component({
  selector: 'app-process-heating-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanelComponent {

  readonly scenario = input<AssessmentScenario>('baseline');

  selectedPanelTab: PanelTab = 'results';

  setPanelTab(tab: PanelTab): void {
    this.selectedPanelTab = tab;
  }
}
