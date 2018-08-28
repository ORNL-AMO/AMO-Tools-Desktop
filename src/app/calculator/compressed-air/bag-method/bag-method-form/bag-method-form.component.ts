import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { BagMethodInput, BagMethodOutput } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-bag-method-form',
  templateUrl: './bag-method-form.component.html',
  styleUrls: ['./bag-method-form.component.css']
})
export class BagMethodFormComponent implements OnInit {
  @Input()
  inputs: BagMethodInput;
  // @Input()
  // inputsArray: Array<BagMethodInput>;
  @Input()
  outputs: BagMethodOutput;
  // @Input()
  // outputsArray: Array<BagMethodOutput>;
  @Output('calculate')
  calculate = new EventEmitter<{ inputs: BagMethodInput, index: number }>();
  // calculate = new EventEmitter<BagMethodInput>();
  // calculate = new EventEmitter<Array<BagMethodInput>>();
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
    }
    this.calculate.emit(inputsObject);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  emitDeleteLeakage() {
    this.deleteLeakage.emit(this.index);
  }
}
