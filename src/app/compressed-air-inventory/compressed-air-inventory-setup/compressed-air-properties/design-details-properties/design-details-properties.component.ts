import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirDesignDetailsPropertiesOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-design-details-properties',
  templateUrl: './design-details-properties.component.html',
  styleUrl: './design-details-properties.component.css',
  standalone: false
})
export class DesignDetailsPropertiesComponent implements OnInit {

  displayForm: boolean;
  compressedAirDesignDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.compressedAirDesignDetailsPropertiesOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirDesignDetailsPropertiesOptions;
    this.displayForm = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
  }

  save() {
    let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.checkDisplayFields();
    compressedAirInventoryService.displayOptions.compressedAirDesignDetailsPropertiesOptions = this.compressedAirDesignDetailsPropertiesOptions;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.compressedAirDesignDetailsPropertiesOptions.blowdownTime = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.modulatingPressureRange = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.inputPressure = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.designEfficiency = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.serviceFactor = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.noLoadPowerFM = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.noLoadPowerUL = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.maxFullFlowPressure = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.estimatedTimeLoaded = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.averageLoadFactor = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.compressedAirDesignDetailsPropertiesOptions.motorEfficiencyAtLoad = this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties;
    this.save();
  }

  checkDisplayFields() {
    this.compressedAirDesignDetailsPropertiesOptions.displayCompressedAirDesignDetailsProperties = (
      this.compressedAirDesignDetailsPropertiesOptions.blowdownTime ||
      this.compressedAirDesignDetailsPropertiesOptions.modulatingPressureRange ||
      this.compressedAirDesignDetailsPropertiesOptions.inputPressure ||
      this.compressedAirDesignDetailsPropertiesOptions.designEfficiency ||
      this.compressedAirDesignDetailsPropertiesOptions.serviceFactor ||
      this.compressedAirDesignDetailsPropertiesOptions.noLoadPowerFM ||
      this.compressedAirDesignDetailsPropertiesOptions.noLoadPowerUL ||
      this.compressedAirDesignDetailsPropertiesOptions.maxFullFlowPressure ||
      this.compressedAirDesignDetailsPropertiesOptions.estimatedTimeLoaded ||
      this.compressedAirDesignDetailsPropertiesOptions.averageLoadFactor ||
      this.compressedAirDesignDetailsPropertiesOptions.motorEfficiencyAtLoad
    );
  }
  focusField(str: string) {
    this.focusGroup();
    this.compressedAirInventoryService.focusedField.next(str);
  }

  focusGroup() {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-design-details-properties');
  }
}
