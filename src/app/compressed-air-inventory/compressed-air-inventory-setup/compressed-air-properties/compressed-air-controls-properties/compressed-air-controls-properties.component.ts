import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirControlsPropertiesOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-compressed-air-controls-properties',
  templateUrl: './compressed-air-controls-properties.component.html',
  styleUrl: './compressed-air-controls-properties.component.css'
})
export class CompressedAirControlsPropertiesComponent implements OnInit {

  displayForm: boolean;
  compressedAirControlsPropertiesOptions: CompressedAirControlsPropertiesOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.compressedAirControlsPropertiesOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirControlsPropertiesOptions;
    this.displayForm = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
  }

  save() {
    let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.checkDisplayFields();
    compressedAirInventoryService.displayOptions.compressedAirControlsPropertiesOptions = this.compressedAirControlsPropertiesOptions;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.compressedAirControlsPropertiesOptions.controlType = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
    this.compressedAirControlsPropertiesOptions.unloadPointCapacity = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
    this.compressedAirControlsPropertiesOptions.numberOfUnloadSteps = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
    this.compressedAirControlsPropertiesOptions.automaticShutdown = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
    this.compressedAirControlsPropertiesOptions.unloadSumpPressure = this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties;
    this.save();
  }

  checkDisplayFields() {
    this.compressedAirControlsPropertiesOptions.displayCompressedAirControlsProperties = (
      this.compressedAirControlsPropertiesOptions.controlType ||
      this.compressedAirControlsPropertiesOptions.unloadPointCapacity ||
      this.compressedAirControlsPropertiesOptions.numberOfUnloadSteps ||
      this.compressedAirControlsPropertiesOptions.automaticShutdown ||
      this.compressedAirControlsPropertiesOptions.unloadSumpPressure
    );
  }
  focusField(str: string) {
    this.focusGroup();
    this.compressedAirInventoryService.focusedField.next(str);
  }

  focusGroup() {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-controls-properties');
  }
}
