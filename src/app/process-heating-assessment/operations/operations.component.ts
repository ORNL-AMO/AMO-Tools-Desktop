import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { OperatingHours } from '../../shared/models/operations';
import { PHAST, PhastCo2SavingsData } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Co2SavingsPhastService } from '../../phast/losses/operations/co2-savings-phast/co2-savings-phast.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { OperationsForm, ProcessHeatingOperationsFormService } from '../services/process-heating-operations-form.service';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { OperatingHoursComponent, OperatingHoursDialogData } from '../../shared/operating-hours/operating-hours.component';
import { PhastOperatingCostsComponent, PhastOperatingCostsDialogData } from '../../shared/phast-operating-costs/phast-operating-costs.component';

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
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly co2Service = inject(Co2SavingsPhastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);

  readonly processHeating: Signal<PHAST> = this.assessmentService.processHeatingSignal;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly heatingSystemConfiguration: Signal<HeatingEquipmentConfiguration> =
    this.uiService.heatingSystemConfigurationSignal;
  readonly HC = HeatingEquipmentConfiguration;

  form: FormGroup<OperationsForm>;
  co2SavingsData: PhastCo2SavingsData;

  ngOnInit(): void {
    const phast = this.processHeating();
    this.form = this.formService.getForm(phast, this.heatingSystemConfiguration());
    this.co2SavingsData = phast.co2SavingsData
      ?? this.co2Service.getCo2SavingsDataFromSettingsObject(this.settings());

    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.saveFormData());
  }

  private saveFormData(): void {
    const { hoursPerYear, fuelCost, steamCost, electricityCost, coalCarbonCost, electrodeCost, otherFuelCost } =
      this.form.getRawValue();
    const current = this.processHeating();
    this.assessmentService.setProcessHeating({
      ...current,
      operatingHours: { ...current.operatingHours, hoursPerYear },
      operatingCosts: {
        ...current.operatingCosts,
        fuelCost,
        steamCost,
        electricityCost,
        coalCarbonCost,
        electrodeCost,
        otherFuelCost,
      },
    });
  }

  updateCo2SavingsData(co2SavingsData: PhastCo2SavingsData): void {
    this.co2SavingsData = co2SavingsData;
    this.assessmentService.updateProcessHeatingProperty('co2SavingsData', co2SavingsData);
  }

  openOperatingHoursModal(): void {
    const data: OperatingHoursDialogData = {
      operatingHours: this.processHeating().operatingHours,
      showMinutesSeconds: false,
    };
    const dialogRef: DialogRef<OperatingHours, OperatingHoursComponent> = this.modalDialogService.openModal<OperatingHours, OperatingHoursDialogData, OperatingHoursComponent>(
      OperatingHoursComponent, { data }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((operatingHours) => {
      if (operatingHours) {
        this.saveOperatingHours(operatingHours);
      }
    });
  }

  openOperatingCostsModal(): void {
    const data: PhastOperatingCostsDialogData = { settings: this.settings() };
    const dialogRef: DialogRef<number, PhastOperatingCostsComponent> = this.modalDialogService.openModal<number, PhastOperatingCostsDialogData, PhastOperatingCostsComponent>(
      PhastOperatingCostsComponent, { data }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cost) => {
      if (cost !== undefined) {
        const config = this.heatingSystemConfiguration();
        if (config === this.HC.FUEL_FIRED || config === this.HC.ELECTROTECHNOLOGY_EAF) {
          this.form.patchValue({ fuelCost: cost });
        } else if (config === this.HC.STEAM) {
          this.form.patchValue({ steamCost: cost });
        } else {
          this.form.patchValue({ electricityCost: cost });
        }
      }
    });
  }

  saveOperatingHours(operatingHours: OperatingHours): void {
    this.form.patchValue({ hoursPerYear: operatingHours.hoursPerYear }, { emitEvent: false });
    const current = this.processHeating();
    this.assessmentService.updateProcessHeatingProperty('operatingHours', {
      ...current.operatingHours,
      ...operatingHours,
    });
  }

  get hoursPerYear() { return this.form.get('hoursPerYear'); }
  get fuelCost() { return this.form.get('fuelCost'); }
  get steamCost() { return this.form.get('steamCost'); }
  get electricityCost() { return this.form.get('electricityCost'); }
  get coalCarbonCost() { return this.form.get('coalCarbonCost'); }
  get electrodeCost() { return this.form.get('electrodeCost'); }
  get otherFuelCost() { return this.form.get('otherFuelCost'); }
}
