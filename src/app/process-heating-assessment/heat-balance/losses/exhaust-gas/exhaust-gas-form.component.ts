import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { ExhaustGasForm } from './exhaust-gas-form.service';
import { ExhaustGasItem } from './exhaust-gas.service';

@Component({
  selector: 'app-exhaust-gas-form',
  standalone: false,
  templateUrl: './exhaust-gas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExhaustGasFormComponent {
  readonly item = input.required<ExhaustGasItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as ExhaustGasForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
}
