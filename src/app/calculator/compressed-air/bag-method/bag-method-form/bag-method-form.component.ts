import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BagMethodInput, BagMethodOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-bag-method-form',
    templateUrl: './bag-method-form.component.html',
    styleUrls: ['./bag-method-form.component.css'],
    standalone: false
})
export class BagMethodFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: BagMethodInput;
  @Input()
  outputs: BagMethodOutput;
  @Output('calculate')
  calculate = new EventEmitter<{ inputs: BagMethodInput, index: number }>();
  @Output('deleteLeakage')
  deleteLeakage = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
  }

  emitChange() {
    let inputsObject = {
      inputs: this.inputs,
      index: this.index
    };
    this.calculate.emit(inputsObject);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  emitDeleteLeakage() {
    this.deleteLeakage.emit(this.index);
  }
}
