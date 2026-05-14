import { Component, computed, inject, Signal } from '@angular/core';
import { FacilityInfo } from '../../../shared/models/settings';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-facility-info',
  standalone: false,
  templateUrl: './facility-info.component.html',
  styleUrls: ['./facility-info.component.css']
})
export class FacilityInfoComponent {
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  readonly facilityInfo: Signal<FacilityInfo> = computed(() => this.processCoolingAssessmentService.settingsSignal()?.facilityInfo);
}