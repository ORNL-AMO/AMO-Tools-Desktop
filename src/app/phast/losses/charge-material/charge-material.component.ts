import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {

  chargeMaterial: Array<any>;
  chargeMaterialType: string = 'Solid';

  constructor(private formBuilder: FormBuilder, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.chargeMaterial) {
      this.chargeMaterial = new Array();
    }
  }

  addMaterial() {
    let tmpSolidForm = this.initSolidForm();
    let tmpGasForm = this.initGasForm();
    let tmpLiquidForm = this.initLiquidForm();
    let tmpName = 'Material #' + (this.chargeMaterial.length + 1);
    this.chargeMaterial.push({
      solidForm: tmpSolidForm,
      liquidForm: tmpLiquidForm,
      gasForm: tmpGasForm,
      name: tmpName,
      baselineHeatRequired: 0.0,
      modifiedHeatRequired: 0.0
    });
  }

  removeMaterial(str: string) {
    this.chargeMaterial = _.remove(this.chargeMaterial, material => {
      return material.name != str;
    });
    this.renameMaterial();
  }

  renameMaterial() {
    let index = 1;
    this.chargeMaterial.forEach(material => {
      material.name = 'Material #' + index;
      index++;
    })
  }

  calculateBaseline(loss: any) {
    if (this.chargeMaterialType == 'Solid') {
      let reactionType = 0;
      debugger
      if (loss.solidForm.value.baselineEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.baselineHeatRequired = this.phastService.solidLoadChargeMaterial(
        reactionType,
        loss.solidForm.value.baselineMaterialSpecificHeatOfSolidMaterial,
        loss.solidForm.value.baselineMaterialLatentHeatOfFusion,
        loss.solidForm.value.baselineMaterialHeatOfLiquid,
        loss.solidForm.value.baselineMaterialLatentHeatOfFusion,
        loss.solidForm.value.baselineMaterialMeltingPoint,
        loss.solidForm.value.baselineFeedRate,
        loss.solidForm.value.baselineWaterContentAsCharged,
        loss.solidForm.value.baselineWaterContentAsDischarged,
        loss.solidForm.value.baselineInitialTemperature,
        loss.solidForm.value.baselineChargeMaterialDischargeTemperature,
        loss.solidForm.value.baselineWaterVaporDischargeTemperature,
        loss.solidForm.value.baselinePercentChargeMelted,
        loss.solidForm.value.baselinePercentChargeReacted,
        loss.solidForm.value.baselineAdditionalHeatRequired,

      );
    }
  }

  calculateModified(loss: any) {
    if (this.chargeMaterialType == 'Solid') {
      let reactionType = 0;
      if (loss.solidForm.value.modifiedEndothermicOrExothermic == 'Exothermic') {
        reactionType = 1;
      }
      loss.modifiedHeatRequired = this.phastService.solidLoadChargeMaterial(
        reactionType,
        loss.solidForm.value.modifiedMaterialSpecificHeatOfSolidMaterial,
        loss.solidForm.value.modifiedMaterialLatentHeatOfFusion,
        loss.solidForm.value.modifiedMaterialHeatOfLiquid,
        loss.solidForm.value.modifiedMaterialLatentHeatOfFusion,
        loss.solidForm.value.modifiedMaterialMeltingPoint,
        loss.solidForm.value.modifiedFeedRate,
        loss.solidForm.value.modifiedWaterContentAsCharged,
        loss.solidForm.value.modifiedWaterContentAsDischarged,
        loss.solidForm.value.modifiedInitialTemperature,
        loss.solidForm.value.modifiedChargeMaterialDischargeTemperature,
        loss.solidForm.value.modifiedWaterVaporDischargeTemperature,
        loss.solidForm.value.modifiedPercentChargeMelted,
        loss.solidForm.value.modifiedPercentChargeReacted,
        loss.solidForm.value.modifiedAdditionalHeatRequired,

      );
    }
  }

  initLiquidForm() {
    return this.formBuilder.group({

    })
  }

  initGasForm() {

  }


  initSolidForm() {
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'baselineMaterialName': ['', Validators.required],
      'baselineMaterialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'baselineMaterialLatentHeatOfFusion': ['', Validators.required],
      'baselineMaterialHeatOfLiquid': ['', Validators.required],
      'baselineMaterialMeltingPoint': ['', Validators.required],
      'baselineFeedRate': ['', Validators.required],
      'baselineWaterContentAsCharged': ['', Validators.required],
      'baselineWaterContentAsDischarged': ['', Validators.required],
      'baselineInitialTemperature': ['', Validators.required],
      'baselineChargeMaterialDischargeTemperature': ['', Validators.required],
      'baselineWaterVaporDischargeTemperature': ['', Validators.required],
      'baselinePercentChargeMelted': ['', Validators.required],
      'baselinePercentChargeReacted': ['', Validators.required],
      'baselineHeatOfReaction': ['', Validators.required],
      'baselineEndothermicOrExothermic': ['', Validators.required],
      'baselineAdditionalHeatRequired': ['', Validators.required],

      'modifiedMaterialName': ['', Validators.required],
      'modifiedMaterialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'modifiedMaterialLatentHeatOfFusion': ['', Validators.required],
      'modifiedMaterialHeatOfLiquid': ['', Validators.required],
      'modifiedMaterialMeltingPoint': ['', Validators.required],
      'modifiedFeedRate': ['', Validators.required],
      'modifiedWaterContentAsCharged': ['', Validators.required],
      'modifiedWaterContentAsDischarged': ['', Validators.required],
      'modifiedInitialTemperature': ['', Validators.required],
      'modifiedChargeMaterialDischargeTemperature': ['', Validators.required],
      'modifiedWaterVaporDischargeTemperature': ['', Validators.required],
      'modifiedPercentChargeMelted': ['', Validators.required],
      'modifiedPercentChargeReacted': ['', Validators.required],
      'modifiedHeatOfReaction': ['', Validators.required],
      'modifiedEndothermicOrExothermic': ['', Validators.required],
      'modifiedAdditionalHeatRequired': ['', Validators.required],
    })
  }


}
