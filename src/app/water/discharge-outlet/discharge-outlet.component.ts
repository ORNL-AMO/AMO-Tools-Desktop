import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { DischargeOutlet } from '../../shared/models/water-assessment';
import { WaterAssessmentService } from '../water-assessment.service';

@Component({
  selector: 'app-discharge-outlet',
  templateUrl: './discharge-outlet.component.html',
  styleUrl: './discharge-outlet.component.css'
})
export class DischargeOutletComponent {
  settings: Settings;
  dischargeOutlets: DischargeOutlet[];
  isCollapsed: boolean = true;
  constructor(private waterAssessmentService: WaterAssessmentService) {

  }
  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.dischargeOutlets = waterAssessment.dischargeOutlets;
    // todo set forms
  }

  removeOutlet() {

  }

  toggleCollapse() {
    
  }

}