import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReceiverTankMeteredStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-metered-storage-form',
  templateUrl: './metered-storage-form.component.html',
  styleUrls: ['./metered-storage-form.component.css']
})
export class MeteredStorageFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  
  inputs: ReceiverTankMeteredStorage;
  totalReceiverVolume: number;

  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.meteredStorageInputs;
    this.getTotalReceiverVolume();
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = this.standaloneService.receiverTankSizeMeteredStorage(this.inputs, this.settings);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }
}
