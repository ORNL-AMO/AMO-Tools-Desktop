import { Component, computed, effect, signal, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingMainTabString, ProcessCoolingSetupTabString, ProcessCoolingUiService } from '../process-cooling-ui.service';

@Component({
  selector: 'app-results-panel',
  standalone: false,
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {

  mainTab: WritableSignal<ProcessCoolingMainTabString>;
  setupTab: WritableSignal<ProcessCoolingSetupTabString>;
  displayInventory: Signal<boolean> = computed(() => {
    return this.setupTab() == 'inventory'
  });
  panelTabSelect: WritableSignal<PanelTab> = signal<PanelTab>('help');

  constructor(private processCoolingUiService: ProcessCoolingUiService) {
    this.mainTab = this.processCoolingUiService.mainTabSignal;
    this.setupTab = this.processCoolingUiService.setupTabSignal;

    effect(() => {
      this.panelTabSelect.set(this.displayInventory() ? this.setupTab() as PanelTab : 'help');
    });
  }

  setTab(str: PanelTab) {
    this.panelTabSelect.set(str);
  }
}


export type PanelTab = ProcessCoolingSetupTabString | 'help' | 'results';