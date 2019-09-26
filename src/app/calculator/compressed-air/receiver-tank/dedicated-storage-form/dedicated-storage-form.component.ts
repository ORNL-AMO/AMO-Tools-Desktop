import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
  toggleResetData: boolean;
  @Input()
  settings: Settings;
  @Input()
  toggleGenerateExample: boolean;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.resetData();
    }
    if (changes.toggleGenerateExample && !changes.toggleGenerateExample.firstChange) {
      this.generateExample();
    }
  }

  generateExample() {
    let tempInputs = {
      method: 1,
      atmosphericPressure: 14.7,
      lengthOfDemand: 1,
      airFlowRequirement: 1000,
      initialTankPressure: 110,
      finalTankPressure: 100
    };
    this.inputs = this.compressedAirService.convertDedicatedStorageExample(tempInputs, this.settings);
    this.getReceiverVolume();
  }

  resetData() {
    this.compressedAirService.initReceiverTankInputs();
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
