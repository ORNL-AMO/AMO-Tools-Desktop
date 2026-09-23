import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { GasCoolingForm } from './cooling-form.service';
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

  private readonly destroyRef = inject(DestroyRef);

  readonly warnings = signal<CoolingLossWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const v = this.form().getRawValue();
      this.warnings.set(getGasCoolingWarnings({
        specificHeat: v.specificHeat ?? undefined,
        gasDensity: v.gasDensity ?? undefined,
        flowRate: v.flowRate ?? undefined,
        initialTemperature: v.inletTemp ?? undefined,
        outletTemperature: v.outletTemp ?? undefined,
      }));
    });
  }
}
