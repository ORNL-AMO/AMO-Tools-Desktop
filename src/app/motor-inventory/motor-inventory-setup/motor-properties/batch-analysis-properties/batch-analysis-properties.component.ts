import { Component, OnInit } from '@angular/core';
import { BatchAnalysisOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-batch-analysis-properties',
    templateUrl: './batch-analysis-properties.component.html',
    styleUrls: ['./batch-analysis-properties.component.css'],
    standalone: false
})
export class BatchAnalysisPropertiesComponent implements OnInit {

  batchAnalysisOptions: BatchAnalysisOptions;
  displayForm: boolean;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.batchAnalysisOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.batchAnalysisOptions;
    this.displayForm = this.batchAnalysisOptions.displayBatchAnalysis;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayBatchAnalysis();
    motorInventoryData.displayOptions.batchAnalysisOptions = this.batchAnalysisOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.batchAnalysisOptions.modifiedCost = this.batchAnalysisOptions.displayBatchAnalysis;
    this.batchAnalysisOptions.modifiedPower = this.batchAnalysisOptions.displayBatchAnalysis;
    this.batchAnalysisOptions.modifiedEfficiency = this.batchAnalysisOptions.displayBatchAnalysis;
    this.batchAnalysisOptions.modifiedPercentLoad = this.batchAnalysisOptions.displayBatchAnalysis;
    this.batchAnalysisOptions.rewindCost = this.batchAnalysisOptions.displayBatchAnalysis;
    this.batchAnalysisOptions.rewindEfficiencyLoss = this.batchAnalysisOptions.displayBatchAnalysis;
    this.save();
  }

  checkDisplayBatchAnalysis() {
    this.batchAnalysisOptions.displayBatchAnalysis = (
      this.batchAnalysisOptions.modifiedCost ||
      this.batchAnalysisOptions.modifiedPower ||
      this.batchAnalysisOptions.modifiedEfficiency ||
      this.batchAnalysisOptions.modifiedPercentLoad ||
      this.batchAnalysisOptions.rewindCost ||
      this.batchAnalysisOptions.rewindEfficiencyLoss
    );
  }

  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('batch-analysis');
  }
}
