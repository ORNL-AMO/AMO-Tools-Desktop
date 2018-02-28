import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Plane } from '../../../../../shared/models/fans';
import { Fsat203Service } from '../../fsat-203.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';

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
  dataForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.dataForm = this.fsat203Service.getPlaneFormFromObj(this.planeData);
    this.calcArea();
  }

  calcArea(){
    let tmpData = this.fsat203Service.getPlaneObjFromForm(this.dataForm, this.planeData);
    if(tmpData.planeType == 'Rectangular'){
      let tmpArea = tmpData.length * tmpData.width;
      if(tmpData.numInletBoxes){
        tmpArea = tmpArea*tmpData.numInletBoxes
      }
      tmpArea = this.convertUnitsService.value(tmpArea).from('in').to('ft');
      this.dataForm.patchValue({
        'area': tmpArea
      })
    }else if(tmpData.planeType == 'Circular'){
      let tmpArea = (Math.PI / 4) * (tmpData.length * tmpData.length);
      if(tmpData.numInletBoxes){
        tmpArea = tmpArea*tmpData.numInletBoxes
      }
      tmpArea = this.convertUnitsService.value(tmpArea).from('in').to('ft');
      this.dataForm.patchValue({
        'area': tmpArea
      })
    }
    this.save();
  }

  save(){
    this.planeData = this.fsat203Service.getPlaneObjFromForm(this.dataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  focusField(){
    //todo
  }
}
