import { Component, OnInit } from '@angular/core';
import { TorqueOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-torque-properties',
  templateUrl: './torque-properties.component.html',
  styleUrls: ['./torque-properties.component.css']
})
export class TorquePropertiesComponent implements OnInit {
  
  displayForm: boolean = true;
  torqueOptions: TorqueOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.torqueOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.torqueOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.torqueOptions = this.torqueOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  } 

}
