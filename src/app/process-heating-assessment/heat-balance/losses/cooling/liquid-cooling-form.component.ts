import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { LiquidCoolingForm } from './cooling-form.service';
import { CoolingLossWarnings, getLiquidCoolingWarnings } from './cooling-warnings';

@Component({
  selector: 'app-liquid-cooling-form',
  standalone: false,
  templateUrl: './liquid-cooling-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidCoolingFormComponent implements OnInit {
  readonly form = input.required<LiquidCoolingForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);

  readonly warnings = signal<CoolingLossWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const v = this.form().getRawValue();
      this.warnings.set(getLiquidCoolingWarnings({
        specificHeat: v.specificHeat ?? undefined,
        density: v.density ?? undefined,
        flowRate: v.flowRate ?? undefined,
        initialTemperature: v.inletTemp ?? undefined,
        outletTemperature: v.outletTemp ?? undefined,
      }));
    });
  }
}
