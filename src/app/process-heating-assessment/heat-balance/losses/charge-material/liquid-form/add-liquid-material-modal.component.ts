import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-liquid-material-modal',
  standalone: false,
  templateUrl: './add-liquid-material-modal.component.html',
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
    specificHeatLiquid: [null, [Validators.required, Validators.min(0)]],
    specificHeatVapor: [null, [Validators.required, Validators.min(0)]],
    latentHeat: [null, [Validators.required, Validators.min(0)]],
    vaporizationTemperature: [null, Validators.required],
  });

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
