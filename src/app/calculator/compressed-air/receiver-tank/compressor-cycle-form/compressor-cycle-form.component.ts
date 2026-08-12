import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankCompressorCycle, ReceiverTankCompressorCycleOutput } from '../../../../shared/models/standalone';
import { ReceiverTankService } from '../receiver-tank.service';
import { StandaloneService } from '../../../standalone.service';

@Component({
    selector: 'app-compressor-cycle-form',
    templateUrl: './compressor-cycle-form.component.html',
    styleUrls: ['./compressor-cycle-form.component.css'],
    standalone: false
})
export class CompressorCycleFormComponent implements OnInit {

  @Input()
  settings: Settings;

  inputs: ReceiverTankCompressorCycle;
  output: ReceiverTankCompressorCycleOutput;
  setFormSub: Subscription;

  constructor(private receiverTankService: ReceiverTankService,
      private standaloneService: StandaloneService
  ) { }

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
    return this.standaloneService.calculateReceiverTankCompressorCycleSize(this.inputs, this.settings);
  }

}
