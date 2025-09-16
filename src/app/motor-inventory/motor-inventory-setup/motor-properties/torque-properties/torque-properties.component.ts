import { Component, OnInit } from '@angular/core';
import { TorqueOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-torque-properties',
    templateUrl: './torque-properties.component.html',
    styleUrls: ['./torque-properties.component.css'],
    standalone: false
})
export class TorquePropertiesComponent implements OnInit {
  
  displayForm: boolean;
  torqueOptions: TorqueOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.torqueOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.torqueOptions;
    this.displayForm = this.torqueOptions.displayTorque;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayTorque();
    motorInventoryData.displayOptions.torqueOptions = this.torqueOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }

  setAll(){
    this.torqueOptions.torqueBreakDown = this.torqueOptions.displayTorque;
    this.torqueOptions.torqueFullLoad = this.torqueOptions.displayTorque;
    this.torqueOptions.torqueLockedRotor = this.torqueOptions.displayTorque;
    this.save();
  }

  checkDisplayTorque(){
    this.torqueOptions.displayTorque = (
      this.torqueOptions.torqueBreakDown ||
      this.torqueOptions.torqueFullLoad ||
      this.torqueOptions.torqueLockedRotor
    )
  }

  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('torque');
  }
}
