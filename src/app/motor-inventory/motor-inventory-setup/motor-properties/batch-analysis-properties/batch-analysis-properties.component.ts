import { Component, OnInit } from '@angular/core';
import { BatchAnalysisOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-batch-analysis-properties',
  templateUrl: './batch-analysis-properties.component.html',
  styleUrls: ['./batch-analysis-properties.component.css']
})
export class BatchAnalysisPropertiesComponent implements OnInit {

  batchAnalysisOptions: BatchAnalysisOptions;
  displayForm: boolean = true;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.batchAnalysisOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.batchAnalysisOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.batchAnalysisOptions = this.batchAnalysisOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }
}
