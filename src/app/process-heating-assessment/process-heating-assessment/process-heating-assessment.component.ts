import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';

@Component({
  selector: 'app-process-heating-assessment',
  standalone: false,
  templateUrl: './process-heating-assessment.component.html',
  styleUrl: './process-heating-assessment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessHeatingAssessmentComponent implements OnInit {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;

  ngOnInit() {
    this.analyticsService.sendEvent('view-process-heating-assessment', undefined);
  }

  next() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
