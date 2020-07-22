import { Component, OnInit } from '@angular/core';
import { OtherOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-other-properties',
  templateUrl: './other-properties.component.html',
  styleUrls: ['./other-properties.component.css']
})
export class OtherPropertiesComponent implements OnInit {

  otherOptions: OtherOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.otherOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.otherOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.otherOptions = this.otherOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

}
