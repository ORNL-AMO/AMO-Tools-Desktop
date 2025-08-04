import { Component, effect, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService, SYSTEM_INFORMATION_VIEW_LINKS } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-system-information',
  standalone: false,
  templateUrl: './system-information.component.html',
  styleUrl: './system-information.component.css'
})
export class SystemInformationComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  smallScreenPanelTab: string = 'help';

  isModalOpen: boolean = false;
  setupSubView: Signal<string> = this.processCoolingUiService.setupSubView;

  SYSTEM_INFORMATION_VIEW_LINKS = SYSTEM_INFORMATION_VIEW_LINKS;
  constructor() {
    effect(() => {
      console.log('Setup Sub View:', this.setupSubView());
    });
  }

  back() {
    this.processCoolingUiService.back();
  }
  continue() {
    this.processCoolingUiService.continue();
  }
}
