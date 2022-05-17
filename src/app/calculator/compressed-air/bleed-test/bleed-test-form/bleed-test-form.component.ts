import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BleedTestInput } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-bleed-test-form',
  templateUrl: './bleed-test-form.component.html',
  styleUrls: ['./bleed-test-form.component.css']
})
export class BleedTestFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: BleedTestInput;
  @Input()
  outputs: number;
  @Output('calculate')
  calculate = new EventEmitter<BleedTestInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  
  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
