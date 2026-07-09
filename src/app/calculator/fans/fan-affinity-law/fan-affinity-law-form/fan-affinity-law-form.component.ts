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
    { display: 'N/A', value: 3 }
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

  // Actual Flow only affects the calculation when Current Motor Control is VSD or Two-Speed
  // (see FanAffinityLaws::compute()). When switching to On/Off, keep the hidden field in sync
  // with Rated Flow so a stale value can't push flowPercentBaseline out of its valid 0-100 range.
  onCurrentControlChange() {
    if (this.fanAffinityLawForm.controls.motorControlTypeCurrent.value === 0) {
      this.fanAffinityLawForm.controls.actualFlow.patchValue(this.fanAffinityLawForm.controls.ratedFlow.value);
    }
    this.emitCalculate();
  }

}
