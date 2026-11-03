import { Component, computed, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';
import { SETUP_VIEW_LINKS } from '../models/views';

@Component({
  selector: 'app-baseline',
  standalone: false,
  templateUrl: './baseline.component.html',
  host: { class: 'ly-fill' }
})
export class BaselineComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  readonly ROUTE_TOKENS = ROUTE_TOKENS;

  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;
  setupSubView: Signal<string> = this.processCoolingUiService.setupSubView;

  showResultsPanel: Signal<boolean> = computed(() => {
    return this.setupSubView() !== this.ROUTE_TOKENS.weather && this.setupView() !== this.ROUTE_TOKENS.operatingSchedule;
  });

  mainPanelLabel: Signal<string> = computed(() => {
    return SETUP_VIEW_LINKS.find(link => link.view === this.setupView())?.label ?? 'Form';
  });
}
