import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ReplaceExistingData } from '../replace-existing.component';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-replace-existing-form',
  templateUrl: './replace-existing-form.component.html',
  styleUrls: ['./replace-existing-form.component.css']
})
export class ReplaceExistingFormComponent implements OnInit {
  @Input()
  inputs: ReplaceExistingData;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ReplaceExistingData>();
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
