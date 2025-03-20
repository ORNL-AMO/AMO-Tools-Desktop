import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ReceiverTankGeneral } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankService } from '../receiver-tank.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-general-method-form',
    templateUrl: './general-method-form.component.html',
    styleUrls: ['./general-method-form.component.css'],
    standalone: false
})
export class GeneralMethodFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: ReceiverTankGeneral;
  finalTankPressure: number;
  setFormSub: Subscription;
  constructor(private receiverTankService: ReceiverTankService, private standAloneService: StandaloneService) { }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.generalMethodInputs;
      this.getStorage();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.receiverTankService.generalMethodInputs = this.inputs;
  }

  getStorage() {
    this.finalTankPressure = this.standAloneService.receiverTankSizeGeneral(this.inputs, this.settings);
    if (this.receiverTankService.inAssessmentCalculator) {
      this.updateInputsForAssessmentCalculator();
    }
  }

  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({generalMethodInputs: this.inputs})
  }

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }
}
