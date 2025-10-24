import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, CompressedAirPerformancePointsPropertiesOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-performance-points-properties',
  templateUrl: './performance-points-properties.component.html',
  styleUrl: './performance-points-properties.component.css',
  standalone: false
})
export class PerformancePointsPropertiesComponent implements OnInit {

  displayForm: boolean;
  compressedAirPerformancePointsPropertiesOptions: CompressedAirPerformancePointsPropertiesOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.compressedAirPerformancePointsPropertiesOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirPerformancePointsPropertiesOptions;
    this.displayForm = this.compressedAirPerformancePointsPropertiesOptions.displayCompressedAirPerformancePointsProperties;
  }

  save() {
    let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    //this.checkDisplayFields();
    compressedAirInventoryService.displayOptions.compressedAirPerformancePointsPropertiesOptions = this.compressedAirPerformancePointsPropertiesOptions;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  // setAll() {
  //   this.compressedAirPerformancePointsPropertiesOptions.motorFullLoadAmps = this.compressedAirPerformancePointsPropertiesOptions.displayCompressedAirPerformancePointsProperties;
  //   this.compressedAirPerformancePointsPropertiesOptions.motorPower = this.compressedAirPerformancePointsPropertiesOptions.displayCompressedAirPerformancePointsProperties;
  //   this.save();
  // }

  // checkDisplayFields() {
  //   this.compressedAirPerformancePointsPropertiesOptions.displayCompressedAirPerformancePointsProperties = (
  //     this.compressedAirPerformancePointsPropertiesOptions.motorFullLoadAmps ||
  //     this.compressedAirPerformancePointsPropertiesOptions.motorPower
  //   );
  // }
  focusField(str: string) {
    this.focusGroup();
    this.compressedAirInventoryService.focusedField.next(str);
  }

  focusGroup() {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-performance-points-properties');
  }
}