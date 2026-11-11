import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, signal } from '@angular/core';
import { Notes } from '../models/phast';
import { AssessmentView, BaselineView, LOSS_VIEW_NOTES_KEY, MainView } from '../models/views';
import { AssessmentScenario } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';

type PanelTab = 'results' | 'help' | 'notes';

@Component({
  selector: 'app-process-heating-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanelComponent {
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly scenario = input<AssessmentScenario>('baseline');

  readonly isEnergyValidationView: Signal<boolean> = this.uiService.isEnergyValidationView;
  readonly isHeatBalanceView: Signal<boolean> = computed(() => this.uiService.childView() === BaselineView.HEAT_BALANCE);
  readonly isAuxiliaryEquipmentView: Signal<boolean> = this.uiService.isAuxiliaryEquipmentView;

  readonly showNotesTab: Signal<boolean> = computed(() => this.uiService.mainView() === MainView.ASSESSMENT);

  readonly notesKey: Signal<keyof Notes | undefined> = computed(() =>
    this.uiService.childView() === AssessmentView.EXPERT_VIEW
      ? LOSS_VIEW_NOTES_KEY[this.uiService.selectedExpertViewTab()]
      : this.uiService.exploreNotesKey()
  );

  readonly showResultsTab: Signal<boolean> = computed(() => this.uiService.childView() !== BaselineView.ASSESSMENT_SETTINGS);

  private readonly selectedPanelTab = signal<PanelTab>('results');

  readonly activePanelTab: Signal<PanelTab> = computed(() =>
    this.selectedPanelTab() === 'results' && !this.showResultsTab() ? 'help' : this.selectedPanelTab()
  );

  setPanelTab(tab: PanelTab): void {
    this.selectedPanelTab.set(tab);
  }
}
