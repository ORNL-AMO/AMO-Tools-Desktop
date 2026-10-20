import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { SlagForm } from './slag-form.service';
import { SlagItem } from './slag.service';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { LossFieldDifferences } from '../loss-compare.util';

@Component({
  selector: 'app-slag-form',
  standalone: false,
  templateUrl: './slag-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlagFormComponent {
  readonly item = input.required<SlagItem>();
  readonly settings = input.required<Settings>();
  readonly differingFields = input<LossFieldDifferences<Slag>>();

  readonly form = computed(() => this.item().form as SlagForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
}
