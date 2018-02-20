import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../../standalone.service";
import {ReceiverTankGeneral} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-general-method',
  templateUrl: './general-method.component.html',
  styleUrls: ['./general-method.component.css']
})
export class GeneralMethodComponent implements OnInit {
  inputs: ReceiverTankGeneral;
  requiredStorage: number;

  constructor() { }

  ngOnInit() {
    // this.inputs = {
    //   airDemand: 0,
    //   allowablePressureDrop: 0,
    //   atmosphericPressure: 0
    // };
  }

  getStorage() {
    this.requiredStorage = StandaloneService.receiverTankSizeGeneral(this.inputs);
  }
}
