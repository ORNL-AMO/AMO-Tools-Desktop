import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FanShaftPower } from '../../../../shared/models/fans';
import { Fsat203Service } from '../fsat-203.service';

@Component({
  selector: 'app-fan-shaft-power',
  templateUrl: './fan-shaft-power.component.html',
  styleUrls: ['./fan-shaft-power.component.css']
})
export class FanShaftPowerComponent implements OnInit {
  @Input()
  fanShaftPower: FanShaftPower;
  @Input()
  shaftPowerDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FanShaftPower>();
  shaftPowerForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.shaftPowerForm = this.fsat203Service.getShaftPowerFormFromObj(this.fanShaftPower);
  }

  save() {
    //todo
    this.fanShaftPower = this.fsat203Service.getShaftPowerObjFromForm(this.shaftPowerForm, this.fanShaftPower);
    this.emitSave.emit(this.fanShaftPower);
  }

  focusField() {
    //todo
  }
}