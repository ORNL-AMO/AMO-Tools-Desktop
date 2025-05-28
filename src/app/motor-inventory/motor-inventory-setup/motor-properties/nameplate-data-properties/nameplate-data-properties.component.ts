import { Component, OnInit } from '@angular/core';
import { NameplateDataOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-nameplate-data-properties',
    templateUrl: './nameplate-data-properties.component.html',
    styleUrls: ['./nameplate-data-properties.component.css'],
    standalone: false
})
export class NameplateDataPropertiesComponent implements OnInit {

  displayForm: boolean;
  nameplateDataOptions: NameplateDataOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.nameplateDataOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.nameplateDataOptions;
    this.displayForm = this.nameplateDataOptions.displayNameplateData;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayNameData();
    motorInventoryData.displayOptions.nameplateDataOptions = this.nameplateDataOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.nameplateDataOptions.manufacturer = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.model = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.motorType = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.enclosureType = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.ratedVoltage = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.serviceFactor = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.insulationClass = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.weight = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.numberOfPhases = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.fullLoadSpeed = this.nameplateDataOptions.displayNameplateData;
    this.nameplateDataOptions.fullLoadAmps = this.nameplateDataOptions.displayNameplateData;
    this.save();
  }

  checkDisplayNameData() {
    this.nameplateDataOptions.displayNameplateData = (
      this.nameplateDataOptions.manufacturer ||
      this.nameplateDataOptions.model ||
      this.nameplateDataOptions.motorType ||
      this.nameplateDataOptions.enclosureType ||
      this.nameplateDataOptions.ratedVoltage ||
      this.nameplateDataOptions.serviceFactor ||
      this.nameplateDataOptions.insulationClass ||
      this.nameplateDataOptions.weight ||
      this.nameplateDataOptions.numberOfPhases ||
      this.nameplateDataOptions.fullLoadSpeed ||
      this.nameplateDataOptions.fullLoadAmps
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('nameplate-data');
  }
}
