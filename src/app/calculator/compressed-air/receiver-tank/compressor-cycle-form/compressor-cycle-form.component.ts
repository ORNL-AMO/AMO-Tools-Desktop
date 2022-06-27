import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankCompressorCycle, ReceiverTankCompressorCycleOutput } from '../../../../shared/models/standalone';
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

  constructor(private receiverTankService: ReceiverTankService) { }

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

}
