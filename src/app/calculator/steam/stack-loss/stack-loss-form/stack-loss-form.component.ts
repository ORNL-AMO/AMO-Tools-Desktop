import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-stack-loss-form',
    templateUrl: './stack-loss-form.component.html',
    styleUrls: ['./stack-loss-form.component.css'],
    standalone: false
})
export class StackLossFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  stackLossForm: UntypedFormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<UntypedFormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  method: number;
  @Input()
  inModal: boolean;
  
  constructor() { }

  ngOnInit() {
  }

  calculate(form: UntypedFormGroup) {
    this.emitCalculate.emit(form);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

}
