import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Settings } from "../../../../shared/models/settings";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-percent-load-estimation-form',
  templateUrl: './percent-load-estimation-form.component.html',
  styleUrls: ['./percent-load-estimation-form.component.css']
})
export class PercentLoadEstimationFormComponent implements OnInit {
  @Input()
  percentLoadEstimationForm: FormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  loadEstimationResult: number;

  showSynchronousSpeed: boolean = false;
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
  ];

  constructor() { }

  ngOnInit() {
    this.updateSynchronousSpeeds();
    this.calculate();
  }

  updateSynchronousSpeeds() {
    if (this.percentLoadEstimationForm.controls.lineFrequency.value == 50) {
      this.synchronousSpeeds = [
        500,
        600,
        750,
        1000,
        1500,
        3000
      ];
    }
    else if (this.percentLoadEstimationForm.controls.lineFrequency.value == 60) {
      this.synchronousSpeeds = [
        600,
        720,
        900,
        1200,
        1800,
        3600
      ];
    }
    this.calculate();
  }

  calculate() {
    this.synchronousSpeedError = this.nameplateFullLoadSpeedError = this.measuredSpeedError = null;
    var err: boolean = false;

    if (this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value >= this.synchronousSpeeds[this.synchronousSpeeds.length - 1]) {
      this.nameplateFullLoadSpeedError = 'Nameplate Full Load Speed must be less than ' + this.synchronousSpeeds[this.synchronousSpeeds.length - 1];
      err = true;
    }
    if (this.percentLoadEstimationForm.controls.measuredSpeed.value >= this.synchronousSpeeds[this.synchronousSpeeds.length - 1]) {
      this.measuredSpeedError = 'Measured Speed must be less than ' + this.synchronousSpeeds[this.synchronousSpeeds.length - 1];
      err = true;
    }

    if (!this.percentLoadEstimationForm.controls.measuredSpeed.value || !this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value) {
      this.loadEstimationResult = 0;
      err = true;
    }

    // if (this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value > this.percentLoadEstimationForm.controls.measuredSpeed.value) {
    //   this.measuredSpeedError = 'Measured Speed must be greater than or equal to the Nameplate Full Load Speed.';
    //   err = true;
    // }

    for (let i = 0; i < this.synchronousSpeeds.length; i++) {
      if (this.synchronousSpeeds[i] > this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value) {
        this.percentLoadEstimationForm.patchValue({
          synchronousSpeed: this.synchronousSpeeds[i]
        });

        if (this.synchronousSpeeds[i] <= this.percentLoadEstimationForm.controls.measuredSpeed.value) {
          this.measuredSpeedError = 'Measured Speed must be less than the synchronous speed';
          err = true;
        }
        break;
      }
      if (this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value === this.synchronousSpeeds[i]) {
        this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + this.synchronousSpeeds[i];
        this.loadEstimationResult = 0;
        err = true;
      }
    }

    if (!this.percentLoadEstimationForm.controls.nameplateFullLoadSpeed.value) {
      this.showSynchronousSpeed = false;
    } else {
      this.showSynchronousSpeed = true;
    }

    if (!err) {
      this.emitCalculate.emit(true);      
    }
  }

  //debug
  emitChange() {
    this.updateSynchronousSpeeds();
    this.calculate();
  }
}
