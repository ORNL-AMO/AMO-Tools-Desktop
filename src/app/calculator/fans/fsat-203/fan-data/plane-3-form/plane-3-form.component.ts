import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-plane-3-form',
  templateUrl: './plane-3-form.component.html',
  styleUrls: ['./plane-3-form.component.css']
})
export class Plane3FormComponent implements OnInit {
  @Input()
  pitotTubeData: PitotTubeData;
  @Output('showReadingsForm')
  showReadingsForm = new EventEmitter();

  pitotDataForm: FormGroup;
  pressureReadings: Array<number>;
  traverseHoles: Array<Array<number>>;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.traverseHoles =
      [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        [11, 22, 33, 44, 5]
      ];
    this.pressureReadings = this.pitotTubeData.pressureReadings;
    this.pitotDataForm = this.getFormFromObj(this.pitotTubeData);
  }

  focusField() {
    //todo
  }

  save() {

  }

  getFormFromObj(obj: PitotTubeData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      tubeType: [obj.tubeType],
      tubeCoefficient: [obj.tubeCoefficient],
      traverseHoles: [obj.traverseHoles],
      insertionPoints: [obj.insertionPoints]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): PitotTubeData {
    let obj: PitotTubeData = {
      tubeType: form.controls.tubeType.value,
      tubeCoefficient: form.controls.tubeType.value,
      traverseHoles: form.controls.tubeType.value,
      insertionPoints: form.controls.tubeType.value,
      pressureReadings: this.pressureReadings
    }
    return obj;
  }

  showDataToggle(){
    this.showReadingsForm.emit(true);
  }

}


export interface PitotTubeData {
  tubeType: string,
  tubeCoefficient: number,
  traverseHoles: number,
  insertionPoints: number
  pressureReadings: Array<number>
}