import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Adjustment } from '../../../shared/models/psat';

@Component({
  selector: 'app-adjustment',
  templateUrl: './adjustment.component.html',
  styleUrls: ['./adjustment.component.css']
})
export class AdjustmentComponent implements OnInit {
  @Input()
  adjustment: Adjustment;
  @Output('adjustmentRemove')
  adjustmentRemove = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  removeAdjustment(){
    this.adjustmentRemove.emit(this.adjustment.name);
  }
}
