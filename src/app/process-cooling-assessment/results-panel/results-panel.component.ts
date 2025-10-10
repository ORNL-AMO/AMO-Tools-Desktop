import { Component, computed, effect, inject, Signal } from '@angular/core';
import { MainView, ProcessCoolingSetupTabString, ProcessCoolingUiService, SetupView } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {
  private readonly processCoolingUIService = inject(ProcessCoolingUiService);
  selectedPanelTab: PanelTab = 'help';

  mainView: Signal<string> = this.processCoolingUIService.mainView;
  setupView: Signal<string> = this.processCoolingUIService.childView;

  displayInventory: Signal<boolean> = computed(() => {
    return this.mainView() === MainView.BASELINE && (this.setupView() === SetupView.INVENTORY || this.setupView() === SetupView.LOAD_SCHEDULE);
  });

  displayResults: Signal<boolean> = computed(() => {
    return this.mainView() === MainView.BASELINE && (this.setupView() === SetupView.INVENTORY || this.setupView() === SetupView.LOAD_SCHEDULE);
  });

  constructor() {
    effect(() => {
      if (this.setupView() === SetupView.INVENTORY || this.setupView() === SetupView.LOAD_SCHEDULE) {
        this.setPanelTab('inventory');
      } else {
        this.setPanelTab('help');
      }
    });
  }

  setPanelTab(str: PanelTab) {
    this.selectedPanelTab = str;
  }
}


export type PanelTab = ProcessCoolingSetupTabString | 'help' | 'results';