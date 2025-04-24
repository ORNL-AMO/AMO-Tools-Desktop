import { Component, OnInit } from '@angular/core';
import { OperationDataOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-operation-data-properties',
    templateUrl: './operation-data-properties.component.html',
    styleUrls: ['./operation-data-properties.component.css'],
    standalone: false
})
export class OperationDataPropertiesComponent implements OnInit {

  displayForm: boolean;
  operationDataOptions: OperationDataOptions
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.operationDataOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.operationDataOptions;
    this.displayForm = this.operationDataOptions.displayOperationData;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayOperationData();
    motorInventoryData.displayOptions.operationDataOptions = this.operationDataOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.operationDataOptions.location = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.annualOperatingHours = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.averageLoadFactor = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.utilizationFactor = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.efficiencyAtAverageLoad = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.powerFactorAtLoad = this.operationDataOptions.displayOperationData;
    this.save();
  }

  checkDisplayOperationData() {
    this.operationDataOptions.displayOperationData = (
      this.operationDataOptions.location ||
      this.operationDataOptions.annualOperatingHours ||
      this.operationDataOptions.averageLoadFactor ||
      this.operationDataOptions.utilizationFactor ||
      this.operationDataOptions.efficiencyAtAverageLoad ||
      this.operationDataOptions.powerFactorAtLoad
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('operation-data');
  }
}
