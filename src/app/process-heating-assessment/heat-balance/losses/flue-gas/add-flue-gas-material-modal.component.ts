import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, startWith, take } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { adaptFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { DIFFERENCE_TOLERANCE_PERCENT, FLUE_GAS_COMPONENTS, PERCENT_VALIDATORS } from './flue-gas-form.service';

@Component({
  selector: 'app-add-flue-gas-material-modal',
  standalone: false,
  templateUrl: './add-flue-gas-material-modal.component.html',
  styleUrl: '../add-material-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFlueGasMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<FlueGasMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);
  private readonly materialDb = adaptFlueGasMaterialDb(inject(FlueGasMaterialDbService));
  private readonly convertUnitsService = inject(ConvertUnitsService);

  readonly settings = this.data.settings;
  readonly components = FLUE_GAS_COMPONENTS;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    CH4: [null as number | null, PERCENT_VALIDATORS],
    C2H6: [null as number | null, PERCENT_VALIDATORS],
    N2: [null as number | null, PERCENT_VALIDATORS],
    H2: [null as number | null, PERCENT_VALIDATORS],
    C3H8: [null as number | null, PERCENT_VALIDATORS],
    C4H10_CnH2n: [null as number | null, PERCENT_VALIDATORS],
    H2O: [null as number | null, PERCENT_VALIDATORS],
    CO: [null as number | null, PERCENT_VALIDATORS],
    CO2: [null as number | null, PERCENT_VALIDATORS],
    SO2: [null as number | null, PERCENT_VALIDATORS],
    O2: [null as number | null, PERCENT_VALIDATORS],
  });

  readonly materials = signal<FlueGasMaterial[]>([]);
  private readonly composition = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), { requireSync: true });

  readonly totalOfComponents = computed(() => FLUE_GAS_COMPONENTS.reduce((sum, component) => sum + (this.composition()[component] ?? 0), 0));
  readonly difference = computed(() => 100 - this.totalOfComponents());
  readonly hasLargeDifference = computed(() => Math.abs(this.difference()) > DIFFERENCE_TOLERANCE_PERCENT);

  /** Heating values shown in the settings units; the saved material stays in Btu/lb and Btu/scf. */
  readonly calculatedProperties = computed(() => {
    const values = this.composition();
    if (FLUE_GAS_COMPONENTS.some(component => values[component] == null)) return null;
    const { substance, ...composition } = this.form.getRawValue();
    const result = this.processHeatingApiService.flueGasByVolumeCalculateHeatingValue(composition);
    if ([result.heatingValue, result.heatingValueVolume, result.specificGravity].some(Number.isNaN)) return null;
    if (this.settings.unitsOfMeasure !== 'Metric') return result;
    return {
      ...result,
      heatingValue: this.convertUnitsService.value(result.heatingValue).from('btuLb').to('kJkg'),
      heatingValueVolume: this.convertUnitsService.value(result.heatingValueVolume).from('btuscf').to('kJNm3'),
    };
  });

  constructor() {
    this.materialDb.getAllWithObservable().pipe(take(1), takeUntilDestroyed()).subscribe(materials => this.materials.set(materials));
  }

  /** Starts a new fuel from an existing one, marked "(mod)" so the name stays distinct. */
  applyExistingMaterial(material: FlueGasMaterial | null): void {
    if (!material) return;
    this.form.patchValue({
      substance: `${material.substance} (mod)`,
      ...Object.fromEntries(FLUE_GAS_COMPONENTS.map(component => [component, material[component]])),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { substance, ...composition } = this.form.getRawValue();
    const heatingValues = this.processHeatingApiService.flueGasByVolumeCalculateHeatingValue(composition);
    const material: FlueGasMaterial = { substance, ...composition, ...heatingValues, isDefault: false };
    const saved: Observable<FlueGasMaterial> = this.materialDb.addWithObservable(material);
    saved.subscribe(inserted => this.dialogRef.close(inserted));
  }

  close(): void {
    this.dialogRef.close();
  }
}
