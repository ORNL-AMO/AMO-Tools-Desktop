import { Component } from '@angular/core';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { WaterBalanceResults, getWaterBalanceResults } from 'process-flow-lib';

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
        this.waterBalanceResults = getWaterBalanceResults(waterAssessment.waterUsingSystems);
        console.log('Water Balance Results:', this.waterBalanceResults);
      }
    })

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      if (selectedComponent && this.waterAssessmentService.setupTab.getValue() === 'water-using-system') {
        this.selectedSystemId = selectedComponent.diagramNodeId;
      }
    });
  }
  
  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.selectedComponentSub.unsubscribe();
  }

}
