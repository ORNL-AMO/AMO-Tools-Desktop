import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { SolidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { SolidLoadMaterialDbService } from '../../../../../indexedDb/solid-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-solid-material-modal',
  standalone: false,
  templateUrl: './add-solid-material-modal.component.html',
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
    specificHeatSolid: [null, [Validators.required, Validators.min(0)]],
    specificHeatLiquid: [null, [Validators.required, Validators.min(0)]],
    latentHeat: [null, [Validators.required, Validators.min(0)]],
    meltingPoint: [null, Validators.required],
  });

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
