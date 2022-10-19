import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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

  modifyFieldDataForm: UntypedFormGroup;
  marginError: string = null;
  constructor(private formBuilder: UntypedFormBuilder, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
    this.getForm();
    //this.optimizeCalc(this.modifyFieldDataForm.controls.optimizeCalculation.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.getForm();
    }
  }

  getForm() {
    this.modifyFieldDataForm = this.formBuilder.group({
      implementationCosts: [this.fsat.implementationCosts],
    });
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  save() {
    this.fsat.implementationCosts = this.modifyFieldDataForm.controls.implementationCosts.value;
    this.emitSave.emit(this.fsat);
  }
}
