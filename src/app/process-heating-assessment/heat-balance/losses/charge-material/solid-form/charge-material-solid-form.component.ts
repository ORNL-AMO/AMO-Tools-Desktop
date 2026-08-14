import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { SolidLoadMaterialDbService } from '../../../../../indexedDb/solid-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { convertDbValue, formValueDiffersFromMaterial } from '../charge-material-db-material.util';
import { MaterialSelector } from '../material-selector';
import { EMPTY_WARNINGS, SolidMaterialForm, SolidMaterialFormService, SolidMaterialWarnings } from './solid-material-form.service';
import { AddSolidMaterialModalComponent } from './add-solid-material-modal.component';
import { UnitConversion } from '../../../../models/unit-conversion';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-charge-material-solid-form',
  standalone: false,
  templateUrl: './charge-material-solid-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialSolidFormComponent implements OnInit {
  readonly form = input.required<SolidMaterialForm>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(SolidMaterialFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly UNITS = CHARGE_MATERIAL_UNITS;
  readonly warnings = signal<SolidMaterialWarnings>(EMPTY_WARNINGS);
  readonly materialSelector = new MaterialSelector<SolidLoadChargeMaterial, SolidMaterialForm>({
    form: this.form,
    settings: this.settings,
    dbService: inject(SolidLoadMaterialDbService),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddSolidMaterialModalComponent,
    setProperties: (material, form, settings) => form.patchValue({
      materialSpecificHeatOfSolidMaterial: convertDbValue(material.specificHeatSolid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      materialLatentHeatOfFusion: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, settings),
      materialHeatOfLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      materialMeltingPoint: convertDbValue(material.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, settings),
    }),
    buildRecoveryProperties: v => ({
      specificHeatSolid: v.materialSpecificHeatOfSolidMaterial,
      latentHeat: v.materialLatentHeatOfFusion,
      specificHeatLiquid: v.materialHeatOfLiquid,
      meltingPoint: v.materialMeltingPoint,
    }),
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const materialId = this.form().controls.materialId.value;
      const material = materials.find(m => m.id === materialId);
      if (material && this.form().controls.materialSpecificHeatOfSolidMaterial.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });

    this.form().controls.chargeMaterialDischargeTemperature.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.formService.setInitialTempValidator(this.form()));

    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const solid = this.formService.buildSolidChargeMaterial(this.form()).solidChargeMaterial;
      this.warnings.set(this.formService.checkSolidWarnings(solid));
    });
  }

  differs(formValue: number, dbValue: number | undefined, unit: UnitConversion): boolean {
    return formValueDiffersFromMaterial(formValue, dbValue, unit, this.settings());
  }
}
