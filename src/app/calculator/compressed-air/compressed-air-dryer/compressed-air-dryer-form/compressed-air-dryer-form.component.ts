import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { DryerOperatingCostOutput } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-compressed-air-dryer-form',
  templateUrl: './compressed-air-dryer-form.component.html',
  styleUrl: './compressed-air-dryer-form.component.css',
  standalone: false,
})
export class CompressedAirDryerFormComponent {
  @Input() form: UntypedFormGroup;
  @Input() settings: Settings;
  @Input() dryerOutput: DryerOperatingCostOutput;
  @Output() calculate = new EventEmitter<boolean>();
  @Output() changeField = new EventEmitter<string>();

  get purgeScfm(): number {
    const purgeRate = +(this.form?.controls?.purgeRate?.value ?? 0);
    const flowRate = +(this.form?.controls?.flowRate?.value ?? 0);
    return (purgeRate / 100) * flowRate;
  }

  onFormChange(): void {
    this.calculate.emit(true);
  }

  focusField(str: string): void {
    this.changeField.emit(str);
  }
}
