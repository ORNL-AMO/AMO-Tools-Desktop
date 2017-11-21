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
    if (!this.tmpMeasuredSpeed || !this.tmpNameplateFullLoadSpeed) {
      return;
    }

    let diff = this.synchronousSpeeds[this.synchronousSpeeds.length - 1];
    this.synchronousSpeeds.forEach( (val) => {
      if (Math.abs(this.tmpNameplateFullLoadSpeed - val) < diff) {
        diff = Math.abs(this.tmpNameplateFullLoadSpeed - val);
        this.tmpSynchronousSpeed = val;
      }
    });

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
