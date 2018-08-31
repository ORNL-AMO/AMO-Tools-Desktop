import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiverTankDedicatedStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-dedicated-storage-form',
  templateUrl: './dedicated-storage-form.component.html',
  styleUrls: ['./dedicated-storage-form.component.css']
})

export class DedicatedStorageFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  inputs: ReceiverTankDedicatedStorage = {
    method: 1,
    atmosphericPressure: 14.7,
    lengthOfDemand: 0,
    airFlowRequirement: 0,
    initialTankPressure: 0,
    finalTankPressure: 0
  };;
  receiverVolume: number;

  constructor() {
  }

  ngOnInit() {
  }

  getReceiverVolume() {
    this.receiverVolume = StandaloneService.receiverTankSizeDedicatedStorage(this.inputs);
  }
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
