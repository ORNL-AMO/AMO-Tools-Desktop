import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiverTankBridgingCompressor } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';

@Component({
  selector: 'app-delay-method-form',
  templateUrl: './delay-method-form.component.html',
  styleUrls: ['./delay-method-form.component.css']
})
export class DelayMethodFormComponent implements OnInit {
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  inputs: ReceiverTankBridgingCompressor = {
    method: 3,
    distanceToCompressorRoom: 0,
    speedOfAir: 0,
    airDemand: 0,
    allowablePressureDrop: 0,
    atmosphericPressure: 14.7
  };;
  totalReceiverVolume: number;

  constructor() {
  }

  ngOnInit() {
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = StandaloneService.receiverTankSizeBridgingCompressor(this.inputs);
  }
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
