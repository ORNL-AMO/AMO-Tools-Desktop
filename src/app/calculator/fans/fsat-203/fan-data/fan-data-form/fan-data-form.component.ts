import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  fanData: FanData;

  dataForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.dataForm = this.getFormFromObj(this.fanData);
  }

  getFormFromObj(obj: FanData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      shape: [obj.shape],
      length: [obj.length],
      width: [obj.width],
      area: [obj.area],
      staticPressure: [obj.staticPressure],
      dryBulbTemp: [obj.dryBulbTemp],
      barometricPressure: [obj.barometricPressure],
      numInletBoxes: [obj.numInletBoxes]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanData {
    let obj: FanData = {
      planeNum: this.fanData.planeNum,
      planeDescription: this.fanData.planeDescription,
      shape: form.controls.shape.value,
      length: form.controls.length.value,
      width: form.controls.width.value,
      area: form.controls.area.value,
      staticPressure: form.controls.staticPressure.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      barometricPressure: form.controls.barometricPressure.value,
      numInletBoxes: form.controls.numInletBoxes.value
    }
    return obj;
  }

  save(){
    //todo
  }

  focusField(){
    //todo
  }
}


export interface FanData {
  planeNum: string,
  planeDescription: string,
  shape: string,
  length: number,
  width: number,
  area: number,
  staticPressure: number,
  dryBulbTemp: number,
  barometricPressure: number,
  numInletBoxes: number
}