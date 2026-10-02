import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, input, OnInit } from '@angular/core';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { MaterialSelector } from '../charge-material/material-selector';
import { AddSolidLiquidFlueGasMaterialModalComponent } from './add-solid-liquid-flue-gas-material-modal.component';
import { adaptSolidLiquidFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { FLUE_GAS_FUEL_ANALYSIS, FlueGasMassForm } from './flue-gas-form.service';

@Component({
  selector: 'app-flue-gas-mass-form',
  standalone: false,
  templateUrl: './flue-gas-mass-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasMassFormComponent implements OnInit {
  readonly form = input.required<FlueGasMassForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);

  readonly fuelAnalysis = FLUE_GAS_FUEL_ANALYSIS;

  readonly materialSelector = new MaterialSelector<SolidLiquidFlueGasMaterial, FlueGasMassForm>({
    form: this.form,
    settings: this.settings,
    dbService: adaptSolidLiquidFlueGasMaterialDb(inject(SolidLiquidMaterialDbService)),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddSolidLiquidFlueGasMaterialModalComponent,
    setProperties: (material, form) => form.patchValue({
      ...Object.fromEntries(FLUE_GAS_FUEL_ANALYSIS.map(({ key }) => [key, roundVal(material[key], 4)])),
      heatingValue: material.heatingValue,
    }),
    buildRecoveryProperties: values => ({
      ...Object.fromEntries(FLUE_GAS_FUEL_ANALYSIS.map(({ key }) => [key, values[key]])),
      heatingValue: values.heatingValue,
    }) as Omit<SolidLiquidFlueGasMaterial, 'id' | 'substance' | 'isDefault'>,
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const material = materials.find(m => m.id === this.form().controls.materialId.value);
      if (material && this.form().controls.carbon.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });
  }
}
