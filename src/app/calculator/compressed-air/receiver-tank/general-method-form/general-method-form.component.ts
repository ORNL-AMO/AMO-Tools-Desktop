import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ReceiverTankGeneral } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-general-method-form',
  templateUrl: './general-method-form.component.html',
  styleUrls: ['./general-method-form.component.css']
})
export class GeneralMethodFormComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
  @Input()
  settings: Settings;
  @Input()
  toggleGenerateExample: boolean;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  inputs: ReceiverTankGeneral;
  finalTankPressure: number;

  constructor(private compressedAirService: CompressedAirService, private standAloneService: StandaloneService) { }

  ngOnInit() {
    this.inputs = this.compressedAirService.generalMethodInputs;
    this.getStorage();
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
      airDemand: 150,
      allowablePressureDrop: 3,
      method: 0,
      atmosphericPressure: 14.7,
    };
    this.inputs = this.compressedAirService.convertGeneralMethodExample(tempInputs, this.settings);
    this.getStorage();
  }

  resetData() {
    this.compressedAirService.initReceiverTankInputs();
    this.inputs = this.compressedAirService.generalMethodInputs;
    this.getStorage();
  }

  getStorage() {
    this.finalTankPressure = this.standAloneService.receiverTankSizeGeneral(this.inputs, this.settings);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
