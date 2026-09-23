import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingFormService, LiquidCoolingForm } from './cooling-form.service';
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

  private readonly formService = inject(CoolingFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly warnings = signal<CoolingLossWarnings | null>(null);

  ngOnInit(): void {
    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.warnings.set(getLiquidCoolingWarnings(this.formService.buildCoolingLoss(this.form()).liquidCoolingLoss));
    });
  }
}
