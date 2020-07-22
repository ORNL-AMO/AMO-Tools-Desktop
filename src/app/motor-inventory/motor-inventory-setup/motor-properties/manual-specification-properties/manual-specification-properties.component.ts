import { Component, OnInit } from '@angular/core';
import { ManualSpecificationOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-manual-specification-properties',
  templateUrl: './manual-specification-properties.component.html',
  styleUrls: ['./manual-specification-properties.component.css']
})
export class ManualSpecificationPropertiesComponent implements OnInit {

  manualSpecificationOptions: ManualSpecificationOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.manualSpecificationOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.manualSpecificationOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.manualSpecificationOptions = this.manualSpecificationOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }
}
