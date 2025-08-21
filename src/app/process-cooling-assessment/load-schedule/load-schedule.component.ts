import { Component, computed, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-load-schedule',
  standalone: false,
  templateUrl: './load-schedule.component.html',
  styleUrl: './load-schedule.component.css'
})
export class LoadScheduleComponent {
  private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  processCooling: WritableSignal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  constructor() { }

  ngOnInit(): void { }

}
