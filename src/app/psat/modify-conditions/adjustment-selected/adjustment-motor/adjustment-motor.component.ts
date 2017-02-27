import { Component, OnInit, Input } from '@angular/core';
import { Adjustment } from '../../../../shared/models/psat';

@Component({
  selector: 'app-adjustment-motor',
  templateUrl: './adjustment-motor.component.html',
  styleUrls: ['./adjustment-motor.component.css']
})
export class AdjustmentMotorComponent implements OnInit {
  @Input()
  adjustmentForm: any;
  constructor() { }

  ngOnInit() {
  }
  
   addNum(str: string) {
    if (str == 'motorRPM') {
      this.adjustmentForm.value.motorRPM++;
    } else if (str == 'sizeMargin') {
      this.adjustmentForm.value.sizeMargin++;
    }
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.adjustmentForm.value.motorRPM != 0) {
        this.adjustmentForm.value.motorRPM--;
      }
    } else if (str == 'sizeMargin') {
      if (this.adjustmentForm.value.sizeMargin != 0) {
        this.adjustmentForm.value.sizeMargin--;
      }
    }
  }
}
