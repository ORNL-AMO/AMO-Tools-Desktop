import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Settings } from '../../../../../shared/models/settings';
import { GasLoadChargeMaterial } from '../../../../../shared/models/materials';
import { GasLoadMaterialDbService } from '../../../../../indexedDb/gas-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { convertDbValue, convertForSave, formValueDiffersFromMaterial } from '../charge-material-db-material.util';
import { MaterialSelector } from '../material-selector';
import { GasMaterialForm, GasMaterialFormService } from './gas-material-form.service';
import { AddGasMaterialModalComponent } from './add-gas-material-modal.component';
import { UnitConversion } from '../../../../models/unit-conversion';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-charge-material-gas-form',
  standalone: false,
  templateUrl: './charge-material-gas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialGasFormComponent implements OnInit {
  readonly form = input.required<GasMaterialForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly formService = inject(GasMaterialFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly UNITS = CHARGE_MATERIAL_UNITS;
  readonly materialSelector = new MaterialSelector<GasLoadChargeMaterial, GasMaterialForm>({
    form: this.form,
    settings: this.settings,
    dbService: inject(GasLoadMaterialDbService),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddGasMaterialModalComponent,
    setProperties: (material, form, settings) => form.patchValue({
      specificHeatOfGas: convertDbValue(material.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, settings),
    }),
    buildRecoveryProperties: (v, settings) => ({
      specificHeatVapor: convertForSave(v.specificHeatOfGas, CHARGE_MATERIAL_UNITS.specificHeat, settings),
    }),
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const materialId = this.form().controls.materialId.value;
      const material = materials.find(m => m.id === materialId);
      if (material && this.form().controls.specificHeatOfGas.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });

    this.form().controls.chargeMaterialDischargeTemperature.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.formService.setInitialTempValidator(this.form()));
  }

  differs(formValue: number, dbValue: number | undefined, unit: UnitConversion): boolean {
    return formValueDiffersFromMaterial(formValue, dbValue, unit, this.settings());
  }
}
