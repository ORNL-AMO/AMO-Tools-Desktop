import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-water-cooling-losses',
  templateUrl: './water-cooling-losses.component.html',
  styleUrls: ['./water-cooling-losses.component.css']
})
export class WaterCoolingLossesComponent implements OnInit {

  coolingLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.coolingLosses) {
      this.coolingLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.coolingLosses.length + 1);
    this.coolingLosses.push({ 
      form: tmpForm, 
      name: tmpName,
      baselineHeatLoss: 0.0,
      modifiedHeatLoss: 0.0
    });
  }

  removeLoss(str: string) {
    this.coolingLosses = _.remove(this.coolingLosses, loss => {
      return loss.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.coolingLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  initForm() {
    return this.formBuilder.group({
      'baselineCoolingMedium': [''],
      'baselineAvgSpecificHeat': [''],
      'baselineDensity': [''],
      'baselineFlow': [''],
      'baselineInletTemp': [''],
      'baselineOutletTemp': [''],
      'baselineHeatRequired': [{value: '', disabled: true}],
      'baselineCorrectionFactor': [''],
      'baselineHeatLoss': [{value: '', disabled: true}],
      'modifiedCoolingMedium': [''],
      'modifiedAvgSpecificHeat': [''],
      'modifiedDensity': [''],
      'modifiedFlow': [''],
      'modifiedInletTemp': [''],
      'modifiedOutletTemp': [''],
      'modifiedHeatRequired': [{value: '', disabled: true}],
      'modifiedCorrectionFactor': [''],
      'modifiedHeatLoss': [{value: '', disabled: true}]
    })
  }

  calculateBaseline(loss: any){
    //TODO: call phast to calculate baseline
    //loss.baselineHeatLoss = this.phastService.waterCoolingLosses()
  }

  calculateModified(loss: any){
    //TODO: call phast to calculate modified
  }
}
