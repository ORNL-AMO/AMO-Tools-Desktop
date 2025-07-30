import { Component, inject, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Settings } from '../shared/models/settings';
import { DecimalPipe } from '@angular/common';

/**
 * Use application-wide for form controls using all or any on of: max, min, required
 *
 *   - control: AbstractControl (required) - The form control to validate.
 *   - imperialUnit: string (required) - The unit label for imperial system.
 *   - metricUnit: string (required) - The unit label for metric system.
 *   - defaultUnit: string (optional) - overrides imperial/metric unit selection. Use in case of settings.SomeKindofunit
 *   - numberPipe: string (optional) - Angular number pipe format string, e.g. '1.0-2'.
 */
@Component({
  selector: 'app-form-control-errors',
  templateUrl: './form-control-errors.component.html',
  standalone: true,
})
export class FormControlErrorsComponent {
  @Input() control: AbstractControl;
  @Input() settings: Settings;
  @Input() imperialUnit?: string;
  @Input() metricUnit?: string;
  @Input() defaultUnit?: string;
  @Input() numberPipe?: string;

  private decimalPipe: DecimalPipe = inject(DecimalPipe);

  get showError(): boolean {
    return Boolean(this.control) && this.control.invalid && !this.control.pristine;
  }

  get errorMessages(): string[] {
    if (!this.control || !this.control.errors) return [];
    const errors = this.control.errors;
    const messages: string[] = [];
    if (errors['required']) messages.push('Value Required');
    if (errors['max']) messages.push(`Value can't be greater than ${this.formatNumber(errors['max'].max)}${this.unit}`);
    if (errors['min']) messages.push(`Value can't be less than ${this.formatNumber(errors['min'].min)}${this.unit}`);
    return messages;
  }

  formatNumber(value: number): string {
    if (this.numberPipe && typeof value === 'number') {
      return this.decimalPipe.transform(value, this.numberPipe) ?? value.toString();
    }
    return value != null ? value.toString() : '';
  }

  get unit(): string {
    if (this.defaultUnit) {
      return ` ${this.defaultUnit}`;
    }
    if (this.settings && this.settings.unitsOfMeasure) {
      if (this.settings.unitsOfMeasure === 'Imperial' && this.imperialUnit) {
        return ` ${this.imperialUnit}`;
      }
      if (this.settings.unitsOfMeasure === 'Metric' && this.metricUnit) {
        return ` ${this.metricUnit}`;
      }
    }
    return '';
  }
}
