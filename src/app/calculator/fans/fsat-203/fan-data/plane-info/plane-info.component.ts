import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Fsat203Service } from '../../fsat-203.service';
import { FormGroup } from '@angular/forms';
import { PlaneData } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-plane-info',
  templateUrl: './plane-info.component.html',
  styleUrls: ['./plane-info.component.css']
})
export class PlaneInfoComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
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
  constructor(private fsat203Service: Fsat203Service, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.getSum(this.planeData);
    this.planeInfoForm = this.fsat203Service.getPlaneInfoFormFromObj(this.planeData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.resetData();
    }
  }

  resetData() {
    this.getSum(this.planeData);
    this.planeInfoForm = this.fsat203Service.getPlaneInfoFormFromObj(this.planeData);
    this.save();
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  getSum(planeData: PlaneData) {
    this.sumSEF = planeData.inletSEF + planeData.outletSEF;
  }
  save() {
    this.planeData = this.fsat203Service.getPlaneInfoObjFromForm(this.planeInfoForm, this.planeData);
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
