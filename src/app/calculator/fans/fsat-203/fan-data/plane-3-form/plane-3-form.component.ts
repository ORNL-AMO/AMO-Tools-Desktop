import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaneData, Plane } from '../../../../../shared/models/fan-copy';
import { Fsat203Service } from '../../fsat-203.service';
@Component({
  selector: 'app-plane-3-form',
  templateUrl: './plane-3-form.component.html',
  styleUrls: ['./plane-3-form.component.css']
})
export class Plane3FormComponent implements OnInit {
  @Input()
  planeData: Plane;
  @Output('showReadingsForm')
  showReadingsForm = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<Plane>();
  
  pitotDataForm: FormGroup;
  pressureReadings: Array<Array<number>>;
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.pressureReadings = this.planeData.traverseData;
    this.pitotDataForm = this.fsat203Service.getTraversePlaneFormFromObj(this.planeData);
  }

  focusField() {
    //todo
  }

  save() {
    this.planeData = this.fsat203Service.getTraversePlaneObjFromForm(this.pitotDataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  showDataToggle() {
    this.showReadingsForm.emit(true);
  }
}