import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plane } from '../../../../../../shared/models/fans';
import { FormGroup } from '@angular/forms';
import { PlaneDataFormService } from '../plane-data-form.service';

@Component({
  selector: 'app-plane-three-form',
  templateUrl: './plane-three-form.component.html',
  styleUrls: ['./plane-three-form.component.css']
})
export class PlaneThreeFormComponent implements OnInit {
  // @Input()
  // toggleResetData: boolean;
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
  constructor(private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.pitotDataForm = this.planeDataFormService.getTraversePlaneFormFromObj(this.planeData);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
  //     this.resetData();
  //   }
  // }

  // resetData() {
  //   this.pitotDataForm = this.planeDataFormService.getTraversePlaneFormFromObj(this.planeData);
  //   this.save();
  // }

  save() {
    this.planeData = this.planeDataFormService.getTraversePlaneObjFromForm(this.pitotDataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  // showDataToggle() {
  //   this.focusField('differentialReadings');
  //   this.showReadingsForm.emit(true);
  // }

  setCoefficient() {
    if (this.pitotDataForm.controls.pitotTubeType.value === 'Standard') {
      this.pitotDataForm.patchValue({
        pitotTubeCoefficient: 1
      });
    } else if (this.pitotDataForm.controls.pitotTubeType.value === 'S-Type') {
      this.pitotDataForm.patchValue({
        pitotTubeCoefficient: .86
      });
    }
    this.save();
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}
