import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PlaneData } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { PlaneDataFormService } from '../plane-data-form.service';

@Component({
  selector: 'app-plane-info-form',
  templateUrl: './plane-info-form.component.html',
  styleUrls: ['./plane-info-form.component.css']
})
export class PlaneInfoFormComponent implements OnInit {
  @Input()
  planeData: PlaneData;
  @Output('emitSave')
  emitSave = new EventEmitter<PlaneData>();
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  planeInfoForm: FormGroup;
  sumSEF: number;
  constructor(private planeDataFormService: PlaneDataFormService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.getSum(this.planeData);
    this.planeInfoForm = this.planeDataFormService.getPlaneInfoFormFromObj(this.planeData);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
  //     this.resetData();
  //   }
  // }

  // resetData() {
  //   this.getSum(this.planeData);
  //   this.planeInfoForm = this.fsat203Service.getPlaneInfoFormFromObj(this.planeData);
  //   this.save();
  // }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  getSum(planeData: PlaneData) {
    this.sumSEF = planeData.inletSEF + planeData.outletSEF;
  }
  save() {
    this.planeData = this.planeDataFormService.getPlaneInfoObjFromForm(this.planeInfoForm, this.planeData);
    this.getSum(this.planeData);
    this.emitSave.emit(this.planeData);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
