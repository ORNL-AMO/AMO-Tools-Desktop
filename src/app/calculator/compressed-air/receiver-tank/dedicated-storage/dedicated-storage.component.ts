import {Component, OnInit} from '@angular/core';
import {ReceiverTankDedicatedStorage} from "../../../../shared/models/standalone";
import {StandaloneService} from "../../../standalone.service";

@Component({
  selector: 'app-dedicated-storage',
  templateUrl: './dedicated-storage.component.html',
  styleUrls: ['./dedicated-storage.component.css']
})
export class DedicatedStorageComponent implements OnInit {

  inputs: ReceiverTankDedicatedStorage;
  receiverVolume: number;

  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      method: 1,
      atmosphericPressure: 0,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      initialTankPressure: 0,
      finalTankPressure: 0
    };
  }

  getReceiverVolume(inputs: ReceiverTankDedicatedStorage) {
    this.receiverVolume = StandaloneService.receiverTankSizeDedicatedStorage(this.inputs);
  }
}
