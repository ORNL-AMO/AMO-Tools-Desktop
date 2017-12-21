import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Settings } from "../../../../shared/models/settings";

@Component({
  selector: 'app-percent-load-estimation-form',
  templateUrl: './percent-load-estimation-form.component.html',
  styleUrls: ['./percent-load-estimation-form.component.css']
})
export class PercentLoadEstimationFormComponent implements OnInit {
  @Input()
  percentLoadEstimationForm: any;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  loadEstimationResult: number;

  measuredSpeedError: string = null;
  synchronousSpeedError: string = null;
  nameplateFullLoadSpeedError: string = null;
  synchronousSpeeds: Array<number> = [
    600,
    720,
    900,
    1200,
    1800,
    3600
  ]

  constructor() { }

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    this.synchronousSpeedError = this.nameplateFullLoadSpeedError = this.measuredSpeedError = null;
    var err: boolean = false;

    if (this.percentLoadEstimationForm.value.nameplateFullLoadSpeed >= 3600) {
      this.nameplateFullLoadSpeedError = 'Nameplate Full Load Speed must be less than 3600';
      err = true;
    }
    if (this.percentLoadEstimationForm.value.measuredSpeed >= 3600) {
      this.measuredSpeedError = 'Measured Speed must be less than 3600';
      err = true;
    }

    if (!this.percentLoadEstimationForm.value.measuredSpeed || !this.percentLoadEstimationForm.value.nameplateFullLoadSpeed) {
      this.loadEstimationResult = 0;
      err = true;
    }

    if (this.percentLoadEstimationForm.value.nameplateFullLoadSpeed > this.percentLoadEstimationForm.value.measuredSpeed) {
      this.measuredSpeedError = 'Measured Speed must be greater than or equal to the Nameplate Full Load Speed.';
      err = true;
    }

    for (let i = 0; i < this.synchronousSpeeds.length; i++) {
      if (this.synchronousSpeeds[i] > this.percentLoadEstimationForm.value.nameplateFullLoadSpeed) {
        this.percentLoadEstimationForm.patchValue({
          synchronousSpeed: this.synchronousSpeeds[i]
        });

        if (this.synchronousSpeeds[i] <= this.percentLoadEstimationForm.value.measuredSpeed) {
          this.measuredSpeedError = 'Measured Speed must be less than the synchronous speed';
          err = true;
        }

        break;
      }
      if (this.percentLoadEstimationForm.value.nameplateFullLoadSpeed === this.synchronousSpeeds[i]) {
        this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + this.synchronousSpeeds[i];
        this.loadEstimationResult = 0;
        err = true;
      }
    }
    if (!err) {
      this.emitCalculate.emit(true);      
    }
  }

  //debug
  emitChange() {
    this.calculate();
  }
}
