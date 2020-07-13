import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { MotorPropertyDisplayOptions, MotorInventoryData } from '../../motor-inventory';

@Component({
  selector: 'app-motor-properties',
  templateUrl: './motor-properties.component.html',
  styleUrls: ['./motor-properties.component.css']
})
export class MotorPropertiesComponent implements OnInit {

  displayOptions: MotorPropertyDisplayOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions = this.displayOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

}
