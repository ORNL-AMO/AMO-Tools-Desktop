import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ReceiverTankBridgingCompressor } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-delay-method-form',
  templateUrl: './delay-method-form.component.html',
  styleUrls: ['./delay-method-form.component.css']
})
export class DelayMethodFormComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
  @Input()
  settings: Settings;
  @Input()
  toggleGenerateExample: boolean;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  inputs: ReceiverTankBridgingCompressor;
  totalReceiverVolume: number;

  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.bridgeCompressorInputs;
    this.getTotalReceiverVolume();
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
      method: 3,
      distanceToCompressorRoom: 1000,
      speedOfAir: 250,
      airDemand: 600,
      allowablePressureDrop: 2,
      atmosphericPressure: 14.7
    };
    this.inputs = this.compressedAirService.convertTankBridgingCompressorExample(tempInputs, this.settings);
    this.getTotalReceiverVolume();
  }

  resetData() {
    this.compressedAirService.initReceiverTankInputs();
    this.inputs = this.compressedAirService.bridgeCompressorInputs;
    this.getTotalReceiverVolume();
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = this.standaloneService.receiverTankSizeBridgingCompressor(this.inputs, this.settings);
  }
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
