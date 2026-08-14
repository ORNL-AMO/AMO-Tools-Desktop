import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Settings } from '../../../../../shared/models/settings';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { convertDbValue, formValueDiffersFromMaterial } from '../charge-material-db-material.util';
import { MaterialSelector } from '../material-selector';
import { EMPTY_WARNINGS, LiquidMaterialForm, LiquidMaterialFormService, LiquidMaterialWarnings } from './liquid-material-form.service';
import { AddLiquidMaterialModalComponent } from './add-liquid-material-modal.component';
import { UnitConversion } from '../../../../models/unit-conversion';
import { CHARGE_MATERIAL_UNITS } from '../charge-material-units';

@Component({
  selector: 'app-charge-material-liquid-form',
  standalone: false,
  templateUrl: './charge-material-liquid-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialLiquidFormComponent implements OnInit {
  readonly form = input.required<LiquidMaterialForm>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(LiquidMaterialFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly UNITS = CHARGE_MATERIAL_UNITS;
  readonly warnings = signal<LiquidMaterialWarnings>(EMPTY_WARNINGS);
  readonly materialSelector = new MaterialSelector<LiquidLoadChargeMaterial, LiquidMaterialForm>({
    form: this.form,
    settings: this.settings,
    dbService: inject(LiquidLoadMaterialDbService),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddLiquidMaterialModalComponent,
    setProperties: (material, form, settings) => form.patchValue({
      specificHeatOfLiquid: convertDbValue(material.specificHeatLiquid, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      specificHeatOfVapor: convertDbValue(material.specificHeatVapor, CHARGE_MATERIAL_UNITS.specificHeat, settings),
      latentHeatOfVaporization: convertDbValue(material.latentHeat, CHARGE_MATERIAL_UNITS.latentHeat, settings),
      vaporizingTemperature: convertDbValue(material.vaporizationTemperature, CHARGE_MATERIAL_UNITS.temperature, settings),
    }),
    buildRecoveryProperties: v => ({
      specificHeatLiquid: v.specificHeatOfLiquid,
      specificHeatVapor: v.specificHeatOfVapor,
      latentHeat: v.latentHeatOfVaporization,
      vaporizationTemperature: v.vaporizingTemperature,
    }),
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const materialId = this.form().controls.materialId.value;
      const material = materials.find(m => m.id === materialId);
      if (material && this.form().controls.specificHeatOfLiquid.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });

    this.form().controls.chargeMaterialDischargeTemperature.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.formService.setInitialTempValidator(this.form()));

    this.form().valueChanges.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const liquid = this.formService.buildLiquidChargeMaterial(this.form()).liquidChargeMaterial;
      this.warnings.set(this.formService.checkLiquidWarnings(liquid));
    });
  }

  differs(formValue: number, dbValue: number | undefined, unit: UnitConversion): boolean {
    return formValueDiffersFromMaterial(formValue, dbValue, unit, this.settings());
  }
}
