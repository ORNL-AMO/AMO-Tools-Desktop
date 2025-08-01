import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-control-required',
  templateUrl: './form-control-required.component.html',
  standalone: true
})
export class FormControlRequiredComponent {
  @Input() control: AbstractControl;

  get showError(): boolean {
    return Boolean(this.control) && this.control.hasError('required') && !this.control.pristine;
  }
}
