import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessUse } from '../../shared/models/water-assessment';
import { WaterAssessmentService } from '../water-assessment.service';

@Component({
  selector: 'app-process-use',
  templateUrl: './process-use.component.html',
  styleUrl: './process-use.component.css'
})
export class ProcessUseComponent {
  settings: Settings;
  processUses: ProcessUse[];
  isCollapsed: boolean = true;
  constructor(private waterAssessmentService: WaterAssessmentService) {

  }
  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.processUses = waterAssessment.processUses;
    // todo set forms
  }

  removeProcess() {

  }

  toggleCollapse() {
    
  }

}