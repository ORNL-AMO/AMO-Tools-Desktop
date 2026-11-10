import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FanAffinityLawService } from '../fan-affinity-law.service';

@Component({
    selector: 'app-fan-affinity-law-form',
    templateUrl: './fan-affinity-law-form.component.html',
    styleUrls: ['./fan-affinity-law-form.component.css'],
    standalone: false
})
export class FanAffinityLawFormComponent implements OnInit {
  @Input()
  fanAffinityLawForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Output('emitChange')
  emitChange = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  currentMotorControlOptions = [
    { display: 'On/Off', value: 0 },
    { display: 'Two-Speed', value: 1 },
    { display: 'VSD', value: 2 }
  ];

  newMotorControlOptions = [
    { display: 'Two-Speed', value: 1 },
    { display: 'VSD', value: 2 },
    { display: 'On/Off', value: 3 }
  ];

  flowModeOptions = [
    { display: 'Percentage', value: 0 },
    { display: 'Volume', value: 1 }
  ];

  constructor(private fanAffinityLawService: FanAffinityLawService) { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.emitChange.emit(str);
  }

  emitCalculate() {
    this.calculate.emit(true);
  }

  // On/Off operates at rated flow; synchronize edits before validation and calculation.
  syncActualFlow() {
    if (this.fanAffinityLawForm.controls.motorControlTypeCurrent.value === 0) {
      this.fanAffinityLawForm.controls.actualFlow.patchValue(this.fanAffinityLawForm.controls.ratedFlow.value);
    }
    this.emitCalculate();
  }

  showHideFlowRate() {
    if(this.fanAffinityLawForm.controls.flowMode.value !== 1) {
      this.fanAffinityLawForm.controls.flowMode.patchValue(1);
    } else if (this.fanAffinityLawForm.controls.flowMode.value !== 0) {
      this.fanAffinityLawForm.controls.flowMode.patchValue(0);
    }
    this.emitCalculate();
  }

}
