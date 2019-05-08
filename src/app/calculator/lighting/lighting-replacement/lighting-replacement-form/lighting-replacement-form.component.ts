import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { FormGroup } from '@angular/forms';
import { LightingReplacementService } from '../lighting-replacement.service';

@Component({
  selector: 'app-lighting-replacement-form',
  templateUrl: './lighting-replacement-form.component.html',
  styleUrls: ['./lighting-replacement-form.component.css']
})
export class LightingReplacementFormComponent implements OnInit {
  @Input()
  data: LightingReplacementData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<LightingReplacementData>();
  @Output('emitRemoveFixture')
  emitRemoveFixture = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitFocusField')
  emitFocusField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;

  idString: string;
  isEditingName: boolean = false;
  form: FormGroup;

  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    //need to actually use the id string..
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.lightingReplacementService.getFormFromObj(this.data);
  }

  calculate() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.getObjFromForm(this.form);
    this.emitCalculate.emit(tmpObj);
  }

  focusField(str: string) {
    this.emitFocusField.emit(str);
  }

  removeFixture(i: number) {
    this.emitRemoveFixture.emit(this.index);
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
