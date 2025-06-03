import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirInventoryData, CompressedAirMotorPropertiesOptions } from '../../../compressed-air-inventory';

@Component({
  selector: 'app-compressed-air-motor-properties',
  templateUrl: './compressed-air-motor-properties.component.html',
  styleUrl: './compressed-air-motor-properties.component.css',
  standalone: false
})
export class CompressedAirMotorPropertiesComponent implements OnInit {

  displayForm: boolean;
  compressedAirMotorPropertiesOptions: CompressedAirMotorPropertiesOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.compressedAirMotorPropertiesOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirMotorPropertiesOptions;
    this.displayForm = this.compressedAirMotorPropertiesOptions.displayCompressedAirMotorProperties;
  }

  save() {
    let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.checkDisplayFields();
    compressedAirInventoryService.displayOptions.compressedAirMotorPropertiesOptions = this.compressedAirMotorPropertiesOptions;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.compressedAirMotorPropertiesOptions.motorFullLoadAmps = this.compressedAirMotorPropertiesOptions.displayCompressedAirMotorProperties;
    this.compressedAirMotorPropertiesOptions.motorPower = this.compressedAirMotorPropertiesOptions.displayCompressedAirMotorProperties;
    this.save();
  }

  checkDisplayFields() {
    this.compressedAirMotorPropertiesOptions.displayCompressedAirMotorProperties = (
      this.compressedAirMotorPropertiesOptions.motorFullLoadAmps ||
      this.compressedAirMotorPropertiesOptions.motorPower
    );
  }
  focusField(str: string) {
    this.focusGroup();
    this.compressedAirInventoryService.focusedField.next(str);
  }

  focusGroup() {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-motor-properties');
  }
}
