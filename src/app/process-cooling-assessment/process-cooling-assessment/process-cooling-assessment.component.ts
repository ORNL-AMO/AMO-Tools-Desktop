import { Component, inject, Signal } from '@angular/core';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { MAIN_VIEW_LINKS, ProcessCoolingUiService, SETUP_VIEW_LINKS, ViewLink } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-process-cooling-assessment',
  standalone: false,
  templateUrl: './process-cooling-assessment.component.html',
  styleUrl: './process-cooling-assessment.component.css'
})
export class ProcessCoolingAssessmentComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly analyticsService = inject(AnalyticsService);

  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showUpdateUnitsModal: boolean = false;

  ngOnInit() {
    this.analyticsService.sendEvent('view-process-cooling-assessment', undefined);
  }

  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  get canContinue(): boolean {
    return this.processCoolingUiService.canContinue();
  }

  get canGoBack(): boolean {
    return this.processCoolingUiService.canGoBack();
  }

}