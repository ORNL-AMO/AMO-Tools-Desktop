import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ReplaceExistingData } from '../replace-existing.component';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ReplaceExistingService } from '../replace-existing.service';

@Component({
  selector: 'app-replace-existing-form',
  templateUrl: './replace-existing-form.component.html',
  styleUrls: ['./replace-existing-form.component.css']
})
export class ReplaceExistingFormComponent implements OnInit {
  @Input()
  inputs: ReplaceExistingData;
  @Input()
  isReplacementMotor: boolean;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<ReplaceExistingData>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  form: FormGroup;

  constructor(private replaceExistingService: ReplaceExistingService) { }

  ngOnInit() {
    this.form = this.replaceExistingService.getFormFromObj(this.inputs, this.isReplacementMotor);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.inputs) {
      this.form = this.replaceExistingService.getFormFromObj(this.inputs, this.isReplacementMotor);
      this.calculate();
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  calculate() {
    this.inputs = this.replaceExistingService.getObjFromForm(this.form, this.isReplacementMotor);
    this.emitCalculate.emit(this.inputs);
  }

}
