import { Component, OnInit, Input } from '@angular/core';
import { ReceiverTankDedicatedStorage } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { ReceiverTankService } from '../receiver-tank.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dedicated-storage-form',
    templateUrl: './dedicated-storage-form.component.html',
    styleUrls: ['./dedicated-storage-form.component.css'],
    standalone: false
})

export class DedicatedStorageFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: ReceiverTankDedicatedStorage;
  receiverVolume: number;
  setFormSub: Subscription;
  constructor(private receiverTankService: ReceiverTankService, private standaloneService: StandaloneService) {
  }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.dedicatedStorageInputs;
      this.getReceiverVolume();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
    this.receiverTankService.dedicatedStorageInputs = this.inputs;
  }

  getReceiverVolume() {
    this.receiverVolume = this.standaloneService.receiverTankSizeDedicatedStorage(this.inputs, this.settings);
    if (this.receiverTankService.inAssessmentCalculator) {
      this.updateInputsForAssessmentCalculator();
    }
  }
  
  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({dedicatedStorageInputs: this.inputs})
  }

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }
}
