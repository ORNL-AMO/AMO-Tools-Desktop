import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { BagFormControls } from '../air-leak-survey-form.service';

@Component({
  selector: 'app-survey-bag-method-form',
  templateUrl: './bag-method-form.component.html',
  styleUrls: ['./bag-method-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SurveyBagMethodFormComponent {
  readonly form = input.required<FormGroup<BagFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
