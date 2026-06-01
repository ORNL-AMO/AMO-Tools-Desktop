import { Component, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-steam-leak-survey-tab-content',
  template: `
    <div class="p-3">
      <p class="mb-2">Steam Leak Survey UI is being wired.</p>
      <p class="mb-0 text-muted">Settings loaded: {{ !!settings }}</p>
    </div>
  `
})
export class SteamLeakSurveyTabContentComponent {
  @Input() settings: Settings;
}
