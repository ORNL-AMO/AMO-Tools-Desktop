import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-air-leak-survey-help',
  templateUrl: './air-leak-survey-help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AirLeakSurveyHelpComponent {
  readonly currentField = input<string>('default');
  readonly settings = input.required<Settings>();
}
