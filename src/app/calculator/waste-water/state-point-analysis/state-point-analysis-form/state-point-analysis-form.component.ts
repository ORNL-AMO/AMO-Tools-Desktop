import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { StatePointAnalysisInput } from '../../../../shared/models/waste-water';
import { StatePointAnalysisFormService } from '../state-point-analysis-form.service';
import { StatePointAnalysisService } from '../state-point-analysis.service';

@Component({
  selector: 'app-state-point-analysis-form',
  templateUrl: './state-point-analysis-form.component.html',
  styleUrls: ['./state-point-analysis-form.component.css']
})
export class StatePointAnalysisFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  index: boolean;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  baselineDataSub: Subscription;

  form: UntypedFormGroup;
  sviParameters: Array<{ value: number, display: string }>;
  idString: string;
  
  constructor(private statePointAnalysisService: StatePointAnalysisService,
              private statePointAnalysisFormService: StatePointAnalysisFormService,
              private cd: ChangeDetectorRef
              ) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.sviParameters = this.statePointAnalysisService.sviParameters;
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.baselineDataSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.initFormSetup();
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.statePointAnalysisService.resetData.subscribe(value => {
      this.setForm();
      });
    this.generateExampleSub = this.statePointAnalysisService.generateExample.subscribe(value => {
      this.setForm();
    });
    if (!this.isBaseline) {
      this.baselineDataSub = this.statePointAnalysisService.baselineData.subscribe(updatedBaseline => {
        this.setForm(updatedBaseline);
      });
    }

  }

  initFormSetup() {
    if (this.selected == false) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    if (!this.isBaseline) {
      this.form.controls.sviParameter.disable();
      this.form.controls.sviValue.disable();
      this.form.controls.sludgeSettlingVelocity.disable();
      this.form.controls.numberOfClarifiers.disable();
      this.form.controls.areaOfClarifier.disable();
      this.form.controls.diameter.disable();
      this.form.controls.isUserDefinedArea.disable();
      this.form.controls.MLSS.disable();
    }
    this.cd.detectChanges();
  }

  setForm(updatedBaselineInput?: StatePointAnalysisInput) {
    let statePointAnalysisInput: StatePointAnalysisInput;
    if (this.isBaseline) {
      statePointAnalysisInput = this.statePointAnalysisService.baselineData.getValue();
    } else {
      statePointAnalysisInput = this.statePointAnalysisService.modificationData.getValue();
    }

    if (statePointAnalysisInput) {
      this.form = this.statePointAnalysisFormService.getFormFromInput(statePointAnalysisInput, updatedBaselineInput);
    } else {
      this.form = this.statePointAnalysisFormService.getEmptyForm();
    }

    this.initFormSetup();
  }

  calculate() {
    let input: StatePointAnalysisInput = this.statePointAnalysisFormService.getInputFromForm(this.form)
    if (this.isBaseline) {
      this.statePointAnalysisService.baselineData.next(input);
    } else { 
      this.statePointAnalysisService.modificationData.next(input);
    }
  }

  focusField(str: string) {
    if (str == 'sviValue' && this.form.controls.sviParameter.value == 4) {
      str = 'kValue';
    }
    this.statePointAnalysisService.currentField.next(str);
  }

  showHideInputField() {
    this.form.patchValue({
      isUserDefinedArea: !this.form.controls.isUserDefinedArea.value
    });
    if (!this.form.controls.isUserDefinedArea.value) {
      this.save();
    }
    this.calculate();
  }

  save() {
    if (!this.form.controls.isUserDefinedArea.value) {
      let calculatedArea: number = this.statePointAnalysisService.calculateArea(this.form.controls.diameter.value);
      this.form.patchValue({
        areaOfClarifier: calculatedArea
      })
      this.calculate();
    }
  }

}
