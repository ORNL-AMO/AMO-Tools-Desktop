import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';
import { IntakeSource } from '../../shared/models/water-assessment';

@Component({
  selector: 'app-intake-source',
  templateUrl: './intake-source.component.html',
  styleUrl: './intake-source.component.css'
})
export class IntakeSourceComponent {
  settings: Settings;
  intakeSources: IntakeSource[];
  isCollapsed: boolean = true;
  constructor(private waterAssessmentService: WaterAssessmentService) {

  }
  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.intakeSources = waterAssessment.intakeSources;
    // todo set forms
  }

  removeIntake() {

  }

  toggleCollapse() {
    
  }
}
