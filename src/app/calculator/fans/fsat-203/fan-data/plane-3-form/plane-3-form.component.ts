import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-plane-3-form',
  templateUrl: './plane-3-form.component.html',
  styleUrls: ['./plane-3-form.component.css']
})
export class Plane3FormComponent implements OnInit {
  @Input()
  pitotTubeData: PitotTubeData;
  @Output('showReadingsForm')
  showReadingsForm = new EventEmitter<PitotTubeData>();

  pitotDataForm: FormGroup;
  pressureReadings: Array<Array<number>>;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.pressureReadings = this.pitotTubeData.pressureReadings;
    this.pitotDataForm = this.getFormFromObj(this.pitotTubeData);
  }

  focusField() {
    //todo
  }

  save() {
    this.pitotTubeData = this.getObjFromForm(this.pitotDataForm);
    console.log(this.pitotDataForm.status);
  }

  getFormFromObj(obj: PitotTubeData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      tubeType: [obj.tubeType],
      tubeCoefficient: [obj.tubeCoefficient],
      traverseHoles: [obj.traverseHoles, [Validators.min(1), Validators.max(10)]],
      insertionPoints: [obj.insertionPoints, [Validators.min(1), Validators.max(10)]]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): PitotTubeData {
    let obj: PitotTubeData = {
      tubeType: form.controls.tubeType.value,
      tubeCoefficient: form.controls.tubeCoefficient.value,
      traverseHoles: form.controls.traverseHoles.value,
      insertionPoints: form.controls.insertionPoints.value,
      pressureReadings: this.pressureReadings
    }
    return obj;
  }

  showDataToggle(){
    this.save();
    this.showReadingsForm.emit(this.pitotTubeData);
  }

}


export interface PitotTubeData {
  tubeType: string,
  tubeCoefficient: number,
  traverseHoles: number,
  insertionPoints: number,
  pressureReadings:  Array<Array<number>>
}