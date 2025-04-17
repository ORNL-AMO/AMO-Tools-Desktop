import { Component, OnInit } from '@angular/core';
import { MotorInventoryData, LoadCharacteristicOptions } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-load-characteristic-properties',
    templateUrl: './load-characteristic-properties.component.html',
    styleUrls: ['./load-characteristic-properties.component.css'],
    standalone: false
})
export class LoadCharacteristicPropertiesComponent implements OnInit {

  loadCharacteristicOptions: LoadCharacteristicOptions;
  displayForm: boolean;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.loadCharacteristicOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.loadCharactersticOptions;
    this.displayForm = this.loadCharacteristicOptions.displayLoadCharacteristics;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayLoadCharacteristics();
    motorInventoryData.displayOptions.loadCharactersticOptions = this.loadCharacteristicOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.loadCharacteristicOptions.efficiency75 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.efficiency50 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.efficiency25 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.powerFactor100 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.powerFactor75 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.powerFactor50 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.powerFactor25 = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.loadCharacteristicOptions.ampsIdle = this.loadCharacteristicOptions.displayLoadCharacteristics;
    this.save();
  }

  checkDisplayLoadCharacteristics() {
    this.loadCharacteristicOptions.displayLoadCharacteristics = (
      this.loadCharacteristicOptions.efficiency75 ||
      this.loadCharacteristicOptions.efficiency50 ||
      this.loadCharacteristicOptions.efficiency25 ||
      this.loadCharacteristicOptions.powerFactor100 ||
      this.loadCharacteristicOptions.powerFactor75 ||
      this.loadCharacteristicOptions.powerFactor50 ||
      this.loadCharacteristicOptions.powerFactor25 ||
      this.loadCharacteristicOptions.ampsIdle
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('load-characteristics');
  }
}
