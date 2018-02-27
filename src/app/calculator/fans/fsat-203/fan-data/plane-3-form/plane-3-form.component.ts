import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaneData, Plane } from '../../../../../shared/models/fan-copy';
@Component({
  selector: 'app-plane-3-form',
  templateUrl: './plane-3-form.component.html',
  styleUrls: ['./plane-3-form.component.css']
})
export class Plane3FormComponent implements OnInit {
  @Input()
  fanData: Plane;
  @Output('showReadingsForm')
  showReadingsForm = new EventEmitter<Plane>();

  pitotDataForm: FormGroup;
  pressureReadings: Array<Array<number>>;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.pressureReadings = this.fanData.traverseData;
    this.pitotDataForm = this.getFormFromObj(this.fanData);
  }

  focusField() {
    //todo
  }

  save() {
    //this.planeData = this.getObjFromForm(this.pitotDataForm);
    //console.log(this.pitotDataForm.status);
  }

  getFormFromObj(obj: Plane): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      pitotTubeType: [obj.pitotTubeType],
      pitotTubeCoefficient: [obj.pitotTubeCoefficient],
      numTraverseHoles: [obj.numTraverseHoles, [Validators.min(1), Validators.max(10)]],
      numInsertionPoints: [obj.numInsertionPoints, [Validators.min(1), Validators.max(10)]]
    })
    return form;
  }

  getObjFromForm(form: FormGroup): Plane {
    this.fanData.pitotTubeType = form.controls.tubeType.value;
    this.fanData.pitotTubeCoefficient = form.controls.pitotTubeCoefficient.value;
    this.fanData.numTraverseHoles = form.controls.numTraverseHoles.value;
    this.fanData.numInsertionPoints = form.controls.numInsertionPoints.value;
    return this.fanData;
  }

  showDataToggle() {
    this.save();
    this.showReadingsForm.emit(this.fanData);
  }
}