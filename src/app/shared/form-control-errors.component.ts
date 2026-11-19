import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Use application-wide for form controls using all or any on of: max, min, required, greaterThan
 *
 *   - control: AbstractControl (required) - The form control to validate.
 */
@Component({
  selector: 'app-form-control-errors',
  templateUrl: './form-control-errors.component.html',
  standalone: true,
})
export class FormControlErrorsComponent {
  @Input() control: AbstractControl;

  get showError(): boolean {
    return Boolean(this.control) && this.control.invalid;
  }

  get errorMessages(): string[] {
    if (!this.control || !this.control.errors) return [];
    const errors = this.control.errors;
    const messages: string[] = [];
    if (errors['required']) {
      messages.push('Value Required');
    }
    if (errors['max'] || errors['min'] || errors['greaterThan'] !== undefined) {
      messages.push('Value falls outside allowable range');
    }
    return messages;
  }
}
