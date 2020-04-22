import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';
import { pipeSizesConstant } from '../../compressedAirConstants';

@Component({
  selector: 'app-system-capacity-form',
  templateUrl: './system-capacity-form.component.html',
  styleUrls: ['./system-capacity-form.component.css']
})
export class SystemCapacityFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: AirSystemCapacityInput;
  @Input()
  outputs: AirSystemCapacityOutput;
  @Output('calculate')
  calculate = new EventEmitter<AirSystemCapacityInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  pipeSizeOptions: Array<{ display: string, size: string }>;
  pipes: Array<{ pipeSize: string, customPipeSize: number, pipeLength: number }>;

  constructor() { }

  ngOnInit() {
    this.pipeSizeOptions = JSON.parse(JSON.stringify(pipeSizesConstant));
  }

  emitChange() {
    this.calculate.emit(this.inputs);
  }

  addReceiver() {
    this.inputs.receiverCapacities.push(0);
    this.emitChange();
  }

  removeCapacity(index: number) {
    this.inputs.receiverCapacities.splice(index, 1);
    this.emitChange();
  }

  //function used by *ngFor with data binding
  trackByFn(index: any, item: any) {
    return index;
  }

  addPipe() {
    let newPipe = {
      pipeSize: this.pipeSizeOptions[1].size,
      customPipeSize: undefined,
      pipeLength: 0,
    };
    if (!this.pipes) {
      this.pipes = new Array<{ pipeSize: string, customPipeSize: number, pipeLength: number }>();
    }
    this.pipes.push(newPipe);
  }

  deletePipe(i: number) {
    this.pipes.splice(i, 1);
    this.emitChange();
  }
  
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  changeCustomPipeSize(pipeIndex: number) {
    // console.log('changing standard pipe size', this.pipes[pipeIndex]);
  }

  changePipeLength(pipeIndex: number) {
    const pipe = this.pipes[pipeIndex];
    if (pipe.pipeSize == 'CUSTOM') {
      // How to handle changes to pipe once pushed to the array?
      const customPipe = {
        pipeSize: pipe.customPipeSize,
        pipeLength: pipe.pipeLength
      };
      this.inputs.customPipes.push(customPipe);
    } else {
      // Handling on (input) vs ... taking (blur) (keyup.enter) which differs from the other forms
      // If existing value increment, else assign
      this.inputs[pipe.pipeSize] = pipe.pipeLength;
    }
    this.emitChange();
    console.log('inputs on change', this.inputs);
  }
}
