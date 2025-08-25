import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-load-schedule',
  standalone: false,
  templateUrl: './load-schedule.component.html',
  styleUrl: './load-schedule.component.css'
})
export class LoadScheduleComponent {
  private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  processCooling: WritableSignal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  chillerInventory: Array<ChillerInventoryItem> = this.processCooling().inventory;

  constructor() { }

  ngOnInit(): void { 
  }

}
