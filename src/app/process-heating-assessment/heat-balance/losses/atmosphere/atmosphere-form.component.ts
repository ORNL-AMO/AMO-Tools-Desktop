import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, Injector, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { generateFormControlIds } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { convertDbValue, convertForSave, formValueDiffersFromMaterial } from '../charge-material/charge-material-db-material.util';
import { MaterialSelector } from '../charge-material/material-selector';
import { AtmosphereItem } from './atmosphere.service';
import { AtmosphereForm, AtmosphereFormService } from './atmosphere-form.service';
import { AddAtmosphereMaterialModalComponent } from './add-atmosphere-material-modal.component';
import { ATMOSPHERE_UNITS } from './atmosphere-units';

@Component({
  selector: 'app-atmosphere-form',
  standalone: false,
  templateUrl: './atmosphere-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtmosphereFormComponent implements OnInit {
  readonly item = input.required<AtmosphereItem>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly formService = inject(AtmosphereFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly UNITS = ATMOSPHERE_UNITS;
  readonly form = computed(() => this.item().form as AtmosphereForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));

  readonly materialSelector = new MaterialSelector<AtmosphereSpecificHeat, AtmosphereForm>({
    form: this.form,
    settings: this.settings,
    dbService: inject(AtmosphereDbService),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddAtmosphereMaterialModalComponent,
    setProperties: (material, form, settings) => form.patchValue({
      specificHeat: convertDbValue(material.specificHeat, ATMOSPHERE_UNITS.specificHeat, settings),
    }),
    buildRecoveryProperties: (v, settings) => ({
      specificHeat: convertForSave(v.specificHeat, ATMOSPHERE_UNITS.specificHeat, settings),
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

    this.form().controls.inletTemp.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.formService.setOutletTempValidator(this.form()));
  }

  differs(formValue: number, dbValue: number | undefined): boolean {
    return formValueDiffersFromMaterial(formValue, dbValue, ATMOSPHERE_UNITS.specificHeat, this.settings());
  }
}
