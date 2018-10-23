import { Component, OnInit, Input, ViewChild, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaneData, Plane } from '../../../../../shared/models/fans';
import { Fsat203Service } from '../../fsat-203.service';
@Component({
  selector: 'app-plane-3-form',
  templateUrl: './plane-3-form.component.html',
  styleUrls: ['./plane-3-form.component.css']
})
export class Plane3FormComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
  @Input()
  planeData: Plane;
  @Output('showReadingsForm')
  showReadingsForm = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<Plane>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  pitotDataForm: FormGroup;
  pressureReadings: Array<Array<number>>;
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.pitotDataForm = this.fsat203Service.getTraversePlaneFormFromObj(this.planeData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.resetData();
    }
  }

  resetData() {
    this.pitotDataForm = this.fsat203Service.getTraversePlaneFormFromObj(this.planeData);
    this.save();
  }

  save() {
    this.planeData = this.fsat203Service.getTraversePlaneObjFromForm(this.pitotDataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  showDataToggle() {
    this.focusField('differentialReadings')
    this.showReadingsForm.emit(true);
  }

  setCoefficient() {
    if (this.pitotDataForm.controls.pitotTubeType.value == 'Standard') {
      this.pitotDataForm.patchValue({
        pitotTubeCoefficient: 1
      })
    } else if (this.pitotDataForm.controls.pitotTubeType.value == 'S-Type') {
      this.pitotDataForm.patchValue({
        pitotTubeCoefficient: .86
      })
    }
    this.save();
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}