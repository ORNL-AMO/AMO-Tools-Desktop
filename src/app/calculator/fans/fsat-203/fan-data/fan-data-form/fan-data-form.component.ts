import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Plane } from '../../../../../shared/models/fans';
import { Fsat203Service } from '../../fsat-203.service';

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
  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.dataForm = this.fsat203Service.getPlaneFormFromObj(this.planeData);
  }

  save(){
    this.planeData = this.fsat203Service.getPlaneObjFromForm(this.dataForm, this.planeData);
    this.emitSave.emit(this.planeData);
  }

  focusField(){
    //todo
  }
}
