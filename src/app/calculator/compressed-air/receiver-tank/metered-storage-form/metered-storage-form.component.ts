import { Component, OnInit, Input } from '@angular/core';
import { ReceiverTankMeteredStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankService } from '../receiver-tank.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-metered-storage-form',
  templateUrl: './metered-storage-form.component.html',
  styleUrls: ['./metered-storage-form.component.css']
})
export class MeteredStorageFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: ReceiverTankMeteredStorage;
  totalReceiverVolume: number;
  setFormSub: Subscription;
  constructor(private receiverTankService: ReceiverTankService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.meteredStorageInputs;
      this.getTotalReceiverVolume();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.receiverTankService.meteredStorageInputs = this.inputs;
  }

  getTotalReceiverVolume() {
    this.totalReceiverVolume = this.standaloneService.receiverTankSizeMeteredStorage(this.inputs, this.settings);
    if (this.receiverTankService.inAssessmentCalculator) {
      this.updateInputsForAssessmentCalculator();
    }
  }

  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({meteredStorageInputs: this.inputs})
  }

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }
}
