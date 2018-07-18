import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Plane } from '../../../../../shared/models/fans';
import { Fsat203Service } from '../../fsat-203.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  planeData: Plane;
  @Input()
  planeNum: string;
  @Input()
  planeDescription: string;
  @Output('emitSave')
  emitSave = new EventEmitter<Plane>();
  @Input()
  velocityData: { pv3: number, percent75Rule: number };
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();


  dataForm: FormGroup;
  constructor(private fsat203Service: Fsat203Service, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.dataForm = this.fsat203Service.getPlaneFormFromObj(this.planeData, this.settings);
    this.calcArea();
  }

  calcArea() {
    let tmpData = this.fsat203Service.getPlaneObjFromForm(this.dataForm, this.planeData);
    if (tmpData.planeType == 'Rectangular') {
      let tmpArea = tmpData.length * tmpData.width;
      if (tmpData.numInletBoxes) {
        tmpArea = tmpArea * tmpData.numInletBoxes
      }
      tmpArea = this.convertUnitsService.value(tmpArea).from('in2').to('ft2');
      this.dataForm.patchValue({
        'area': tmpArea
      })
    } else if (tmpData.planeType == 'Circular') {
      let tmpArea = (Math.PI / 4) * (tmpData.length * tmpData.length);
      if (tmpData.numInletBoxes) {
        tmpArea = tmpArea * tmpData.numInletBoxes
      }
      tmpArea = this.convertUnitsService.value(tmpArea).from('in2').to('ft2');
      this.dataForm.patchValue({
        'area': tmpArea
      })
    }
    this.save();
  }


  convertArea(area: number): number {
    if (this.settings.fanFlowRate == 'ft3/min') {
      return this.convertUnitsService.value(area).from('in2').to('ft2');
    } else if (this.settings.fanFlowRate == 'm3/s') {
      return this.convertUnitsService.value(area).from('mm2').to('m2');
    }
  }
  save() {
    this.planeData = this.fsat203Service.getPlaneObjFromForm(this.dataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
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
