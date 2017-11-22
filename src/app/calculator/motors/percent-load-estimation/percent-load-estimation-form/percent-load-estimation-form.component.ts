import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Settings} from "../../../../shared/models/settings";

@Component({
  selector: 'app-percent-load-estimation-form',
  templateUrl: './percent-load-estimation-form.component.html',
  styleUrls: ['./percent-load-estimation-form.component.css']
})
export class PercentLoadEstimationFormComponent implements OnInit {
  @Input()
  percentLoadEstimationForm: any;
  // @Output('calculate')
  // calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  tmpMeasuredSpeed: number;
  tmpNameplateFullLoadSpeed: number;
  tmpSynchronousSpeed: number;
  tmpLoadEstimation: number;

  synchronousSpeedError: string = null;
  nameplateFullLoadSpeedError: string = null;

  private synchronousSpeeds = [
    600,
    720,
    900,
    1200,
    1800,
    3600
  ];

  constructor() { }

  ngOnInit() {
    if (!this.tmpMeasuredSpeed) {
      this.tmpMeasuredSpeed = 1770;
    }
    if (!this.tmpNameplateFullLoadSpeed) {
      this.tmpNameplateFullLoadSpeed = 1750;
    }

    this.calculate();
  }

  calculate() {
    this.synchronousSpeedError = this.nameplateFullLoadSpeedError = null;

    if (this.tmpNameplateFullLoadSpeed >= 3600) {
      this.nameplateFullLoadSpeedError = 'Nameplate Full Load Speed is greater than or equal to 3600';
    }

    if (!this.tmpMeasuredSpeed || !this.tmpNameplateFullLoadSpeed) {
      return;
    }

    for (let i = 0; i < this.synchronousSpeeds.length; i++) {
      if (this.synchronousSpeeds[i] > this.tmpNameplateFullLoadSpeed) {
        this.tmpSynchronousSpeed = this.synchronousSpeeds[i];
        break;
      }
      if (this.tmpNameplateFullLoadSpeed === this.synchronousSpeeds[i]) {
        this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + this.synchronousSpeeds[i];
        break;
      }
    }

    // this.synchronousSpeeds.forEach( (val) => {
    //   if (val > this.tmpNameplateFullLoadSpeed) {
    //     this.tmpSynchronousSpeed = val;
    //     break;
    //   }
    //   if (this.tmpNameplateFullLoadSpeed === val) {
    //     this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + val;
    //     break;
    //   }
    // });

    this.tmpLoadEstimation = (this.tmpSynchronousSpeed - this.tmpMeasuredSpeed) / (this.tmpSynchronousSpeed - this.tmpNameplateFullLoadSpeed);
  }

  emitChange() {
    this.calculate();
    this.percentLoadEstimationForm.patchValue({
      measuredSpeed: this.tmpMeasuredSpeed,
      nameplateFullLoadSpeed: this.tmpNameplateFullLoadSpeed,
      synchronousSpeed: this.tmpSynchronousSpeed,
      loadEstimation: this.tmpLoadEstimation
    });
    // this.calculate.emit(true);
  }


}
