import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { CalculatorsView } from '../models/views';
import { ProcessHeatingRouteData } from '../routing/stepped-routes';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';

@Component({
  selector: 'app-calculator-tab',
  standalone: false,
  template: `
    @if (settings(); as settings) {
      @switch (view) {
        @case (CalculatorsView.O2_ENRICHMENT) {
          <app-o2-enrichment [assessment]="assessment" [settings]="settings" [inAssessment]="true"></app-o2-enrichment>
        }
        @case (CalculatorsView.FUEL_ELECTRICITY_EQUIVALENCY) {
          <app-energy-equivalency [assessment]="assessment" [settings]="settings" [inAssessment]="true"></app-energy-equivalency>
        }
        @case (CalculatorsView.ORIFICE_METER) {
          <app-energy-use [assessment]="assessment" [settings]="settings" [inAssessment]="true"></app-energy-use>
        }
        @case (CalculatorsView.UNIT_CONVERTER) {
          <app-unit-converter [inAssessment]="true"></app-unit-converter>
        }
      }
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%; height: 100%;' },
})
export class CalculatorTabComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly CalculatorsView = CalculatorsView;
  // Read once from the snapshot: uiService.childView() only updates on NavigationEnd, after this tab is created
  readonly view: string = (inject(ActivatedRoute).snapshot.data as ProcessHeatingRouteData).childView;

  get assessment(): Assessment {
    return this.assessmentService.assessmentValue;
  }

  // Copy because the calculators mutate the unit fields of the settings they receive
  readonly settings: Signal<Settings> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    return settings ? { ...settings } : undefined;
  });
}
