import { Component, computed, inject, Signal } from '@angular/core';
import { ProcessCoolingSetupTabString, ProcessCoolingUiService } from '../services/process-cooling-ui.service';

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
    return this.mainView() === 'baseline' && this.setupView() === 'inventory';
  });

  setPanelTab(str: PanelTab) {
    this.selectedPanelTab = str;
  }
}


  export type PanelTab = ProcessCoolingSetupTabString | 'help' | 'results';