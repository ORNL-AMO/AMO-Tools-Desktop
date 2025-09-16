import { Component, computed, effect, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';

@Component({
  selector: 'app-baseline',
  standalone: false,
  templateUrl: './baseline.component.html',
  styleUrl: './baseline.component.css',
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class BaselineComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  smallScreenPanelTab: string = 'help';
  readonly ROUTE_TOKENS = ROUTE_TOKENS;


  isModalOpen: boolean = false;
  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;
  setupSubView: Signal<string> = this.processCoolingUiService.setupSubView;

  showResultsPanel: Signal<boolean> = computed(() => {
    return this.setupSubView() !== this.ROUTE_TOKENS.weather && this.setupView() !== this.ROUTE_TOKENS.operatingSchedule;
  });

  constructor() {
    effect(() => {
      // console.log('Main View:', this.mainView());
      // console.log('Setup View:', this.setupView());
      // console.log('Setup Sub View:', this.setupSubView());
    });
  }
}
