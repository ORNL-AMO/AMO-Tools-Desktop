import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { GasLoadChargeMaterial } from '../../../../../shared/models/materials';
import { GasLoadMaterialDbService } from '../../../../../indexedDb/gas-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertDbValue, convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-gas-material-modal',
  standalone: false,
  templateUrl: './add-gas-material-modal.component.html',
  styleUrl: '../../add-material-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGasMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<GasLoadChargeMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly gasLoadMaterialDbService = inject(GasLoadMaterialDbService);

  readonly settings = this.data.settings;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    specificHeatVapor: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  readonly materials = signal<GasLoadChargeMaterial[]>([]);

  constructor() {
    this.gasLoadMaterialDbService.getAllWithObservable().pipe(take(1), takeUntilDestroyed()).subscribe(materials => this.materials.set(materials));
  }

  /** Starts a new material from an existing one, marked "(mod)" so the name stays distinct. */
  applyExistingMaterial(material: GasLoadChargeMaterial | null): void {
    if (!material) return;
    this.form.patchValue({
      substance: `${material.substance} (mod)`,
      specificHeatVapor: convertDbValue(material.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const material: GasLoadChargeMaterial = {
      substance: v.substance,
      specificHeatVapor: convertForSave(v.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      isDefault: false,
    };
    this.gasLoadMaterialDbService.addWithObservable(material).subscribe(inserted => {
      this.dialogRef.close(inserted);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
