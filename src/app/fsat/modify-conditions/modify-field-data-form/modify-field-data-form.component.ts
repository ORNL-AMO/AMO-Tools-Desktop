import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HelpPanelService } from '../../help-panel/help-panel.service';

@Component({
  selector: 'app-modify-field-data-form',
  templateUrl: './modify-field-data-form.component.html',
  styleUrls: ['./modify-field-data-form.component.css']
})
export class ModifyFieldDataFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  fsat: FSAT;
  @Input()
  modificationIndex: number;
  @Input()
  loadEstimationMethod: string;
  @Input()
  baseline: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FSAT>();
  
  modifyFieldDataForm: FormGroup;
  marginError: string = null;
  constructor(private formBuilder: FormBuilder, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.getForm();
    this.optimizeCalc(this.modifyFieldDataForm.controls.optimizeCalculation.value);
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.modificationIndex && !changes.modificationIndex.firstChange){
      this.getForm();
    }
  }

  getForm(){
    this.modifyFieldDataForm = this.formBuilder.group({
      sizeMargin: [this.fsat.fanMotor.sizeMargin],
      implementationCosts: [this.fsat.implementationCosts],
      optimizeCalculation: [this.fsat.fanMotor.optimize]
    })
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }


  optimizeCalc(bool: boolean) {
    if (!bool || !this.selected) {
      this.modifyFieldDataForm.controls.sizeMargin.disable();
      // this.modifyFieldDataForm.controls.fixedSpeed.disable();
    } else {
      this.modifyFieldDataForm.controls.sizeMargin.enable();
      // this.modifyFieldDataForm.controls.fixedSpeed.enable();
    }
    this.modifyFieldDataForm.patchValue({
      optimizeCalculation: bool
    });
    this.save();
  }

  save(){
    this.fsat.implementationCosts = this.modifyFieldDataForm.controls.implementationCosts.value;
    this.fsat.fanMotor.sizeMargin = this.modifyFieldDataForm.controls.sizeMargin.value;
    this.fsat.fanMotor.optimize = this.modifyFieldDataForm.controls.optimizeCalculation.value;
    this.emitSave.emit(this.fsat);
  }
  checkMargin(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    if (this.modifyFieldDataForm.controls.sizeMargin.value > 100) {
      this.marginError = "Unrealistic size margin, shouldn't be greater then 100%";
      return false;
    }
    else if (this.modifyFieldDataForm.controls.sizeMargin.value < 0) {
      this.marginError = "Shouldn't have negative size margin";
      return false;
    }
    else {
      this.marginError = null;
      return true;
    }
  }

}
