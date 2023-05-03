import { Component, OnInit } from '@angular/core';
import { PumpInventoryData, PumpMotorPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../../pump-catalog/pump-catalog.service';

@Component({
  selector: 'app-pump-motor-properties',
  templateUrl: './pump-motor-properties.component.html',
  styleUrls: ['./pump-motor-properties.component.css']
})
export class PumpMotorPropertiesComponent implements OnInit {
  displayForm: boolean;
  pumpMotorPropertiesOptions: PumpMotorPropertiesOptions;
  constructor(private pumpInventoryService: PumpInventoryService, private pumpCatalogService: PumpCatalogService) { }

  ngOnInit(): void {
    this.pumpMotorPropertiesOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpMotorPropertiesOptions;
    this.displayForm = this.pumpMotorPropertiesOptions.displayPumpMotorProperties;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.pumpMotorPropertiesOptions = this.pumpMotorPropertiesOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.pumpMotorPropertiesOptions.motorRPM = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.lineFrequency = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.motorRatedPower = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.motorEfficiencyClass = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.motorRatedVoltage = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.motorFullLoadAmps = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.pumpMotorPropertiesOptions.motorEfficiency = this.pumpMotorPropertiesOptions.displayPumpMotorProperties; 
    this.save();
  }

  checkDisplayFields() {
    this.pumpMotorPropertiesOptions.displayPumpMotorProperties = (
      this.pumpMotorPropertiesOptions.motorRPM ||
      this.pumpMotorPropertiesOptions.lineFrequency ||
      this.pumpMotorPropertiesOptions.motorRatedPower ||
      this.pumpMotorPropertiesOptions.motorEfficiencyClass ||
      this.pumpMotorPropertiesOptions.motorRatedVoltage ||
      this.pumpMotorPropertiesOptions.motorFullLoadAmps ||
      this.pumpMotorPropertiesOptions.motorEfficiency
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('pump-motor-properties');
  }
}
