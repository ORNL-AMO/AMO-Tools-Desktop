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
    motorInventoryData.displayOptions.operationDataOptions = this.operationDataOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }
  
  toggleForm(){
    this.displayForm = !this.displayForm;
  }  
}
