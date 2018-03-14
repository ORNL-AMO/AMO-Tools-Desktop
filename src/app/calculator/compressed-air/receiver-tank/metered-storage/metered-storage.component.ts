import {Component, OnInit} from '@angular/core';
import {ReceiverTankMeteredStorage} from "../../../../shared/models/standalone";
import {StandaloneService} from "../../../standalone.service";

@Component({
  selector: 'app-metered-storage',
  templateUrl: './metered-storage.component.html',
  styleUrls: ['./metered-storage.component.css']
})
export class MeteredStorageComponent implements OnInit {
  inputs: ReceiverTankMeteredStorage;
  totalReceiverVolume: number;

  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      method: 2,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      atmosphericPressure: 0,
      initialTankPressure: 0,
      finalTankPressure: 0,
      meteredControl: 0
    };
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = StandaloneService.receiverTankSizeMeteredStorage(this.inputs);
    console.log(this.totalReceiverVolume);
    console.log(this.inputs);
  }

}
