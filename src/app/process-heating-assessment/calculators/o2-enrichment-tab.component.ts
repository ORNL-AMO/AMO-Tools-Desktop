import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';

@Component({
  selector: 'app-o2-enrichment-tab',
  standalone: false,
  template: `
    @if (settings(); as settings) {
      <app-o2-enrichment [assessment]="assessment" [settings]="settings" [inAssessment]="true"></app-o2-enrichment>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%;' },
})
export class O2EnrichmentTabComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  get assessment(): Assessment {
    return this.assessmentService.assessmentValue;
  }

  // Copy because the calculators mutate the unit fields of the settings they receive
  readonly settings: Signal<Settings> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    return settings ? { ...settings } : undefined;
  });
}
