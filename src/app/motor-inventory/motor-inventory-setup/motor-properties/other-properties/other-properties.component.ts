import { Component, OnInit } from '@angular/core';
import { OtherOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-other-properties',
    templateUrl: './other-properties.component.html',
    styleUrls: ['./other-properties.component.css'],
    standalone: false
})
export class OtherPropertiesComponent implements OnInit {

  displayForm: boolean;
  otherOptions: OtherOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.otherOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.otherOptions;
    this.displayForm = this.otherOptions.displayOther;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayOther();
    motorInventoryData.displayOptions.otherOptions = this.otherOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.otherOptions.driveType = this.otherOptions.displayOther;
    this.otherOptions.hasLoggerData = this.otherOptions.displayOther;
    this.otherOptions.isVFD = this.otherOptions.displayOther;
    this.otherOptions.voltageConnectionType = this.otherOptions.displayOther;
    this.save();
  }

  checkDisplayOther() {
    this.otherOptions.displayOther = (
      this.otherOptions.driveType ||
      this.otherOptions.hasLoggerData ||
      this.otherOptions.isVFD ||
      this.otherOptions.voltageConnectionType
    )
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('other');
  }
}
