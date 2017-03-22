import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-gas-charge-material-form',
  templateUrl: './gas-charge-material-form.component.html',
  styleUrls: ['./gas-charge-material-form.component.css']
})
export class GasChargeMaterialFormComponent implements OnInit {
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
    //   this.chargeMaterialForm.controls.baselineMaterialSpecificHeat.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineVaporInGas.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineSpecificHeatOfVapor.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.baselineGasReacted.status == 'VALID' &&
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
    //   this.chargeMaterialForm.controls.modifiedMaterialSpecificHeat.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedFeedRate.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedVaporInGas.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedInitialTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedDischargeTemperature.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedSpecificHeatOfVapor.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedGasReacted.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedHeatOfReaction.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedEndothermicOrExothermic.status == 'VALID' &&
    //   this.chargeMaterialForm.controls.modifiedAdditionalHeatRequired.status == 'VALID'
    // ) {
    //   this.calculateModified.emit(true);
    // }
  }

}
