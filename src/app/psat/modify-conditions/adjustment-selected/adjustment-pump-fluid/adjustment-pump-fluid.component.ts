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

}
