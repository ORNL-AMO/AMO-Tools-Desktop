import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { roundVal } from '../../shared/helperFunctions';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { MeteredEnergy } from '../../shared/models/phast/meteredEnergy';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingApiService } from '../../tools-suite-api/process-heating-api.service';
import { defaultEnergySources, EnergySource, onlySourceOn } from '../energy-validation/default-energy-sources';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { FuelDescription, MeteredEnergyForm, MeteredEnergyFormService } from './metered-energy-form.service';

@Component({
  selector: 'app-process-heating-metered-energy',
  standalone: false,
  templateUrl: './metered-energy.component.html',
  styleUrl: './metered-energy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeteredEnergyComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly formService = inject(MeteredEnergyFormService);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly form: MeteredEnergyForm = this.formService.getForm(
    this.assessmentService.processHeatingSignal().meteredEnergy,
    defaultEnergySources(this.uiService.heatingSystemConfigurationSignal()),
  );
  readonly fuelForm = this.form.controls.meteredEnergyFuel;
  readonly steamForm = this.form.controls.meteredEnergySteam;
  readonly electricityForm = this.form.controls.meteredEnergyElectricity;

  readonly meteredEnergy: WritableSignal<MeteredEnergy> = signal(this.formService.toMeteredEnergy(this.form));

  private readonly gasFuels: Signal<FlueGasMaterial[]> = toSignal(inject(FlueGasMaterialDbService).dbFlueGasMaterials, { initialValue: [] });
  private readonly solidLiquidFuels: Signal<SolidLiquidFlueGasMaterial[]> =
    toSignal(inject(SolidLiquidMaterialDbService).dbSolidLiquidFlueGasMaterials, { initialValue: [] });
  readonly fuelTypes: Signal<(FlueGasMaterial | SolidLiquidFlueGasMaterial)[]> = computed(() =>
    this.meteredEnergy().meteredEnergyFuel.fuelDescription === 'solidLiquid' ? this.solidLiquidFuels() : this.gasFuels()
  );

  readonly isMetric: Signal<boolean> = computed(() => this.settings()?.unitsOfMeasure === 'Metric');

  /** The only source turned on, whose button is disabled since one source is always required. */
  readonly lockedSource: Signal<EnergySource | undefined> = computed(() => onlySourceOn(this.meteredEnergy()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const meteredEnergy = this.formService.toMeteredEnergy(this.form);
      this.meteredEnergy.set(meteredEnergy);
      this.assessmentService.updateProcessHeatingProperty('meteredEnergy', meteredEnergy);
    });
  }

  toggleSource(source: EnergySource): void {
    this.formService.setSourceEnabled(this.form, source, !this.form.controls[source].value);
  }

  toggleUserDefinedFuelEnergy(): void {
    this.formService.setFuelEnergyUserDefined(this.fuelForm, !this.fuelForm.controls.userDefinedMeteredEnergy.value);
  }

  changeFuelDescription(): void {
    this.fuelForm.patchValue({ fuelType: null, heatingValue: null });
  }

  /** Fills the heating value from the selected fuel, as legacy does. */
  selectFuel(): void {
    const { fuelDescription, fuelType } = this.fuelForm.controls;
    const heatingValue = this.getHeatingValue(fuelDescription.value, fuelType.value);
    if (heatingValue !== undefined) {
      this.fuelForm.controls.heatingValue.setValue(roundVal(heatingValue, 4));
    }
  }

  private getHeatingValue(description: FuelDescription, fuelTypeId: number | null): number | undefined {
    if (description === 'gas') {
      const fuel = this.gasFuels().find(material => material.id === fuelTypeId);
      if (!fuel) return undefined;
      return this.isMetric() ? new ConvertValue(fuel.heatingValueVolume, 'btuscf', 'kJNm3').convertedValue : fuel.heatingValueVolume;
    }
    const fuel = this.solidLiquidFuels().find(material => material.id === fuelTypeId);
    if (!fuel) return undefined;
    const heatingValue = this.processHeatingApiService.flueGasByMassCalculateHeatingValue(fuel);
    return this.isMetric() ? new ConvertValue(heatingValue, 'btuLb', 'kJkg').convertedValue : heatingValue;
  }

  focusField(field: string): void {
    this.uiService.focusedFieldSignal.set(field);
  }
}
