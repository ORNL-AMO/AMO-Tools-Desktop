import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, Injector, OnInit } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { convertDbValue, convertForSave, formValueDiffersFromMaterial } from '../charge-material/charge-material-db-material.util';
import { MaterialSelector } from '../charge-material/material-selector';
import { CHARGE_MATERIAL_UNITS } from '../charge-material/charge-material-units';
import { AddSolidMaterialModalComponent } from '../charge-material/solid-form/add-solid-material-modal.component';
import { FixtureItem } from './fixture.service';
import { FixtureForm } from './fixture-form.service';

@Component({
  selector: 'app-fixture-form',
  standalone: false,
  templateUrl: './fixture-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureFormComponent implements OnInit {
  readonly item = input.required<FixtureItem>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  readonly form = computed(() => this.item().form as FixtureForm);

  /** Fixtures pick from the solid charge-material database, the same one legacy uses. */
  readonly materialSelector = new MaterialSelector<SolidLoadChargeMaterial, FixtureForm>({
    form: this.form,
    settings: this.settings,
    dbService: inject(SolidLoadMaterialDbService),
    destroyRef: inject(DestroyRef),
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddSolidMaterialModalComponent,
    setProperties: (material, form, settings) => form.patchValue({
      specificHeat: convertDbValue(material.specificHeatSolid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      latentHeat: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, settings),
      meltingPoint: convertDbValue(material.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, settings),
      specificHeatLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
    }),
    buildRecoveryProperties: (v, settings) => ({
      specificHeatSolid: convertForSave(v.specificHeat, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      latentHeat: convertForSave(v.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, settings),
      meltingPoint: convertForSave(v.meltingPoint, CHARGE_MATERIAL_UNITS.temperature, settings),
      specificHeatLiquid: convertForSave(v.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
    }),
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const materialId = this.form().controls.materialId.value;
      const material = materials.find(m => m.id === materialId);
      if (material && this.form().controls.specificHeat.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });
  }

  differs(formValue: number, dbValue: number | undefined): boolean {
    return formValueDiffersFromMaterial(formValue, dbValue, CHARGE_MATERIAL_UNITS.specificHeat, this.settings());
  }
}
