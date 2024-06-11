import { Component, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { WaterAssessmentService } from '../../../../../water/water-assessment.service';
import { AssessmentService } from '../../../../assessment.service';
import { WaterAssessmentResultsService } from '../../../../../water/water-assessment-results.service';
import { Settings } from '../../../../../shared/models/settings';
import { WaterAssessmentResults } from '../../../../../shared/models/water-assessment';

@Component({
  selector: 'app-water-summary-card',
  templateUrl: './water-summary-card.component.html',
  styleUrl: './water-summary-card.component.css'
})
export class WaterSummaryCardComponent {
  @Input()
  assessment: Assessment;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

  baselineResults: WaterAssessmentResults;
  modificationResults: WaterAssessmentResults;
  setupDone: boolean;
  numMods: number = 0;
  showReport: boolean = false;
  constructor(private settingsDbService: SettingsDbService, 
    private waterService: WaterAssessmentService, 
    private waterResultsService: WaterAssessmentResultsService, 
    private assessmentService: AssessmentService) { }

  ngOnInit(): void {
    // this.setupDone = this.waterService.checkWaterValid(this.assessment.water.baselineData.activatedSludgeData, this.assessment.water.baselineData.aeratorPerformanceData, this.assessment.water.baselineData.operations).isValid;
    if (this.setupDone) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
      // this.baselineResults = this.waterResultsService.calculateResults(this.assessment.water.baselineData.activatedSludgeData, this.assessment.water.baselineData.aeratorPerformanceData, this.assessment.water.baselineData.operations, this.assessment.water.baselineData.co2SavingsData, settings, false);
      // this.numMods = this.assessment.water.modifications.length;
      // this.assessment.water.modifications.forEach(modification => {
      //   let tmpResults: WaterAssessmentResults = this.waterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, modification.operations, modification.co2SavingsData, settings, false, this.baselineResults);
      //   if (!this.modificationResults || this.modificationResults.costSavings < tmpResults.costSavings) {
      //     this.modificationResults = tmpResults;
      //   }
      // });
    }
  }


  goToAssessment(str?: string) {
    this.assessmentService.goToAssessment(this.assessment, str, undefined);
  }

  showReportModal() {
    this.showReport = true;
    this.reportModal.show();
  }

  hideReportModal() {
    this.reportModal.hide();
    this.showReport = false;
  }
}
