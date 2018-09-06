import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiverTankDedicatedStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';
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

  inputs: ReceiverTankDedicatedStorage;
  receiverVolume: number;

  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.dedicatedStorageInputs;
    this.getReceiverVolume();
  }

  getReceiverVolume() {
    this.receiverVolume = this.standaloneService.receiverTankSizeDedicatedStorage(this.inputs, this.settings);
  }
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
