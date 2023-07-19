import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';
import { standardSizesConstant, metricSizesConstant } from '../../compressed-air-constants';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

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

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    let sizeOptions = this.settings.unitsOfMeasure == 'Metric'? metricSizesConstant : standardSizesConstant;  
    this.pipeSizeOptions = JSON.parse(JSON.stringify(sizeOptions));
    if(!this.inputs.allPipes){
      this.addPipe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.outputs && this.settings.unitsOfMeasure === 'Imperial') {
      this.setCubicFeetResults();
    }
  }

  setCubicFeetResults() {
    this.outputs.totalPipeVolumeCubicFeet = this.convertUnitsService.value(this.outputs.totalPipeVolume).from('gal').to('ft3');
    this.outputs.totalReceiverVolumeCubicFeet = this.convertUnitsService.value(this.outputs.totalReceiverVolume).from('gal').to('ft3');
    this.outputs.totalCapacityOfCompressedAirSystemCubicFeet = this.convertUnitsService.value(this.outputs.totalCapacityOfCompressedAirSystem).from('gal').to('ft3');
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
