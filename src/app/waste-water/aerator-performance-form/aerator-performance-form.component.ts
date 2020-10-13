import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AeratorPerformanceData, WasteWater } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { AeratorPerformanceFormService } from './aerator-performance-form.service';

@Component({
  selector: 'app-aerator-performance-form',
  templateUrl: './aerator-performance-form.component.html',
  styleUrls: ['./aerator-performance-form.component.css']
})
export class AeratorPerformanceFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  //aerator types
  areatorTypes: Array<{ value: number, display: string }> = [
    {
      value: 1,
      display: 'Mechanical Aerator'
    },
    {
      value: 2,
      display: 'Positive Displacement Blower'
    },
    {
      value: 3,
      display: 'Centrifugal Blowers'
    }
  ]

  form: FormGroup;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService) { }

  ngOnInit(): void {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      //add logic when selecte mod index added
      // this.form = this.aeratorPerformanceFormService.getFormFromObj(wasteWater.baselineData.aeratorPerformanceData);
    } else {
      this.form = this.aeratorPerformanceFormService.getFormFromObj(wasteWater.baselineData.aeratorPerformanceData);
    }
  }

  save() {
    if (this.isModification) {
      //add logic when selecte mod index added
      // this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    } else {
      let aeratorPerformanceData: AeratorPerformanceData = this.aeratorPerformanceFormService.getObjFromForm(this.form);
      let wastWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      wastWater.baselineData.aeratorPerformanceData = aeratorPerformanceData;
      this.wasteWaterService.wasteWater.next(wastWater);
    }
  }

  focusField(str: string) {

  }
  isOperatingDODifferent() { }
  isAlphaDifferent() { }
  isBetaDifferent() { }
  isSOTRDifferent() { }
  isAerationDifferent() { }
  isElevationDifferent() { }
  isOperatingTimeDifferent() { }
  isTypeAeratorsDifferent() { }
  isSpeedDifferent() { }
  isEnergyCostUnitDifferent() { }







}
