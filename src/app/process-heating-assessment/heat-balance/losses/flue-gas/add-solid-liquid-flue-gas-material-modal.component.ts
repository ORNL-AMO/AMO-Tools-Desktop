import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { adaptSolidLiquidFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { FLUE_GAS_FUEL_ANALYSIS, PERCENT_VALIDATORS } from './flue-gas-form.service';

@Component({
  selector: 'app-add-solid-liquid-flue-gas-material-modal',
  standalone: false,
  templateUrl: './add-solid-liquid-flue-gas-material-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSolidLiquidFlueGasMaterialModalComponent {
  readonly data: MaterialModalData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<SolidLiquidFlueGasMaterial>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);
  private readonly materialDb = adaptSolidLiquidFlueGasMaterialDb(inject(SolidLiquidMaterialDbService));

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
