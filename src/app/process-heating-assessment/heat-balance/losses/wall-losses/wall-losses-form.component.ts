import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateFormControlIds, FormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { WallLossForm, WallLossesFormService } from './wall-losses-form.service';
import { WallLossItem, WallLossesService } from './wall-losses.service';

@Component({
  selector: 'app-wall-losses-form',
  standalone: false,
  templateUrl: './wall-losses-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallLossesFormComponent implements OnInit {
  readonly item = input.required<WallLossItem>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(WallLossesFormService);
  private readonly wallLossesService = inject(WallLossesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly surfaceOptions = computed(() => this.wallLossesService.surfaceOptions());
  readonly form = computed(() => this.item().form as WallLossForm);
  controlIds: FormControlIds<WallLossForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);

    this.form().controls.ambientTemp.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formService.setSurfaceTempValidator(this.form()));
  }

  setConditionFactor(): void {
    const shapeId = this.form().controls.surfaceShape.value;
    const surface = this.surfaceOptions().find(s => s.id === shapeId);
    if (surface) {
      this.form().controls.conditionFactor.setValue(surface.conditionFactor, { emitEvent: false });
      this.wallLossesService.updateItem(this.item().id);
    }
  }
}
