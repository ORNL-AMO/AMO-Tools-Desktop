import { Component, OnInit, Input } from '@angular/core';
import { Adjustment } from '../../../../shared/models/psat';
@Component({
  selector: 'app-adjustment-pump-fluid',
  templateUrl: './adjustment-pump-fluid.component.html',
  styleUrls: ['./adjustment-pump-fluid.component.css']
})
export class AdjustmentPumpFluidComponent implements OnInit {
  @Input()
  adjustmentForm: any;
  constructor() { }

  ngOnInit() {
  }

  addNum(str: string) {
    if (str == 'viscosity') {
      this.adjustmentForm.value.viscosity++;
    } else if (str == 'stages') {
      this.adjustmentForm.value.stages++;
    }
  }

  subtractNum(str: string) {
    if (str == 'viscosity') {
      if (this.adjustmentForm.value.viscosity != 0) {
        this.adjustmentForm.value.viscosity--;
      }
    } else if (str == 'stages') {
      if (this.adjustmentForm.value.stages != 0) {
        this.adjustmentForm.value.stages--;
      }
    }
  }
}
