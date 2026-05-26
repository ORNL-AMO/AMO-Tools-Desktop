import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { EstimateFormControls } from '../air-leak-survey-form.service';

@Component({
  selector: 'app-survey-estimate-method-form',
  templateUrl: './estimate-method-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SurveyEstimateMethodFormComponent {
  readonly form = input.required<FormGroup<EstimateFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
