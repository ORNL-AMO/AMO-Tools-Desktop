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

}
