import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, input, OnInit } from '@angular/core';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { roundVal } from '../../../../shared/helperFunctions';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { MaterialSelector } from '../charge-material/material-selector';
import { AddFlueGasMaterialModalComponent } from './add-flue-gas-material-modal.component';
import { adaptFlueGasMaterialDb } from './flue-gas-material-db.adapter';
import { FLUE_GAS_COMPONENTS, FlueGasVolumeForm, OXYGEN_CALCULATION_METHODS } from './flue-gas-form.service';

@Component({
  selector: 'app-flue-gas-volume-form',
  standalone: false,
  templateUrl: './flue-gas-volume-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasVolumeFormComponent implements OnInit {
  readonly form = input.required<FlueGasVolumeForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);

  readonly components = FLUE_GAS_COMPONENTS;
  readonly calculationMethods = OXYGEN_CALCULATION_METHODS;

  readonly materialSelector = new MaterialSelector<FlueGasMaterial, FlueGasVolumeForm>({
    form: this.form,
    settings: this.settings,
    dbService: adaptFlueGasMaterialDb(inject(FlueGasMaterialDbService)),
    destroyRef: this.destroyRef,
    modalDialogService: inject(ModalDialogService),
    injector: inject(Injector),
    modalComponent: AddFlueGasMaterialModalComponent,
    setProperties: (material, form) => form.patchValue({
      ...Object.fromEntries(FLUE_GAS_COMPONENTS.map(component => [component, roundVal(material[component], 4)])),
      specificGravity: roundVal(material.specificGravity, 4),
      heatingValue: roundVal(material.heatingValue, 4),
      heatingValueVolume: roundVal(material.heatingValueVolume, 4),
    }),
    buildRecoveryProperties: values => ({
      ...Object.fromEntries(FLUE_GAS_COMPONENTS.map(component => [component, values[component]])),
      specificGravity: values.specificGravity,
      heatingValue: values.heatingValue,
      heatingValueVolume: values.heatingValueVolume,
    }) as Omit<FlueGasMaterial, 'id' | 'substance' | 'isDefault'>,
  });

  ngOnInit(): void {
    this.materialSelector.loadMaterials(materials => {
      const material = materials.find(m => m.id === this.form().controls.materialId.value);
      if (material && this.form().controls.CH4.value == null) {
        this.materialSelector.applyMaterial(material);
      }
    });
  }

  /** Zeroes both O2 and excess air so only the newly selected method's input is entered. */
  changeOxygenCalculationMethod(): void {
    this.form().patchValue({ o2InFlueGas: 0, excessAirPercentage: 0 });
  }
}
