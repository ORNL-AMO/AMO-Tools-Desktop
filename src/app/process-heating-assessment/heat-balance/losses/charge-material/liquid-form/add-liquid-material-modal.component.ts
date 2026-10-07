import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertDbValue, convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-liquid-material-modal',
  standalone: false,
  templateUrl: './add-liquid-material-modal.component.html',
  styleUrl: '../../add-material-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLiquidMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<LiquidLoadChargeMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly liquidLoadMaterialDbService = inject(LiquidLoadMaterialDbService);

  readonly settings = this.data.settings;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    specificHeatLiquid: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    specificHeatVapor: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    latentHeat: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
    vaporizationTemperature: this.formBuilder.control<number | null>(null, Validators.required),
  });

  readonly materials = signal<LiquidLoadChargeMaterial[]>([]);

  constructor() {
    this.liquidLoadMaterialDbService.getAllWithObservable().pipe(take(1), takeUntilDestroyed()).subscribe(materials => this.materials.set(materials));
  }

  /** Starts a new material from an existing one, marked "(mod)" so the name stays distinct. */
  applyExistingMaterial(material: LiquidLoadChargeMaterial | null): void {
    if (!material) return;
    this.form.patchValue({
      substance: `${material.substance} (mod)`,
      specificHeatLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      specificHeatVapor: convertDbValue(material.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      latentHeat: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, this.settings),
      vaporizationTemperature: convertDbValue(material.vaporizationTemperature, CHARGE_MATERIAL_UNITS.temperature, this.settings),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const material: LiquidLoadChargeMaterial = {
      substance: v.substance,
      specificHeatLiquid: convertForSave(v.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      specificHeatVapor: convertForSave(v.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, this.settings),
      latentHeat: convertForSave(v.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, this.settings),
      vaporizationTemperature: convertForSave(v.vaporizationTemperature, CHARGE_MATERIAL_UNITS.temperature, this.settings),
      isDefault: false,
    };
    this.liquidLoadMaterialDbService.addWithObservable(material).subscribe(inserted => {
      this.dialogRef.close(inserted);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
