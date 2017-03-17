import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
@Component({
  selector: 'app-wall-losses',
  templateUrl: './wall-losses.component.html',
  styleUrls: ['./wall-losses.component.css']
})
export class WallLossesComponent implements OnInit {

  wallLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.wallLosses) {
      this.wallLosses = new Array();
    }
  }

  initForm() {
    return this.formBuilder.group({
      'baselineSurfaceArea': ['', Validators.required],
      'baselineAvgSurfaceTemp': ['', Validators.required],
      'baselineAmbientTemp': ['', Validators.required],
      'baselineCorrectionFactor': ['', Validators.required],
      'baselineHeatRequired': [{ value: '', disabled: true }],
      'modifiedSurfaceArea': ['', Validators.required],
      'modifiedAvgSurfaceTemp': ['', Validators.required],
      'modifiedAmbientTemp': ['', Validators.required],
      'modifiedCorrectionFactor': ['', Validators.required],
      'modifiedHeatRequired': [{ value: '', disabled: true }],
    })
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.wallLosses.length + 1);
    this.wallLosses.push({ form: tmpForm, name: tmpName });
  }

  removeLoss(str: string) {
    this.wallLosses = _.remove(this.wallLosses, loss => {
      return loss.name != str;
    });
    this.renameLossess();
  }

  renameLossess() {
    let index = 1;
    this.wallLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculateModified(loss: any){
    loss.form.value.modifiedHeatRequired = this.phastService.wallLosses(
      loss.form.value.modifiedSurfaceArea,
      loss.form.value.modifiedAmbientTemp,
      loss.form.value.modifiedAvgSurfaceTemp,
      0,0,0,
      loss.form.value.modifiedCorrectionFactor
    );
  }

  calculateBaseline(loss:any){
      loss.form.value.baselineHeatRequired = this.phastService.wallLosses(
      loss.form.value.baselineSurfaceArea,
      loss.form.value.baselineAmbientTemp,
      loss.form.value.baselineAvgSurfaceTemp,
      0,0,0,
      loss.form.value.baselineCorrectionFactor
    );
  }
}
