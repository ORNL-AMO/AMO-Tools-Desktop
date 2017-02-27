import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Adjustment } from '../../../shared/models/psat';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-adjustment-selected',
  templateUrl: './adjustment-selected.component.html',
  styleUrls: ['./adjustment-selected.component.css']
})
export class AdjustmentSelectedComponent implements OnInit {
  @Input()
  adjustmentForm: any;
  @Input()
  adjustment: Adjustment;
  @Output('adjustmentRemove')
  adjustmentRemove = new EventEmitter<string>();
  @Output('adjustmentSelect')
  adjustmentSelect = new EventEmitter<string>();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    //this.adjustmentForm = this.initForm();
  }

  removeAdjustment(){
    this.adjustmentRemove.emit(this.adjustment.name);
  }

  selectAdjustment(){
   // this.adjustmentSelect.emit(this.adjustment.name);
  }
}
