import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {ReceiverTankGeneral} from "../../../../../shared/models/standalone";

@Component({
  selector: 'app-general-method-form',
  templateUrl: './general-method-form.component.html',
  styleUrls: ['./general-method-form.component.css']
})
export class GeneralMethodFormComponent implements OnInit {
  @Input()
  inputs: ReceiverTankGeneral;
  @Output('calculate')
  calculate = new EventEmitter();
  @Input()
  finalTankPressure: number;

  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }

}
