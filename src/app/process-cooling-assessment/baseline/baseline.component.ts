import { Component, effect, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';

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

  isModalOpen: boolean = false;
  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;

  constructor() {
    effect(() => {
      console.log('Main View:', this.mainView());
      console.log('Setup View:', this.setupView());
    });
  }
}
