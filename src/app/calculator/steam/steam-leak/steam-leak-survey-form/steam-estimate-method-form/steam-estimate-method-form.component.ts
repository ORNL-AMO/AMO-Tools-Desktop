import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';
import { EstimateFormControls } from '../steam-leak-survey-form.service';
import { SteamLeakPressureReductionMethod } from '../../steam-leak-constants';

@Component({
  selector: 'app-steam-estimate-method-form',
  templateUrl: './steam-estimate-method-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SteamEstimateMethodFormComponent {
  readonly pressureReductionMethods = input.required<Array<{ display: string; value: number }>>();
  readonly form = input.required<FormGroup<EstimateFormControls>>();
  readonly settings = input.required<Settings>();
  readonly fieldFocused = output<string>();

  protected readonly SteamLeakPressureReductionMethod = SteamLeakPressureReductionMethod;
}
