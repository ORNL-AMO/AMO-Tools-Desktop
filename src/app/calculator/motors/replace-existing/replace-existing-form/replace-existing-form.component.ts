import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-replace-existing-form',
  templateUrl: './replace-existing-form.component.html',
  styleUrls: ['./replace-existing-form.component.css']
})
export class ReplaceExistingFormComponent implements OnInit {
  @Input()
  replaceExistingForm: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

}
