import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { DryerType } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-compressed-air-dryer-form',
  templateUrl: './compressed-air-dryer-form.component.html',
  styleUrl: './compressed-air-dryer-form.component.css',
  standalone: false,
})
export class CompressedAirDryerFormComponent {
  @Input() form: UntypedFormGroup;
  @Input() settings: Settings;
  @Output() calculate = new EventEmitter<boolean>();
  @Output() changeField = new EventEmitter<string>();

  dryerType = DryerType;

  onFormChange(): void {
    this.calculate.emit(true);
  }

  focusField(str: string): void {
    this.changeField.emit(str);
  }
}
