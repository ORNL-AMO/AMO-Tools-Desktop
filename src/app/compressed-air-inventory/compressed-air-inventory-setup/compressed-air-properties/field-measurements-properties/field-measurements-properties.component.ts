import { Component, OnInit } from '@angular/core';
import { FieldMeasurementsOptions, CompressedAirInventoryData } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-field-measurements-properties',
  templateUrl: './field-measurements-properties.component.html',
  styleUrl: './field-measurements-properties.component.css'
})
export class FieldMeasurementsPropertiesComponent implements OnInit {

  displayForm: boolean;
  fieldMeasurementsOptions: FieldMeasurementsOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.fieldMeasurementsOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.fieldMeasurementsOptions;
    this.displayForm = this.fieldMeasurementsOptions.displayFieldMeasurements;
  }

  save() {
      let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
      this.checkDisplayFields();
      compressedAirInventoryService.displayOptions.fieldMeasurementsOptions = this.fieldMeasurementsOptions;
      this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
    }
  
    toggleForm() {
      this.displayForm = !this.displayForm;
    }
  
    setAll() {
      this.fieldMeasurementsOptions.yearlyOperatingHours = this.fieldMeasurementsOptions.displayFieldMeasurements;
      this.save();
    }
  
    checkDisplayFields() {
      this.fieldMeasurementsOptions.displayFieldMeasurements = (
        this.fieldMeasurementsOptions.yearlyOperatingHours 
      );
    }
    focusField(str: string){
      this.focusGroup();
      this.compressedAirInventoryService.focusedField.next(str);
    }
  
    focusGroup(){
      this.compressedAirInventoryService.focusedDataGroup.next('field-measurements');
    }


}
