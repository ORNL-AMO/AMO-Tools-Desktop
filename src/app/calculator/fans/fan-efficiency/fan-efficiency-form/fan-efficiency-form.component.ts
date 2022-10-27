import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FanTypes } from '../../../../fsat/fanOptions';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-fan-efficiency-form',
  templateUrl: './fan-efficiency-form.component.html',
  styleUrls: ['./fan-efficiency-form.component.css']
})
export class FanEfficiencyFormComponent implements OnInit {
  @Input()
  fanEfficiencyForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Output('emitChange')
  emitChange = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  fanTypes: Array<{ display: string, value: number }>;

  constructor() { }

  ngOnInit() {
    this.fanTypes = FanTypes;
  }


  focusField(str: string) {
    this.emitChange.emit(str);
  }

  emitCalculate() {
    this.calculate.emit(true);
  }

}
