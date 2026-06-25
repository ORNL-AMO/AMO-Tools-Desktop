import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateFormControlIds, FormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { ExtendedSurfaceForm } from './extended-surface-form.service';
import { ExtendedSurfaceService } from './extended-surface.service';

@Component({
  selector: 'app-extended-surface-form',
  standalone: false,
  templateUrl: './extended-surface-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedSurfaceFormComponent implements OnInit {
  readonly index = input.required<number>();
  readonly settings = input.required<Settings>();

  private readonly extendedSurfaceService = inject(ExtendedSurfaceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = computed(() => this.extendedSurfaceService.surfaces()[this.index()].form as ExtendedSurfaceForm);
  controlIds: FormControlIds<ExtendedSurfaceForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);

    this.form().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.extendedSurfaceService.updateItem(this.index()));
  }
}
