import { Component, inject, Signal } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-load-schedule',
  standalone: false,
  templateUrl: './load-schedule.component.html',
  styleUrl: './load-schedule.component.css'
})
export class LoadScheduleComponent {
  private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  chillerInventory: Array<ChillerInventoryItem> = this.processCooling().inventory;

  constructor() { }

  ngOnInit(): void { 
  }

}
