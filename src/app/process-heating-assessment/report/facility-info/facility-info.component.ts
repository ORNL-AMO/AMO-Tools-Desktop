import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FacilityInfo } from '../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

@Component({
  selector: 'app-facility-info',
  standalone: false,
  templateUrl: './facility-info.component.html',
  styleUrls: ['./facility-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacilityInfoComponent {
  private readonly processHeatingAssessmentService = inject(ProcessHeatingAssessmentService);

  readonly facilityInfo: Signal<FacilityInfo> = computed(() => this.processHeatingAssessmentService.settingsSignal()?.facilityInfo);
  readonly equipmentNotes: Signal<string> = computed(() => this.processHeatingAssessmentService.processHeatingSignal()?.equipmentNotes);
  readonly operatingConditions: Signal<string> = computed(() => this.processHeatingAssessmentService.processHeatingSignal()?.operatingHours?.operatingConditions);
}
