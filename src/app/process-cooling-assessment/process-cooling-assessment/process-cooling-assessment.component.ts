import { Component, inject, Signal } from '@angular/core';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { Settings } from '../../shared/models/settings';

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
  readonly showUpdateUnitsModal: Signal<boolean> = this.processCoolingUiService.showUpdateUnitsModalSignal;
  readonly settings: Signal<Settings> = inject(ProcessCoolingAssessmentService).settingsSignal;

  ngOnInit() {
    this.analyticsService.sendEvent('view-process-cooling-assessment', undefined);
  }

  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  readonly canContinue: Signal<boolean> = this.processCoolingUiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.processCoolingUiService.canGoBack;

  selectUpdateAction(shouldUpdateData: boolean) {
    this.processCoolingUiService.showUpdateUnitsModalSignal.set(false);
    this.processCoolingUiService.updateUnitsModalResult.next(shouldUpdateData);
  }

}