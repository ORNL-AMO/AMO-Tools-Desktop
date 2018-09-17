import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SlipMethod } from '../percent-load-estimation.service';


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

  lineFrequency: number = 60;
  showSynchronousSpeed: boolean = false;
  measuredSpeedError: string = null;
  synchronousSpeedError: string = null;
  nameplateFullLoadSpeedError: string = null;
  synchronousSpeeds: Array<number>;

  constructor() { }

  ngOnInit() {
    this.updateSynchronousSpeeds();
    this.calculate();
  }

  updateSynchronousSpeeds() {
    if (this.lineFrequency == 50) {
      this.synchronousSpeeds = [
        500,
        600,
        750,
        1000,
        1500,
        3000
      ];
    }
    else if (this.lineFrequency == 60) {
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

    if (this.data.nameplateFullLoadSpeed >= this.synchronousSpeeds[this.synchronousSpeeds.length - 1]) {
      this.nameplateFullLoadSpeedError = 'Nameplate Full Load Speed must be less than ' + this.synchronousSpeeds[this.synchronousSpeeds.length - 1];
    }
    if (this.data.measuredSpeed >= this.synchronousSpeeds[this.synchronousSpeeds.length - 1]) {
      this.measuredSpeedError = 'Measured Speed must be less than ' + this.synchronousSpeeds[this.synchronousSpeeds.length - 1];
    }

    for (let i = 0; i < this.synchronousSpeeds.length; i++) {
      if (this.synchronousSpeeds[i] > this.data.nameplateFullLoadSpeed) {
        this.data.synchronousSpeed = this.synchronousSpeeds[i];

        if (this.synchronousSpeeds[i] <= this.data.measuredSpeed) {
          this.measuredSpeedError = 'Measured Speed must be less than the synchronous speed';
        }
        break;
      }
      if (this.data.nameplateFullLoadSpeed === this.synchronousSpeeds[i]) {
        this.synchronousSpeedError = 'Nameplate Full Load Speed cannot equal the Synchronous Speed of ' + this.synchronousSpeeds[i];
      }
    }

    if (!this.data.nameplateFullLoadSpeed) {
      this.showSynchronousSpeed = false;
    } else {
      this.showSynchronousSpeed = true;
    }

    this.emitCalculate.emit(this.data);
  }


}
