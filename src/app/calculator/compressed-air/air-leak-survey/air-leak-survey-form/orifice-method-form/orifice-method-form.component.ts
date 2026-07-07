import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { OrificeFormControls } from '../air-leak-survey-form.service';

@Component({
  selector: 'app-survey-orifice-method-form',
  templateUrl: './orifice-method-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SurveyOrificeMethodFormComponent {
  readonly form = input.required<FormGroup<OrificeFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
