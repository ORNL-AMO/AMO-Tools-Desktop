import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';

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
  constructor() { }

  ngOnInit() {
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

  addCustomPipe() {
    let customPipe = {
      pipeSize: 0,
      pipeLength: 0
    };
    if (!this.inputs.customPipes) {
      this.inputs.customPipes = new Array<{ pipeSize: number, pipeLength: number }>();
    }
    // if (!this.outputs.customPipes) {
    //   this.outputs.customPipes = new Array<{ pipeSize: number, pipeLength: number }>();
    // }
    this.inputs.customPipes.push(customPipe);
    // this.outputs.customPipes.push(customPipe);
  }

  deleteCustomPipe(i: number) {
    if (i == this.inputs.customPipes.length - 1) {
      this.inputs.customPipes.pop();
    }
    else {
      let tempCustomPipes = this.inputs.customPipes;
      this.inputs.customPipes = new Array<{ pipeSize: number, pipeLength: number }>();
      for (let j = 0; j < tempCustomPipes.length; j++) {
        if (j != i) {
          this.inputs.customPipes.push(tempCustomPipes[j]);
        }
      }
    }
    this.emitChange();
  }

}
