import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { DecibelFormControls } from '../air-leak-survey-form.service';

@Component({
  selector: 'app-survey-decibel-method-form',
  templateUrl: './decibel-method-form.component.html',
  styleUrls: ['./decibel-method-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SurveyDecibelMethodFormComponent {
  readonly form = input.required<FormGroup<DecibelFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
