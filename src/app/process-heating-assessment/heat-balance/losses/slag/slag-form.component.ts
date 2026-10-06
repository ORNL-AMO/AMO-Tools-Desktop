import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { SlagForm } from './slag-form.service';
import { SlagItem } from './slag.service';

@Component({
  selector: 'app-slag-form',
  standalone: false,
  templateUrl: './slag-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlagFormComponent {
  readonly item = input.required<SlagItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as SlagForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
}
