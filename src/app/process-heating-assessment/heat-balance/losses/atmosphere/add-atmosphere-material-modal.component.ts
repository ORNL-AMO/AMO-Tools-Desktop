import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { convertForSave } from '../charge-material/charge-material-db-material.util';
import { ATMOSPHERE_UNITS } from './atmosphere-units';
import { adaptAtmosphereMaterialDb } from '../charge-material/material-db.adapters';

@Component({
  selector: 'app-add-atmosphere-material-modal',
  standalone: false,
  templateUrl: './add-atmosphere-material-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAtmosphereMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<AtmosphereSpecificHeat>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly materialDb = adaptAtmosphereMaterialDb(inject(AtmosphereDbService));

  readonly settings = this.data.settings;

  readonly form = this.formBuilder.group({
    substance: ['', Validators.required],
    specificHeat: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const material: AtmosphereSpecificHeat = {
      substance: v.substance,
      specificHeat: convertForSave(v.specificHeat, ATMOSPHERE_UNITS.specificHeat, this.settings),
      isDefault: false,
    };
    this.materialDb.addMaterial(material).subscribe(inserted => {
      this.dialogRef.close(inserted);
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
