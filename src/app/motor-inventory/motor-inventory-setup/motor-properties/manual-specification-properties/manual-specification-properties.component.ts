import { Component, OnInit } from '@angular/core';
import { ManualSpecificationOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-manual-specification-properties',
  templateUrl: './manual-specification-properties.component.html',
  styleUrls: ['./manual-specification-properties.component.css']
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
    this.manualSpecificationOptions.frameNumber = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.uFrame = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.cFace = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.verticalShaft = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.dFlange = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.windingResistance = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.rotorBars = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.statorSlots = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.ampsLockedRotor = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.stalledRotorTimeHot = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.stalledRotorTimeCold = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.poles = this.manualSpecificationOptions.displayManualSpecifications;
    this.manualSpecificationOptions.currentType = this.manualSpecificationOptions.displayManualSpecifications;
    this.save();
  }

  checkDisplayManualSpecifications() {
    this.manualSpecificationOptions.displayManualSpecifications = (
      this.manualSpecificationOptions.frameNumber ||
      this.manualSpecificationOptions.uFrame ||
      this.manualSpecificationOptions.cFace ||
      this.manualSpecificationOptions.verticalShaft ||
      this.manualSpecificationOptions.dFlange ||
      this.manualSpecificationOptions.windingResistance ||
      this.manualSpecificationOptions.rotorBars ||
      this.manualSpecificationOptions.statorSlots ||
      this.manualSpecificationOptions.ampsLockedRotor ||
      this.manualSpecificationOptions.stalledRotorTimeHot ||
      this.manualSpecificationOptions.stalledRotorTimeCold ||
      this.manualSpecificationOptions.poles ||
      this.manualSpecificationOptions.currentType
    );
  }
}
