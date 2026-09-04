import { ChangeDetectionStrategy, Component, computed, input, OnInit } from '@angular/core';
import { generateFormControlIds, FormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { ExtendedSurfaceForm } from './extended-surface-form.service';
import { ExtendedSurfaceItem } from './extended-surface.service';

@Component({
  selector: 'app-extended-surface-form',
  standalone: false,
  templateUrl: './extended-surface-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedSurfaceFormComponent implements OnInit {
  readonly item = input.required<ExtendedSurfaceItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as ExtendedSurfaceForm);
  controlIds: FormControlIds<ExtendedSurfaceForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);
  }
}
