import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-steam-leak-survey-help',
  templateUrl: './steam-leak-survey-help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SteamLeakSurveyHelpComponent {
    readonly currentField = input<string>('default');
    readonly settings = input.required<Settings>();
}