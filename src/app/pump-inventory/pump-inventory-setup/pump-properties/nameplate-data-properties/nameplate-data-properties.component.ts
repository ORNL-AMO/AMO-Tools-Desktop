import { Component, OnInit } from '@angular/core';
import { NameplateDataOptions, PumpInventoryData } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
  selector: 'app-nameplate-data-properties',
  templateUrl: './nameplate-data-properties.component.html',
  styleUrls: ['./nameplate-data-properties.component.css']
})
export class NameplateDataPropertiesComponent implements OnInit {
  displayForm: boolean;
  nameplateDataOptions: NameplateDataOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.nameplateDataOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.nameplateDataOptions;
    this.displayForm = this.nameplateDataOptions.displayNameplateData;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.nameplateDataOptions = this.nameplateDataOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.nameplateDataOptions.manufacturer = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.model = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.serialNumber = this.nameplateDataOptions.displayNameplateData;
    this.save();
  }

  checkDisplayFields() {
    this.nameplateDataOptions.displayNameplateData = (
      this.nameplateDataOptions.manufacturer ||
      this.nameplateDataOptions.model ||
      this.nameplateDataOptions.serialNumber
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('nameplate-data');
  }
}
