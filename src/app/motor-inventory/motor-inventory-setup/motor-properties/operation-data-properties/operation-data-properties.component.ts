import { Component, OnInit } from '@angular/core';
import { OperationDataOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-operation-data-properties',
  templateUrl: './operation-data-properties.component.html',
  styleUrls: ['./operation-data-properties.component.css']
})
export class OperationDataPropertiesComponent implements OnInit {

  displayForm: boolean = true;
  operationDataOptions: OperationDataOptions
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.operationDataOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.operationDataOptions;
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
    this.operationDataOptions.ratedSpeed = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.purpose = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.annualOperatingHours = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.averageLoadFactor = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.utilizationFactor = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.percentLoad = this.operationDataOptions.displayOperationData;
    this.operationDataOptions.powerFactorAtLoad = this.operationDataOptions.displayOperationData;
    this.save();
  }

  checkDisplayOperationData() {
    this.operationDataOptions.displayOperationData = (
      this.operationDataOptions.ratedSpeed ||
      this.operationDataOptions.purpose ||
      this.operationDataOptions.annualOperatingHours ||
      this.operationDataOptions.averageLoadFactor ||
      this.operationDataOptions.utilizationFactor ||
      this.operationDataOptions.percentLoad ||
      this.operationDataOptions.powerFactorAtLoad
    );
  }
}
