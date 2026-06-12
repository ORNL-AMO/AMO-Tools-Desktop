import { ChangeDetectionStrategy, Component, DestroyRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { OperationsForm, ProcessHeatingOperationsFormService } from '../services/process-heating-operations-form.service';

@Component({
  selector: 'app-process-heating-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(ProcessHeatingOperationsFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly processHeating: Signal<PHAST> = this.assessmentService.processHeatingSignal;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  form: FormGroup<OperationsForm>;

  // Step 3 stub — first four fields only, wired for persistence testing.
  // Revisit in Step 5: add remaining fields (production rate, CO₂), operating hours modal,
  // fuel-cost calculator modal, and configuration-gated cost visibility (fuel/steam/electricity
  // shown/hidden per HeatingEquipmentConfiguration, matching the old operations-form pattern).
  ngOnInit(): void {
    this.form = this.formService.getForm(this.processHeating());

    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const { hoursPerYear, fuelCost, steamCost, electricityCost } = this.form.getRawValue();
      const current = this.processHeating();
      this.assessmentService.updateProcessHeatingProperty('operatingHours', {
        ...current.operatingHours,
        hoursPerYear,
      });
      this.assessmentService.updateProcessHeatingProperty('operatingCosts', {
        ...current.operatingCosts,
        fuelCost,
        steamCost,
        electricityCost,
      });
    });
  }

  get hoursPerYear() { return this.form.get('hoursPerYear'); }
  get fuelCost() { return this.form.get('fuelCost'); }
  get steamCost() { return this.form.get('steamCost'); }
  get electricityCost() { return this.form.get('electricityCost'); }
}
