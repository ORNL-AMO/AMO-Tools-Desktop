import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';
import { standardSizesConstant, metricSizesConstant } from '../../compressed-air-constants';

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

  constructor() { }

  ngOnInit() {
    let sizeOptions = this.settings.unitsOfMeasure == 'Metric'? metricSizesConstant : standardSizesConstant;  
    this.pipeSizeOptions = JSON.parse(JSON.stringify(sizeOptions));
    if(!this.inputs.allPipes){
      this.addPipe();
    }
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

  trackByFn(index: any, item: any) {
    return index;
  }

  addPipe() {
    let newPipe = {
      pipeSize: this.pipeSizeOptions[1].size,
      customPipeSize: 0,
      pipeLength: 0,
    };
    if (!this.inputs.allPipes) {
      this.inputs.allPipes = new Array<{ pipeSize: string, customPipeSize: number, pipeLength: number }>();
    }
    this.inputs.allPipes.push(newPipe);
  }

  deletePipe(i: number) {
    this.inputs.allPipes.splice(i, 1);
    this.emitChange();
  }
  
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
