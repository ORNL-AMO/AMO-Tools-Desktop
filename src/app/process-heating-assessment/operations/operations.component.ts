import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, Injector, input, linkedSignal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { isEqual } from 'lodash';
import { OperatingCosts, OperatingHours } from '../../shared/models/operations';
import { PHAST, PhastCo2SavingsData } from '../models/phast';
import { ScenarioOverrides } from '../models/modification';
import { Settings } from '../../shared/models/settings';
import { Co2SavingsPhastService } from '../../phast/losses/operations/co2-savings-phast/co2-savings-phast.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { OperationsForm, ProcessHeatingOperationsFormService } from '../services/process-heating-operations-form.service';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { OperatingHoursComponent, OperatingHoursDialogData } from '../../shared/operating-hours/operating-hours.component';
import { PhastOperatingCostsComponent, PhastOperatingCostsDialogData } from '../../shared/phast-operating-costs/phast-operating-costs.component';
import { reinitOnScenarioChange } from '../heat-balance/losses/reinit-on-scenario-change';

type OperationsField = keyof OperationsForm;

const COST_FIELDS = ['fuelCost', 'steamCost', 'electricityCost', 'coalCarbonCost', 'electrodeCost', 'otherFuelCost'] as const;

function readField(phast: PHAST | undefined, field: OperationsField): number | undefined {
  return field === 'hoursPerYear' ? phast?.operatingHours?.hoursPerYear : phast?.operatingCosts?.[field];
}

@Component({
  selector: 'app-process-heating-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(ProcessHeatingOperationsFormService);
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly co2Service = inject(Co2SavingsPhastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly heatingSystemConfiguration: Signal<HeatingEquipmentConfiguration> =
    this.uiService.heatingSystemConfigurationSignal;
  readonly HC = HeatingEquipmentConfiguration;

  readonly isBaseline: Signal<boolean> = computed(() => this.scenario() === 'baseline');
  private readonly scenarioPhast: Signal<PHAST | undefined> = computed(() => this.assessmentService.scenarioPhastSignal(this.scenario()));

  /** Fields a modification has changed from the baseline, for the blue "differs from baseline" border. */
  readonly differingFields: Signal<ReadonlySet<OperationsField>> = computed(() => {
    if (this.isBaseline()) return new Set();
    const baseline = this.assessmentService.scenarioPhastSignal('baseline');
    const scenario = this.scenarioPhast();
    const fields: OperationsField[] = ['hoursPerYear', ...COST_FIELDS];
    return new Set(fields.filter(field => (readField(baseline, field) ?? null) !== (readField(scenario, field) ?? null)));
  });

  readonly form: FormGroup<OperationsForm> =
    this.formService.getForm(this.assessmentService.processHeatingSignal(), this.heatingSystemConfiguration());
  readonly implementationCost = new FormControl<number | null>(null);

  // Held per scenario rather than read live: the CO2 section rebuilds its form whenever this reference changes.
  readonly co2SavingsData = linkedSignal<AssessmentScenario, PhastCo2SavingsData>({
    source: this.scenario,
    computation: scenario => untracked(() =>
      this.assessmentService.scenarioPhast(scenario)?.co2SavingsData ?? this.co2Service.getCo2SavingsDataFromSettingsObject(this.settings())
    ),
  });

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => {
      const phast = this.assessmentService.scenarioPhast(scenario);
      if (phast) {
        this.form.reset(this.formService.getForm(phast).getRawValue(), { emitEvent: false });
      }
      this.implementationCost.reset(phast?.implementationCost ?? null, { emitEvent: false });
    });

    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.saveFormData());

    this.implementationCost.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(cost => {
      const scenario = this.scenario();
      if (scenario !== 'baseline') {
        this.assessmentService.updateModificationProperty(scenario, 'implementationCost', cost ?? undefined);
      }
    });

    effect(() => {
      this.formService.applyConfigValidators(this.form, this.heatingSystemConfiguration());
    });
  }

  private saveFormData(): void {
    const { hoursPerYear, ...costs } = this.form.getRawValue();
    const current = this.scenarioPhast();
    const operatingHours: OperatingHours = { ...current?.operatingHours, hoursPerYear };
    const operatingCosts: OperatingCosts = { ...current?.operatingCosts, ...costs };
    if (this.isBaseline()) {
      this.assessmentService.setProcessHeating({ ...this.assessmentService.processHeatingSignal(), operatingHours, operatingCosts });
      return;
    }
    // Only the changed group is written, so a modification doesn't pin baseline values it never edited.
    if (!isEqual(operatingHours, current?.operatingHours)) {
      this.updateScenarioProperty('operatingHours', operatingHours);
    }
    if (!isEqual(operatingCosts, current?.operatingCosts)) {
      this.updateScenarioProperty('operatingCosts', operatingCosts);
    }
  }

  private updateScenarioProperty<K extends keyof ScenarioOverrides>(key: K, value: PHAST[K]): void {
    const scenario = this.scenario();
    if (scenario === 'baseline') {
      this.assessmentService.updateProcessHeatingProperty(key, value);
    } else {
      this.assessmentService.updateModificationProperty(scenario, key, value);
    }
  }

  setFocusedField(field: string): void {
    this.uiService.focusedFieldSignal.set(field);
  }

  updateCo2SavingsData(co2SavingsData: PhastCo2SavingsData): void {
    this.updateScenarioProperty('co2SavingsData', co2SavingsData);
  }

  openOperatingHoursModal(): void {
    const data: OperatingHoursDialogData = {
      operatingHours: this.scenarioPhast()?.operatingHours,
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
    this.updateScenarioProperty('operatingHours', {
      ...this.scenarioPhast()?.operatingHours,
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
