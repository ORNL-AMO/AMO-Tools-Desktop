import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {PipeSizingInput, PipeSizingOutput } from "../../../../shared/models/standalone";

@Component({
  selector: 'app-pipe-sizing-form',
  templateUrl: './pipe-sizing-form.component.html',
  styleUrls: ['./pipe-sizing-form.component.css']
})
export class PipeSizingFormComponent implements OnInit {

  @Input()
  inputs: PipeSizingInput;
  @Input()
  outputs: PipeSizingOutput;
  @Output('calculate')
  calculate = new EventEmitter<PipeSizingInput>();

  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
