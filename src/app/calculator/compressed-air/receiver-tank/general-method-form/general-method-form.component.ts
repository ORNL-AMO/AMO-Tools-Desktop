import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ReceiverTankGeneral } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';

@Component({
  selector: 'app-general-method-form',
  templateUrl: './general-method-form.component.html',
  styleUrls: ['./general-method-form.component.css']
})
export class GeneralMethodFormComponent implements OnInit {
  inputs: ReceiverTankGeneral = {
    airDemand: 0,
    allowablePressureDrop: 0,
    method: 0,
    atmosphericPressure: 14.7,
  };;
  finalTankPressure: number;

  constructor() { }

  ngOnInit() {
  }

  getStorage() {
    this.finalTankPressure = StandaloneService.receiverTankSizeGeneral(this.inputs);
  }

}
