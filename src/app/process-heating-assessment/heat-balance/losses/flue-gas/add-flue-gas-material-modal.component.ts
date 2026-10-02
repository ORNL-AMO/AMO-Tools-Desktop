import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { adaptFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { FLUE_GAS_COMPONENTS, PERCENT_VALIDATORS } from './flue-gas-form.service';

@Component({
  selector: 'app-add-flue-gas-material-modal',
  standalone: false,
  templateUrl: './add-flue-gas-material-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFlueGasMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<FlueGasMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);
  private readonly materialDb = adaptFlueGasMaterialDb(inject(FlueGasMaterialDbService));

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
