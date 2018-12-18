import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SlipMethod, PercentLoadEstimationService } from '../percent-load-estimation.service';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-slip-method-form',
  templateUrl: './slip-method-form.component.html',
  styleUrls: ['./slip-method-form.component.css']
})
export class SlipMethodFormComponent implements OnInit {
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<SlipMethod>();
  @Input()
  data: SlipMethod;

  form: FormGroup;

  lineFrequency: number = 60;
  showSynchronousSpeed: boolean = false;
  measuredSpeedError: string = null;
  synchronousSpeedError: string = null;
  nameplateFullLoadSpeedError: string = null;
  synchronousSpeeds: Array<number>;

  constructor(private percentLoadEstimationService: PercentLoadEstimationService) { }

  ngOnInit() {
    this.form = this.percentLoadEstimationService.initSlipMethodForm();
    this.updateSynchronousSpeeds(false);
  }

  updateSynchronousSpeeds(calculate: boolean) {
    if (this.form.controls.lineFrequency.value == 50) {
      this.synchronousSpeeds = [
        500,
        600,
        750,
        1000,
        1500,
        3000
      ];
    }
    else if (this.form.controls.lineFrequency.value == 60) {
      this.synchronousSpeeds = [
        600,
        720,
        900,
        1200,
        1800,
        3600
      ];
    }
    //update form for validation with new synchronous speed list
    this.form = this.percentLoadEstimationService.getSlipMethodFormFromObj(this.data, this.lineFrequency, this.synchronousSpeeds);
    if (calculate) {
      this.calculate();
    }
  }

  calculate() {
    this.synchronousSpeedError = this.nameplateFullLoadSpeedError = this.measuredSpeedError = null;
    for (let i = 0; i < this.synchronousSpeeds.length; i++) {
      if (this.synchronousSpeeds[i] > this.form.controls.nameplateFullLoadSpeed.value) {
        this.form.controls.synchronousSpeed.patchValue(this.synchronousSpeeds[i]);
        this.form = this.percentLoadEstimationService.updateMeasuredSpeedValidator(this.form, this.synchronousSpeeds[i]);
        if (this.synchronousSpeeds[i] <= this.form.controls.measuredSpeed.value) {
          this.measuredSpeedError = 'Measured Speed must be less than the synchronous speed';
        }
        break;
      }
      if (this.form.controls.nameplateFullLoadSpeed.value === this.synchronousSpeeds[i]) {
        this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + this.synchronousSpeeds[i];
      }
    }
    this.data = this.percentLoadEstimationService.getSlipMethodObjFromForm(this.form);
    this.emitCalculate.emit(this.data);
  }
}
