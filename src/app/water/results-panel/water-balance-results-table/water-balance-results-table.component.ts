import { Component } from '@angular/core';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { WaterAssessment, SystemBalanceResults, WaterUsingSystem, WaterBalanceResults } from '../../../shared/models/water-assessment';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';

@Component({
  selector: 'app-water-balance-results-table',
  templateUrl: './water-balance-results-table.component.html',
  styleUrl: './water-balance-results-table.component.css'
})
export class WaterBalanceResultsTableComponent {
  settings: Settings;
  settingsSub: Subscription;
  selectedComponentSub: Subscription;
  selectedSystemId: string;
  waterAssessmentSub: Subscription;

  waterBalanceResults: WaterBalanceResults;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterSystemComponentService: WaterSystemComponentService,
    private waterAssessmentResultsService: WaterAssessmentResultsService) { }

  ngOnInit(): void {
    this.settingsSub = this.waterAssessmentService.settings.subscribe(val => {
      this.settings = val;
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(waterAssessment => {
      if (waterAssessment) {
        this.waterBalanceResults = this.waterAssessmentResultsService.getWaterBalanceResults(waterAssessment);

      }
    })

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      if (selectedComponent && this.waterAssessmentService.setupTab.getValue() === 'water-using-system') {
        this.selectedSystemId = selectedComponent.diagramNodeId;
      }
    });
  }
  
  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.selectedComponentSub.unsubscribe();
  }

}