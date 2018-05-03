import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiverTankMeteredStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';

@Component({
  selector: 'app-metered-storage-form',
  templateUrl: './metered-storage-form.component.html',
  styleUrls: ['./metered-storage-form.component.css']
})
export class MeteredStorageFormComponent implements OnInit {

  inputs: ReceiverTankMeteredStorage = {
    method: 2,
    lengthOfDemand: 0,
    airFlowRequirement: 0,
    atmosphericPressure: 14.7,
    initialTankPressure: 0,
    finalTankPressure: 0,
    meteredControl: 0,
  };
  totalReceiverVolume: number;

  constructor() {
  }

  ngOnInit() {
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = StandaloneService.receiverTankSizeMeteredStorage(this.inputs);
  }
}
