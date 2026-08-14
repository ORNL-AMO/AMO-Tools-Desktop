import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { GasLoadChargeMaterial } from '../../../../../shared/models/materials';
import { GasLoadMaterialDbService } from '../../../../../indexedDb/gas-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { convertForSave } from '../charge-material-db-material.util';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-add-gas-material-modal',
  standalone: false,
  templateUrl: './add-gas-material-modal.component.html',
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
    specificHeatVapor: [null, [Validators.required, Validators.min(0)]],
  });

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
