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

  constructor(private formBuilder: FormBuilder) { }

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

  calculateBaseline() {
    console.log('calculate baseline');
  }

  calculateModified() {
    console.log('calculate modified');
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
