import { Component, Input, OnInit } from '@angular/core';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { Assessment } from '../../../../../shared/models/assessment';
import { Settings } from '../../../../../shared/models/settings';
import { WasteWaterResults } from '../../../../../shared/models/waste-water';
import { WasteWaterService } from '../../../../../waste-water/waste-water.service';
import { AssessmentService } from '../../../../assessment.service';

@Component({
  selector: 'app-waste-water-summary-card',
  templateUrl: './waste-water-summary-card.component.html',
  styleUrls: ['./waste-water-summary-card.component.css']
})
export class WasteWaterSummaryCardComponent implements OnInit {
  @Input()
  assessment: Assessment;


  baselineResults: WasteWaterResults;
  modificationResults: WasteWaterResults;
  setupDone: boolean;
  numMods: number = 0;
  constructor(private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService, private assessmentService: AssessmentService) { }

  ngOnInit(): void {
    this.setupDone = this.wasteWaterService.checkWasteWaterValid(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.systemBasics);
    if (this.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
      this.baselineResults = this.wasteWaterService.calculateResults(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, settings);
      this.numMods = this.assessment.wasteWater.modifications.length;
      this.assessment.wasteWater.modifications.forEach(modification => {
        let tmpResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, this.assessment.wasteWater.systemBasics, settings, this.baselineResults);
        if (!this.modificationResults || this.modificationResults.costSavings < tmpResults.costSavings) {
          this.modificationResults = tmpResults;
        }
      });
    }
  }


  goToAssessment(str?: string, str2?: string) {
    this.assessmentService.goToAssessment(this.assessment, str, str2);
  }
}
