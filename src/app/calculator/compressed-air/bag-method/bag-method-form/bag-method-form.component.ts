import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {BagMethodInput, BagMethodOutput} from '../../../../shared/models/standalone';

@Component({
  selector: 'app-bag-method-form',
  templateUrl: './bag-method-form.component.html',
  styleUrls: ['./bag-method-form.component.css']
})
export class BagMethodFormComponent implements OnInit {
  @Input()
  inputs: BagMethodInput;
  @Input()
  outputs: BagMethodOutput;
  @Output('calculate')
  calculate = new EventEmitter<BagMethodInput>();
  constructor() { }

  ngOnInit() {}

  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
