import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService, GasCoolingForm } from './cooling-form.service';
import { CoolingLossWarnings, getGasCoolingWarnings } from './cooling-warnings';

@Component({
  selector: 'app-gas-cooling-form',
  standalone: false,
  templateUrl: './gas-cooling-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GasCoolingFormComponent implements OnInit {
  readonly form = input.required<GasCoolingForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly formService = inject(CoolingFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly warnings = signal<CoolingLossWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.warnings.set(getGasCoolingWarnings(this.formService.buildCoolingLoss(this.form()).gasCoolingLoss));
    });
  }
}
