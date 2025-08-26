import { Component, OnInit } from '@angular/core';
import { CompressedAirInventoryData, NameplateDataOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-nameplate-data-properties',
  templateUrl: './nameplate-data-properties.component.html',
  styleUrl: './nameplate-data-properties.component.css',
  standalone: false
})
export class NameplateDataPropertiesComponent implements OnInit {

  displayForm: boolean;
  nameplateDataOptions: NameplateDataOptions;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    this.nameplateDataOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.nameplateDataOptions;
    this.displayForm = this.nameplateDataOptions.displayNameplateData;
  }

  save() {
    let compressedAirInventoryService: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.checkDisplayFields();
    compressedAirInventoryService.displayOptions.nameplateDataOptions = this.nameplateDataOptions;
    this.compressedAirInventoryService.compressedAirInventoryData.next(compressedAirInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.nameplateDataOptions.compressorType = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.fullLoadOperatingPressure = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.fullLoadRatedCapacity = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.totalPackageInputPower = this.nameplateDataOptions.displayNameplateData;
    this.save();
  }

  checkDisplayFields() {
    this.nameplateDataOptions.displayNameplateData = (
      this.nameplateDataOptions.compressorType ||
      this.nameplateDataOptions.fullLoadOperatingPressure ||
      this.nameplateDataOptions.fullLoadRatedCapacity ||
      this.nameplateDataOptions.totalPackageInputPower
    );
  }
  focusField(str: string) {
    this.focusGroup();
    this.compressedAirInventoryService.focusedField.next(str);
  }

  focusGroup() {
    this.compressedAirInventoryService.focusedDataGroup.next('nameplate-data');
  }

}
