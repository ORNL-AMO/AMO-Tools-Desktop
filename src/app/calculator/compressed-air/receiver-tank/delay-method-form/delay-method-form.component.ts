import { Component, OnInit, Input } from '@angular/core';
import { ReceiverTankBridgingCompressor } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankService } from '../receiver-tank.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delay-method-form',
  templateUrl: './delay-method-form.component.html',
  styleUrls: ['./delay-method-form.component.css']
})
export class DelayMethodFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: ReceiverTankBridgingCompressor;
  totalReceiverVolume: number;

  setFormSub: Subscription;
  constructor(private receiverTankService: ReceiverTankService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.bridgeCompressorInputs;
      this.getTotalReceiverVolume();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.receiverTankService.bridgeCompressorInputs = this.inputs;
  }
  
  getTotalReceiverVolume() {
    this.totalReceiverVolume = this.standaloneService.receiverTankSizeBridgingCompressor(this.inputs, this.settings);
    if (this.receiverTankService.inAssessmentCalculator) {
      this.updateInputsForAssessmentCalculator();
    }
  }

  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({bridgeCompressorInputs: this.inputs})
  }

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }
}
