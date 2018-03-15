import {Component, OnInit} from '@angular/core';
import {ReceiverTankBridgingCompressor} from "../../../../shared/models/standalone";
import {StandaloneService} from "../../../standalone.service";

@Component({
  selector: 'app-delay-method',
  templateUrl: './delay-method.component.html',
  styleUrls: ['./delay-method.component.css']
})
export class DelayMethodComponent implements OnInit {
  inputs: ReceiverTankBridgingCompressor;
  totalReceiverVolume: number;

  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      method: 3,
      distanceToCompressorRoom: 0,
      speedOfAir: 0,
      airDemand: 0,
      allowablePressureDrop: 0,
      atmosphericPressure: 0
    };
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = StandaloneService.receiverTankSizeBridgingCompressor(this.inputs);
  }
}
