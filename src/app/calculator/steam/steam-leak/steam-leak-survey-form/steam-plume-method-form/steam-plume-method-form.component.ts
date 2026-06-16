import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { PlumeFormControls } from '../steam-leak-survey-form.service';

@Component({
  selector: 'app-steam-plume-method-form',
  templateUrl: './steam-plume-method-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SteamPlumeMethodFormComponent {
  readonly pressureReductionMethods = input.required<Array<{ display: string; value: number }>>();
  readonly form = input.required<FormGroup<PlumeFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
