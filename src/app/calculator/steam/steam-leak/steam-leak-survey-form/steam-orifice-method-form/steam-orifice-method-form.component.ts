import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { OrificeFormControls } from '../steam-leak-survey-form.service';

@Component({
  selector: 'app-steam-orifice-method-form',
  templateUrl: './steam-orifice-method-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SteamOrificeMethodFormComponent {
  readonly pressureReductionMethods = input.required<Array<{ display: string; value: number }>>();
  readonly form = input.required<FormGroup<OrificeFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();
}
