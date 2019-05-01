import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-lighting-replacement-form',
  templateUrl: './lighting-replacement-form.component.html',
  styleUrls: ['./lighting-replacement-form.component.css']
})
export class LightingReplacementFormComponent implements OnInit {
  @Input()
  form: FormGroup;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<{ form: FormGroup, index: number, isBaseline: boolean }>();
  @Output('emitRemoveFixture')
  emitRemoveFixture = new EventEmitter<{ index: number, isBaseline: boolean }>();
  @Input()
  index: number;
  @Output('emitFocusField')
  emitFocusField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;

  idString: string;
  isEditingName: boolean = false;
  constructor() { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.calculate();
  }

  calculate() {
    if (this.form.valid) {
      let emitObj = {
        form: this.form,
        index: this.index,
        isBaseline: this.isBaseline
      };
      this.emitCalculate.emit(emitObj);
    }
  }

  focusField(str: string) {
    this.emitFocusField.emit(str);
  }

  removeFixture(i: number) {
    this.emitRemoveFixture.emit({ index: i, isBaseline: this.isBaseline });
  }

  editFixtureName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusOut() {
  }
}
