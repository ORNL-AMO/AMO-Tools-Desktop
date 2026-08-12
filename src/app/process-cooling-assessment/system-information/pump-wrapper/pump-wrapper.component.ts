import { Component, inject } from '@angular/core';
import { CondenserCoolingMethod } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-pump-wrapper',
  standalone: false,
  templateUrl: './pump-wrapper.component.html',
})
export class PumpWrapperComponent {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  get isAirCooled(): boolean {
    return this.processCoolingAssessmentService.condenserCoolingMethod === CondenserCoolingMethod.Air;
  }
}
