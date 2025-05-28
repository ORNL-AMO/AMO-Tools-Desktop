import { Component, OnInit, Input } from '@angular/core';
import { CalculateUsableCapacity } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ReceiverTankService } from '../receiver-tank.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-air-capacity-form',
    templateUrl: './air-capacity-form.component.html',
    styleUrls: ['./air-capacity-form.component.css'],
    standalone: false
})
export class AirCapacityFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: CalculateUsableCapacity;
  leakRate: number;
  airCapacity: number;
  tankCubicFoot: number;
  setFormSub: Subscription;
  constructor(private receiverTankService: ReceiverTankService, private standaloneService: StandaloneService, private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    this.setFormSub = this.receiverTankService.setForm.subscribe(val => {
      this.inputs = this.receiverTankService.airCapacityInputs;
      this.getAirCapacity();
    });
  }

  ngOnDestroy() {
    this.receiverTankService.airCapacityInputs = this.inputs;
    this.setFormSub.unsubscribe();
  }

  getAirCapacity() {
    this.airCapacity = this.standaloneService.usableAirCapacity(this.inputs, this.settings);
    this.getTankSize();
    
  }

  updateInputsForAssessmentCalculator() {
    this.receiverTankService.inputs.next({airCapacityInputs: this.inputs})
  }

  getTankSize() {
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.tankCubicFoot = this.inputs.tankSize;
    } else {
      this.tankCubicFoot = this.convertUnitsService.value(this.inputs.tankSize).from('gal').to('ft3');
    }
  }
  

  changeField(str: string) {
    this.receiverTankService.currentField.next(str);
  }
}
