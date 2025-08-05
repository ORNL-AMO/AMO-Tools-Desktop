import { Component, inject } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { CondenserCoolingMethod } from '../../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-condenser-cooling-system',
  standalone: false,
  templateUrl: './condenser-cooling-system.component.html',
  styleUrl: './condenser-cooling-system.component.css'
})
export class CondenserCoolingSystemComponent {
    private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService)
    CondenserCoolingMethod = CondenserCoolingMethod;
    get condenserCoolingMethod(): number {
      return this.processCoolingAssessmentService.condenserCoolingMethod;
  }
}
