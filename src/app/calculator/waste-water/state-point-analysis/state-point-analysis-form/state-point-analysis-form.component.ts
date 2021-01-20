import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
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

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  form: FormGroup;
  selectedSviParameter: string;

  sviParameters: Array<{ value: number, display: string }>;
  constructor(private statePointAnalysisService: StatePointAnalysisService,
              private statePointAnalysisFormService: StatePointAnalysisFormService,
              private cd: ChangeDetectorRef
              ) { }

  ngOnInit() {
    this.sviParameters = this.statePointAnalysisService.sviParameters;
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
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
    })
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
      this.form.controls.MLSS.disable();
    }
    this.cd.detectChanges();
  }

  setForm() {
    let statePointAnalysisInput: StatePointAnalysisInput;
    if (this.isBaseline) {
      statePointAnalysisInput = this.statePointAnalysisService.baselineData.getValue();
    } else {
      statePointAnalysisInput = this.statePointAnalysisService.modificationData.getValue();
    }

    if (statePointAnalysisInput) {
      this.form = this.statePointAnalysisFormService.getFormFromInput(statePointAnalysisInput);
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

}
