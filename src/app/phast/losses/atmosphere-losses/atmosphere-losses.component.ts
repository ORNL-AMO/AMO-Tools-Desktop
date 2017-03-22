import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-atmosphere-losses',
  templateUrl: './atmosphere-losses.component.html',
  styleUrls: ['./atmosphere-losses.component.css']
})
export class AtmosphereLossesComponent implements OnInit {
  atmosphereLosses: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(!this.atmosphereLosses){
      this.atmosphereLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.atmosphereLosses.length + 1);
    this.atmosphereLosses.push({ 
      form: tmpForm, 
      name: tmpName 
    });
  }

  removeLoss(str: string) {
    this.atmosphereLosses = _.remove(this.atmosphereLosses, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.atmosphereLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  initForm(){

    return this.formBuilder.group({
      'baselineAtmosphereGas': ['',],
      'baselineSpecificHeat': [''],
      'baselineInitialTemp': [''],
      'baselineFinalTemp': [''],
      'baselineFlowRate': [''],
      'baselineCorrectionFactor': [''],
      'baselineHeatLoss': [{value:'', disabled: true}],
      'modifiedSpecificHeat': [''],
      'modifiedInitialTemp': [''],
      'modifiedFinalTemp': [''],
      'modofiedFlowRate': [''],
      'modifiedCorrectionFactor': [''],
      'modifiedHeatLoss': [{value:'', disabled: true}]
    })
  }

}
