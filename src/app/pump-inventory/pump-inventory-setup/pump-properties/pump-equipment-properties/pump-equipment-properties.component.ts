import { Component, OnInit } from '@angular/core';
import { PumpInventoryData, PumpPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
    selector: 'app-pump-equipment-properties',
    templateUrl: './pump-equipment-properties.component.html',
    styleUrls: ['./pump-equipment-properties.component.css'],
    standalone: false
})
export class PumpEquipmentPropertiesComponent implements OnInit {

  displayForm: boolean;
  pumpPropertiesOptions: PumpPropertiesOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.pumpPropertiesOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpPropertiesOptions;
    this.displayForm = this.pumpPropertiesOptions.displayPumpProperties;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.pumpPropertiesOptions = this.pumpPropertiesOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.pumpPropertiesOptions.pumpType = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.shaftOrientation = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.shaftSealType = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.numStages = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.inletDiameter = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.outletDiameter = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.maxWorkingPressure = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.maxAmbientTemperature = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.maxSuctionLift = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.displacement = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.startingTorque = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.ratedSpeed = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.impellerDiameter = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.minFlowSize = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.pumpSize = this.pumpPropertiesOptions.displayPumpProperties; 
    this.pumpPropertiesOptions.designHead = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.designFlow = this.pumpPropertiesOptions.displayPumpProperties;
    this.pumpPropertiesOptions.designEfficiency = this.pumpPropertiesOptions.displayPumpProperties;
    this.save();
  }

  checkDisplayFields() {
    this.pumpPropertiesOptions.displayPumpProperties = (
      this.pumpPropertiesOptions.pumpType ||
      this.pumpPropertiesOptions.shaftOrientation ||
      this.pumpPropertiesOptions.shaftSealType ||
      this.pumpPropertiesOptions.numStages ||
      this.pumpPropertiesOptions.inletDiameter ||
      this.pumpPropertiesOptions.outletDiameter ||
      this.pumpPropertiesOptions.maxWorkingPressure ||
      this.pumpPropertiesOptions.maxAmbientTemperature ||
      this.pumpPropertiesOptions.maxSuctionLift ||
      this.pumpPropertiesOptions.displacement ||
      this.pumpPropertiesOptions.startingTorque ||
      this.pumpPropertiesOptions.ratedSpeed ||
      this.pumpPropertiesOptions.impellerDiameter ||
      this.pumpPropertiesOptions.minFlowSize ||
      this.pumpPropertiesOptions.pumpSize ||
      this.pumpPropertiesOptions.designHead ||
      this.pumpPropertiesOptions.designFlow ||
      this.pumpPropertiesOptions.designEfficiency 
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('pump-equipment-properties');
  }
}
