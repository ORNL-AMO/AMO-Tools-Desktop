import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {

  chargeMaterial: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(!this.chargeMaterial){
      this.chargeMaterial = new Array();
    }
  }

  addMaterial() {
    let tmpForm = this.initForm();
    let tmpName = 'Material #' + (this.chargeMaterial.length + 1);
    this.chargeMaterial.push({ form: tmpForm, name: tmpName });
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

  initForm(){
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'type': [''],
      'baselineMaterial': [''],
      'baselineChargeFeedRate': [''],
      'baselineWaterContentCharged': [''],
      'baselineWaterContentDischarged': [''],
      'baselineInitialTemp': [''],
      'baselineWaterDischargeTemp': [''],
      'baselineDischargeTemp': [''],
      'baselineChargeMelted': [''],
      'baselineChargeReacted': [''],
      'baselineHeatOfReaction': [''],
      'baselineAdditionalHeatRequired': [''],
      'baselineHeatRequired': [{value:'', disabled: true}],
      'modifiedMaterial': [''],
      'modifiedChargeFeedRate': [''],
      'modifiedWaterContentCharged': [''],
      'modifiedWaterContentDischarged': [''],
      'modifiedInitialTemp': [''],
      'modifiedWaterDischargeTemp': [''],
      'modifiedDischargeTemp': [''],
      'modifiedChargeMelted': [''],
      'modifiedChargeReacted': [''],
      'modifiedHeatOfReaction': [''],
      'modifiedAdditionalHeatRequired': [''],
      'modifiedHeatRequired': [{value:'', disabled: true}]
    })
  }

}
