import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { ExtendedSurfaceForm } from './extended-surface-form.service';
import { ExtendedSurfaceItem } from './extended-surface.service';

@Component({
  selector: 'app-extended-surface-form',
  standalone: false,
  templateUrl: './extended-surface-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedSurfaceFormComponent {
  readonly item = input.required<ExtendedSurfaceItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as ExtendedSurfaceForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
}
