import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-adjustment',
  templateUrl: './adjustment.component.html',
  styleUrls: ['./adjustment.component.css']
})
export class AdjustmentComponent implements OnInit {
  @Input()
  adjustment: PSAT;
  @Output('adjustmentRemove')
  adjustmentRemove = new EventEmitter<string>();
  @Output('adjustmentSelect')
  adjustmentSelect = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  removeAdjustment(){
    this.adjustmentRemove.emit(this.adjustment.name);
  }

  selectAdjustment(){
    this.adjustmentSelect.emit(this.adjustment.name);
  }
}
