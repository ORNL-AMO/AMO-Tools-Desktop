import { Component, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';
import { Subscription } from 'rxjs';
import { ROUTE_TOKENS } from '../../process-cooling-assessment.module';

@Component({
  selector: 'app-help-panel',
  standalone: false,
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css'
})
export class HelpPanelComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  selectedTab: string;
  selectedTabSub: Subscription;

  ROUTE_TOKENS = ROUTE_TOKENS;

  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;

}