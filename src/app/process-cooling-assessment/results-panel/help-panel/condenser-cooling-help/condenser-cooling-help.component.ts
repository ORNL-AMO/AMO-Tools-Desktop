import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-asessment.service';
import { CondenserCoolingMethod } from '../../../../shared/models/process-cooling-assessment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-condenser-cooling-help',
  standalone: false,
  templateUrl: './condenser-cooling-help.component.html',
  styleUrl: './condenser-cooling-help.component.css'
})
export class CondenserCoolingHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  CondenserCoolingMethod = CondenserCoolingMethod;
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
  condenserCoolingMethod: number = this.processCoolingAssessmentService.condenserCoolingMethod;

}
