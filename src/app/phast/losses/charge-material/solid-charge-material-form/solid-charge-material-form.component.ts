import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-solid-charge-material-form',
  templateUrl: './solid-charge-material-form.component.html',
  styleUrls: ['./solid-charge-material-form.component.css']
})
export class SolidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
  @Output('calculateBaseline')
  calculateBaseline = new EventEmitter<boolean>();
  @Output('calculateModified')
  calculateModified = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkBaseline() {
    this.lossState.saved = false;
    // if (
    //   this.chargeMaterialForm.controls.baselineMaterialName.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialSpecificHeatOfSolidMaterial.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialLatentHeatOfFusion.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialHeatOfLiquid.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineMaterialMeltingPoint.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineWaterContentAsCharged.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineWaterContentAsDischarged.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineChargeMaterialDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineWaterVaporDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselinePercentChargeMelted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselinePercentChargeReacted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineHeatOfReaction.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineEndothermicOrExothermic.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineAdditionalHeatRequired.status == 'VALID'
    // ) {
    //   this.calculateBaseline.emit(true);
    //}
  }

  checkModified() {
    this.lossState.saved = false;
    // if (
    //   this.chargeMaterialForm.controls.modifiedMaterialName.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialSpecificHeatOfSolidMaterial.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialLatentHeatOfFusion.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialHeatOfLiquid.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedMaterialMeltingPoint.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedWaterContentAsCharged.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedWaterContentAsDischarged.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedChargeMaterialDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedWaterVaporDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedPercentChargeMelted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedPercentChargeReacted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedHeatOfReaction.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedEndothermicOrExothermic.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedAdditionalHeatRequired.status == 'VALID'
    // ){
    //   this.calculateModified.emit(true);
    // }
  }

}
