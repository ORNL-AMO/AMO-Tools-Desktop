import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { OpeningForm, OpeningFormService } from './opening-form.service';
import { OpeningItem } from './opening.service';

@Component({
  selector: 'app-opening-form',
  standalone: false,
  templateUrl: './opening-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningFormComponent implements OnInit {
  readonly item = input.required<OpeningItem>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(OpeningFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = computed(() => this.item().form as OpeningForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
  readonly isRound = computed(() => this.form().controls.openingType.value === 'Round');

  ngOnInit(): void {
    this.form().controls.openingType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formService.setDimensionValidators(this.form()));

    this.form().controls.insideTemperature.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formService.setAmbientTempValidator(this.form()));
  }
}
