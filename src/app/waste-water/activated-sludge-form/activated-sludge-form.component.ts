import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WasteWater } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { ActivatedSludgeFormService } from './activated-sludge-form.service';

@Component({
  selector: 'app-activated-sludge-form',
  templateUrl: './activated-sludge-form.component.html',
  styleUrls: ['./activated-sludge-form.component.css']
})
export class ActivatedSludgeFormComponent implements OnInit {
  @Input()
  isBaseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  form: FormGroup;
  constructor(private wasteWaterService: WasteWaterService, private activatedSludgeFormService: ActivatedSludgeFormService) { }

  ngOnInit(): void {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    //TODO: Baseline/modification
    // if(this.isBaseline){

    // }else{
    //   //TODO: Modification Logic
    // }
  }

  save() {


    //TODO: Baseline/modification
    // if(this.isBaseline){

    // }else{
    //   //TODO: Modification Logic
    // }
  }

  focusField(str: string){

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
