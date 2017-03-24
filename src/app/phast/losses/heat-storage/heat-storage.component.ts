import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-heat-storage',
  templateUrl: './heat-storage.component.html',
  styleUrls: ['./heat-storage.component.css']
})
export class HeatStorageComponent implements OnInit {
  heatStorage: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(){
    if(!this.heatStorage){
      this.heatStorage = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.heatStorage.length + 1);
    this.heatStorage.push({ form: tmpForm, name: tmpName });
  }

  removeLoss(str: string) {
    this.heatStorage = _.remove(this.heatStorage, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.heatStorage.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  initForm(){
    return this.formBuilder.group({
      'baselineShape': [''],
      'baselineArea': [''],
      'baselineFurnaceTemp': [''],
      'baselineAmbientTemp': [''],
      'baselineStartingWallTemp': [''],
      'baselineCorrectionFactor': [''],
      'baselineHeatRequired': [{value:'', disabled: true}],

      'modifiedShape': [''],
      'modifiedArea': [''],
      'modifiedFurnaceTemp': [''],
      'modifiedAmbientTemp': [''],
      'modifiedStartingWallTemp': [''],
      'modifiedCorrectionFactor': [''],
      'modifiedHeatRequired': [{value:'', disabled: true}]
    })
  }
}
