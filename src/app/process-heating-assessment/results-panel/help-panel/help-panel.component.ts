import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ROUTE_TOKENS } from '../../constants/process-heating-routes';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-process-heating-help-panel',
  standalone: false,
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPanelComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  readonly childView: Signal<string> = this.uiService.childView;
  readonly lossSubView: Signal<string> = this.uiService.lossSubView;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
}
