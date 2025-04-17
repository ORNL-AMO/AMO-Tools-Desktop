import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {PipeSizingInput, PipeSizingOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-pipe-sizing-form',
    templateUrl: './pipe-sizing-form.component.html',
    styleUrls: ['./pipe-sizing-form.component.css'],
    standalone: false
})
export class PipeSizingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: PipeSizingInput;
  @Input()
  outputs: PipeSizingOutput;
  @Output('calculate')
  calculate = new EventEmitter<PipeSizingInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  
  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
