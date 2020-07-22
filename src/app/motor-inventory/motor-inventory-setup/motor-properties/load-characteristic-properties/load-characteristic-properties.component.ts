import { Component, OnInit } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryData, LoadCharacteristicOptions } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-load-characteristic-properties',
  templateUrl: './load-characteristic-properties.component.html',
  styleUrls: ['./load-characteristic-properties.component.css']
})
export class LoadCharacteristicPropertiesComponent implements OnInit {

  loadCharacteristicOptions: LoadCharacteristicOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.loadCharacteristicOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.loadCharactersticOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.loadCharactersticOptions = this.loadCharacteristicOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }
}
