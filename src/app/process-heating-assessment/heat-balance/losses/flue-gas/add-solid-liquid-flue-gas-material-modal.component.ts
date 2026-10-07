import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { startWith, take } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { adaptSolidLiquidFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { DIFFERENCE_TOLERANCE_PERCENT, FLUE_GAS_FUEL_ANALYSIS, PERCENT_VALIDATORS } from './flue-gas-form.service';

@Component({
  selector: 'app-add-solid-liquid-flue-gas-material-modal',
  standalone: false,
  templateUrl: './add-solid-liquid-flue-gas-material-modal.component.html',
  styleUrl: '../add-material-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSolidLiquidFlueGasMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<SolidLiquidFlueGasMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);
  private readonly materialDb = adaptSolidLiquidFlueGasMaterialDb(inject(SolidLiquidMaterialDbService));
  private readonly convertUnitsService = inject(ConvertUnitsService);

  readonly settings = this.data.settings;
  readonly fuelAnalysis = FLUE_GAS_FUEL_ANALYSIS;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    carbon: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    hydrogen: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    sulphur: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    inertAsh: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    o2: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    moisture: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
    nitrogen: this.formBuilder.control<number | null>(null, PERCENT_VALIDATORS),
  });

  readonly materials = signal<SolidLiquidFlueGasMaterial[]>([]);
  private readonly analysis = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), { requireSync: true });

  readonly totalOfComponents = computed(() => FLUE_GAS_FUEL_ANALYSIS.reduce((sum, { key }) => sum + (this.analysis()[key] ?? 0), 0));
  readonly difference = computed(() => 100 - this.totalOfComponents());
  readonly hasLargeDifference = computed(() => Math.abs(this.difference()) > DIFFERENCE_TOLERANCE_PERCENT);

  /** Shown in the settings units; the saved material stays in Btu/lb. */
  readonly heatingValue = computed(() => {
    const values = this.analysis();
    if (FLUE_GAS_FUEL_ANALYSIS.some(({ key }) => values[key] == null)) return null;
    const { substance, ...analysis } = this.form.getRawValue();
    const heatingValue = this.processHeatingApiService.flueGasByMassCalculateHeatingValue(analysis);
    if (Number.isNaN(heatingValue)) return null;
    return this.settings.unitsOfMeasure === 'Metric'
      ? this.convertUnitsService.value(heatingValue).from('btuLb').to('kJkg')
      : heatingValue;
  });

  constructor() {
    this.materialDb.getAllWithObservable().pipe(take(1), takeUntilDestroyed()).subscribe(materials => this.materials.set(materials));
  }

  /** Starts a new fuel from an existing one, marked "(mod)" so the name stays distinct. */
  applyExistingMaterial(material: SolidLiquidFlueGasMaterial | null): void {
    if (!material) return;
    this.form.patchValue({
      substance: `${material.substance} (mod)`,
      ...Object.fromEntries(FLUE_GAS_FUEL_ANALYSIS.map(({ key }) => [key, material[key]])),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { substance, ...analysis } = this.form.getRawValue();
    const heatingValue = this.processHeatingApiService.flueGasByMassCalculateHeatingValue(analysis);
    const material: SolidLiquidFlueGasMaterial = { substance, ...analysis, heatingValue, isDefault: false };
    this.materialDb.addWithObservable(material).subscribe(inserted => this.dialogRef.close(inserted));
  }

  close(): void {
    this.dialogRef.close();
  }
}
