import { Component, computed, effect, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';

@Component({
  selector: 'app-baseline',
  standalone: false,
  templateUrl: './baseline.component.html',
  styleUrl: './baseline.component.css',
  host: { style: 'height: 100%;' }
})
export class BaselineComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  smallScreenPanelTab: string = 'help';
  readonly ROUTE_TOKENS = ROUTE_TOKENS;


  isModalOpen: boolean = false;
  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;
  showResultsPanel: Signal<boolean> = computed(() => {
    console.log('showResultsPanel', this.setupView());
    return this.setupView() !== this.ROUTE_TOKENS.loadSchedule;
  });

  constructor() {
    effect(() => {
      console.log('Main View:', this.mainView());
      console.log('Setup View:', this.setupView());
    });
  }
}
