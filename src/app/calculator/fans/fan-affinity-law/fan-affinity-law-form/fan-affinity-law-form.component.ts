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

  // Switches Motor Power between direct (metered) entry and an estimate from Nameplate Power.
  // Switching back to metered keeps the last valid estimate as the entered value.
  toggleEstimateMotorPower() {
    const estimate: boolean = !this.fanAffinityLawForm.controls.estimateMotorPower.value;
    this.fanAffinityLawForm.controls.estimateMotorPower.patchValue(estimate);
    if (estimate) {
      // show the Nameplate Power error right away instead of silently zeroing the results
      this.fanAffinityLawForm.controls.nameplatePower.markAsDirty();
    }
    this.emitCalculate();
  }

  // The Flow Rate limit is the new fan's rated flow only once both diameters are set
  // (same condition as FanAffinityLawService.getMaxDesiredFlowVolume); otherwise it's the current Rated Flow.
  flowLimitIsNewFan(): boolean {
    const controls = this.fanAffinityLawForm.controls;
    return controls.changeFanSize.value && controls.diameterFan.value > 0 && controls.diameterFanNew.value > 0;
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
