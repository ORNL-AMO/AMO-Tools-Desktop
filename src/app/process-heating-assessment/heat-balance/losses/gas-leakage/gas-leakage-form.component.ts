import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { GasLeakageWarnings, getGasLeakageWarnings } from './gas-leakage-warnings';
import { GasLeakageForm, GasLeakageFormService } from './gas-leakage-form.service';
import { GasLeakageItem } from './gas-leakage.service';

@Component({
  selector: 'app-gas-leakage-form',
  standalone: false,
  templateUrl: './gas-leakage-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GasLeakageFormComponent implements OnInit {
  readonly item = input.required<GasLeakageItem>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(GasLeakageFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = computed(() => this.item().form as GasLeakageForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));
  readonly warnings = signal<GasLeakageWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.warnings.set(getGasLeakageWarnings(this.formService.buildGasLeakageLoss(this.form()))));
  }
}
