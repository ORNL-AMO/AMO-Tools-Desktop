import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { SolidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { SolidLoadMaterialDbService } from '../../../../../indexedDb/solid-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertDbValue, convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-solid-material-modal',
  standalone: false,
  templateUrl: './add-solid-material-modal.component.html',
  styleUrl: '../../add-material-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSolidMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<SolidLoadChargeMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly solidLoadMaterialDbService = inject(SolidLoadMaterialDbService);

  readonly settings = this.data.settings;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    specificHeatSolid: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    specificHeatLiquid: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    latentHeat: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    meltingPoint: this.formBuilder.control<number | null>(null, Validators.required),
  });

  readonly materials = signal<SolidLoadChargeMaterial[]>([]);

  constructor() {
    this.solidLoadMaterialDbService.getAllWithObservable().pipe(take(1), takeUntilDestroyed()).subscribe(materials => this.materials.set(materials));
  }

  /** Starts a new material from an existing one, marked "(mod)" so the name stays distinct. */
  applyExistingMaterial(material: SolidLoadChargeMaterial | null): void {
    if (!material) return;
    this.form.patchValue({
      substance: `${material.substance} (mod)`,
      specificHeatSolid: convertDbValue(material.specificHeatSolid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      specificHeatLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      latentHeat: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, this.settings),
      meltingPoint: convertDbValue(material.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, this.settings),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const material: SolidLoadChargeMaterial = {
      substance: v.substance,
      specificHeatSolid: convertForSave(v.specificHeatSolid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      specificHeatLiquid: convertForSave(v.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      latentHeat: convertForSave(v.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, this.settings),
      meltingPoint: convertForSave(v.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, this.settings),
      isDefault: false,
    };
    this.solidLoadMaterialDbService.addWithObservable(material).subscribe(inserted => {
      this.dialogRef.close(inserted);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
