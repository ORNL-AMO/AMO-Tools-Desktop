import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-liquid-charge-material-form',
  templateUrl: './liquid-charge-material-form.component.html',
  styleUrls: ['./liquid-charge-material-form.component.css']
})
export class LiquidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
  @Output('calculateBaseline')
  calculateBaseline = new EventEmitter<boolean>();
  @Output('calculateModified')
  calculateModified = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  checkBaseline() {
    // if (
    //   this.chargeMaterialForm.controls.baselineMaterialName.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialSpecificHeatLiquid.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialVaporizingTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialLatentHeat.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialSpecificHeatVapor.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineLiquidVaporized.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineLiquidReacted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineHeatOfReaction.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineEndothermicOrExothermic.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineAdditionalHeatRequired.status == 'VALID'
    // ) {
    //   this.calculateBaseline.emit(true);
    // }
  }

  checkModified() {
    // if (
    //   this.chargeMaterialForm.controls.modifiedMaterialName.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialSpecificHeatLiquid.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialVaporizingTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialLatentHeat.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialSpecificHeatVapor.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedLiquidVaporized.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedLiquidReacted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedHeatOfReaction.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedEndothermicOrExothermic.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedAdditionalHeatRequired.status == 'VALID'
    // ) {
    //   this.calculateModified.emit(true);
    // }
  }

}
