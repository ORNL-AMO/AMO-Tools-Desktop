import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankCompressorCycle, ReceiverTankCompressorCycleOutput } from '../../../../shared/models/standalone';
import { StandaloneService } from '../../../standalone.service';
import { ReceiverTankService } from '../receiver-tank.service';

@Component({
  selector: 'app-compressor-cycle-form',
  templateUrl: './compressor-cycle-form.component.html',
  styleUrls: ['./compressor-cycle-form.component.css']
})
export class CompressorCycleFormComponent implements OnInit {

  @Input()
  settings: Settings;

  inputs: ReceiverTankCompressorCycle;
  output: ReceiverTankCompressorCycleOutput;
  setFormSub: Subscription;

  constructor(private receiverTankService: ReceiverTankService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.compressorCycleInputs;
      this.save();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.receiverTankService.compressorCycleInputs = this.inputs;
  }

  save() {
    this.output = this.calculate();
    if (this.receiverTankService.inAssessmentCalculator) {
      this.updateInputsForAssessmentCalculator();
    }
  }

  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({ compressorCycleInputs: this.inputs })
  }

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }

  calculate(): ReceiverTankCompressorCycleOutput {
    let input: ReceiverTankCompressorCycle = this.inputs;
    let pressureChange: number = input.unloadPressure - input.fullLoadPressure;
    let capacity: number = ((input.loadTime / (input.loadTime + input.unloadTime)) * input.compressorCapacity);
    let areaStorageVolume: number = (capacity * input.unloadTime / 60) / (pressureChange / input.atmosphericPressure);
    let liquidStorageVolume: number;
    if (this.settings.unitsOfMeasure == 'Metric') {
      liquidStorageVolume = areaStorageVolume * 1000;
    } else {
      liquidStorageVolume = areaStorageVolume * 7.48052;
    }
    if(pressureChange != 0){
      return {
        pressureChange: pressureChange,
        capacity: capacity,
        areaStorageVolume: areaStorageVolume,
        liquidStorageVolume: liquidStorageVolume
      }
    } else {
      return undefined;
    }
  }

  convertInputs(): ReceiverTankCompressorCycle {
    let tmpInputs: ReceiverTankCompressorCycle = this.inputs;
    if (this.settings.unitsOfMeasure == 'Metric') {
      tmpInputs.atmosphericPressure = this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('bara').to('psia');
      tmpInputs.compressorCapacity = this.convertUnitsService.value(tmpInputs.compressorCapacity).from('m3/min').to('ft3/min');
      tmpInputs.fullLoadPressure = this.convertUnitsService.value(tmpInputs.fullLoadPressure).from('barg').to('psig');
      tmpInputs.unloadPressure = this.convertUnitsService.value(tmpInputs.unloadPressure).from('barg').to('psig');
    }
    return tmpInputs;
  }

}
