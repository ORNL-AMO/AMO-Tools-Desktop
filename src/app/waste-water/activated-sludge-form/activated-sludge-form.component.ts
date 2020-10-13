import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedSludgeData, WasteWater } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { ActivatedSludgeFormService } from './activated-sludge-form.service';

@Component({
  selector: 'app-activated-sludge-form',
  templateUrl: './activated-sludge-form.component.html',
  styleUrls: ['./activated-sludge-form.component.css']
})
export class ActivatedSludgeFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  form: FormGroup;
  constructor(private wasteWaterService: WasteWaterService, private activatedSludgeFormService: ActivatedSludgeFormService) { }

  ngOnInit(): void {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      //add logic when selecte mod index added
      // this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    } else {
      this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    }
  }

  save() {
    if (this.isModification) {
      //add logic when selecte mod index added
      // this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    } else {
      let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.form);
      let wastWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      wastWater.baselineData.activatedSludgeData = activatedSludgeData;
      this.wasteWaterService.wasteWater.next(wastWater);
    }
  }

  focusField(str: string) {

  }

  isTemperatureDifferent() {

  }
  isSoDifferent() {

  }
  isVolumeDifferent() {

  }
  isFlowRateDifferent() {

  }
  isInertVSSDifferent() {

  }
  isOxidizableNDifferent() {

  }
  isBiomassDifferent() {

  }
  isInfluentTSSDifferent() {

  }
  isInertInOrgTSSDifferent() {

  }
  isEffluentTSSDifferent() {

  }
  isRASTSSDifferent() {

  }
  isMLSSparDifferent() {

  }
  isFractionBiomassDifferent() {

  }
  isBiomassYeildDifferent() {

  }
  isHalfSaturationDifferent() {

  }
  isMicrobialDecayDifferent() {

  }
  isMaxUtilizationRateDifferent() {

  }
}
