import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ReplaceRewindData } from '../replace-rewind.component';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ReplaceRewindService } from '../replace-rewind.service';

@Component({
  selector: 'app-replace-rewind-form',
  templateUrl: './replace-rewind-form.component.html',
  styleUrls: ['./replace-rewind-form.component.css']
})
export class ReplaceRewindFormComponent implements OnInit {
  @Input()
  inputs: ReplaceRewindData;
  @Input()
  isNewMotor: boolean;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ReplaceRewindData>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  form: FormGroup;

  constructor(private replaceRewindService: ReplaceRewindService) { }

  ngOnInit() {
    console.log('form, isNewMotor = ' + this.isNewMotor);
    console.log('this.inputs = ');
    console.log(this.inputs);
    this.form = this.replaceRewindService.getFormFromObj(this.inputs, this.isNewMotor);
    console.log('this.form = ');
    console.log(this.form);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.inputs) {
      this.form = this.replaceRewindService.getFormFromObj(this.inputs, this.isNewMotor);
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.inputs = this.replaceRewindService.getObjFromForm(this.form, this.isNewMotor);
    this.emitCalculate.emit(this.inputs);
  }

}
