import { Component, inject } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';

@Component({
  selector: 'app-load-schedule',
  standalone: false,
  templateUrl: './load-schedule.component.html',
  styleUrl: './load-schedule.component.css'
})
export class LoadScheduleComponent {
  private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  constructor() { }

  ngOnInit(): void { }

}
