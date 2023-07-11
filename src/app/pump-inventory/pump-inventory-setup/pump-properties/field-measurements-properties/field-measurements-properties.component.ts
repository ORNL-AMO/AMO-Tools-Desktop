import { Component, OnInit } from '@angular/core';
import { FieldMeasurementsOptions, PumpInventoryData } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
  selector: 'app-field-measurements-properties',
  templateUrl: './field-measurements-properties.component.html',
  styleUrls: ['./field-measurements-properties.component.css']
})
export class FieldMeasurementsPropertiesComponent implements OnInit {
  displayForm: boolean;
  fieldMeasurementOptions: FieldMeasurementsOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.fieldMeasurementOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.fieldMeasurementOptions;
    this.displayForm = this.fieldMeasurementOptions.displayFieldMeasurements;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.fieldMeasurementOptions = this.fieldMeasurementOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.fieldMeasurementOptions.pumpSpeed = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.yearlyOperatingHours = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.staticSuctionHead = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.staticDischargeHead = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.efficiency = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.assessmentDate = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.operatingFlowRate = this.fieldMeasurementOptions.displayFieldMeasurements;
    this.fieldMeasurementOptions.operatingHead = this.fieldMeasurementOptions.displayFieldMeasurements;    
    this.fieldMeasurementOptions.measuredCurrent = this.fieldMeasurementOptions.displayFieldMeasurements;    
    this.fieldMeasurementOptions.measuredPower = this.fieldMeasurementOptions.displayFieldMeasurements;    
    this.fieldMeasurementOptions.measuredVoltage = this.fieldMeasurementOptions.displayFieldMeasurements;    
    this.save();
  }

  checkDisplayFields() {
    this.fieldMeasurementOptions.displayFieldMeasurements = (
      this.fieldMeasurementOptions.pumpSpeed ||
      this.fieldMeasurementOptions.yearlyOperatingHours ||
      this.fieldMeasurementOptions.staticSuctionHead ||
      this.fieldMeasurementOptions.staticDischargeHead ||
      this.fieldMeasurementOptions.efficiency ||
      this.fieldMeasurementOptions.assessmentDate ||
      this.fieldMeasurementOptions.operatingFlowRate ||
      this.fieldMeasurementOptions.operatingHead ||
      this.fieldMeasurementOptions.measuredCurrent ||
      this.fieldMeasurementOptions.measuredPower ||
      this.fieldMeasurementOptions.measuredVoltage
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('field-measurements');
  }
}
