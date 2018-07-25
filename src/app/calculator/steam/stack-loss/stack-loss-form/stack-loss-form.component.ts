import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stack-loss-form',
  templateUrl: './stack-loss-form.component.html',
  styleUrls: ['./stack-loss-form.component.css']
})
export class StackLossFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  stackLossForm: FormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  method: string;
  
  constructor() { }

  ngOnInit() {
  }

  calculate(form: FormGroup){
    this.emitCalculate.emit(form);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }

}
