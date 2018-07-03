import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ReplaceRewindData } from '../replace-rewind.component';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-replace-rewind-form',
  templateUrl: './replace-rewind-form.component.html',
  styleUrls: ['./replace-rewind-form.component.css']
})
export class ReplaceRewindFormComponent implements OnInit {
  @Input()
  inputs: ReplaceRewindData;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ReplaceRewindData>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string){
    this.emitChangeField.emit(str);
  }

  calculate(){
    this.emitCalculate.emit(this.inputs);
  }

}
