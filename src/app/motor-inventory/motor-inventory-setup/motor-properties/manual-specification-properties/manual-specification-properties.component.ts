import { Component, OnInit } from '@angular/core';
import { ManualSpecificationOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-manual-specification-properties',
    templateUrl: './manual-specification-properties.component.html',
    styleUrls: ['./manual-specification-properties.component.css'],
    standalone: false
})
export class ManualSpecificationPropertiesComponent implements OnInit {


  displayForm: boolean;
  manualSpecificationOptions: ManualSpecificationOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.manualSpecificationOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.manualSpecificationOptions;
    this.displayForm = this.manualSpecificationOptions.displayManualSpecifications;
  }

  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    this.checkDisplayManualSpecifications();
    motorInventoryData.displayOptions.manualSpecificationOptions = this.manualSpecificationOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.manualSpecificationOptions.ratedSpeed = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.frame = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.shaftPosiion = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.windingResistance = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.rotorBars = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.statorSlots = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.ampsLockedRotor = this.manualSpecificationOptions.displayManualSpecifications;
     this.manualSpecificationOptions.poles = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.currentType = this.manualSpecificationOptions.displayManualSpecifications;
    this.save();
  }

  checkDisplayManualSpecifications() {
    this.manualSpecificationOptions.displayManualSpecifications = (
      this.manualSpecificationOptions.frame ||
      this.manualSpecificationOptions.shaftPosiion ||
      this.manualSpecificationOptions.windingResistance ||
      this.manualSpecificationOptions.rotorBars ||
      this.manualSpecificationOptions.statorSlots ||
      this.manualSpecificationOptions.ampsLockedRotor ||
      this.manualSpecificationOptions.poles ||
      this.manualSpecificationOptions.currentType || 
      this.manualSpecificationOptions.ratedSpeed
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.motorInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.motorInventoryService.focusedDataGroup.next('manual-specifications');
  }
}
