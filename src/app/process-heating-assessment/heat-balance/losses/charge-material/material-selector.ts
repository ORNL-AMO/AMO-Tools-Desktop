import { DestroyRef, Injector, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ComponentType } from '@angular/cdk/portal';
import { Settings } from '../../../../shared/models/settings';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { rebuildDeletedMaterialRecord } from './charge-material-db-material.util';
import { MaterialDbService } from './material-db.adapters';

type Material = { id?: number; substance?: string; isDefault?: boolean };

/** The parts of a loss form the selector uses; any `FormGroup` with a `materialId` control fits. */
export interface MaterialForm {
  controls: { materialId: FormControl<number | null> };
  getRawValue(): unknown;
  patchValue(value: { materialId?: number | null }): void;
}

export interface MaterialSelectorConfig<TMaterial extends Material, TForm extends MaterialForm> {
  form: () => TForm;
  settings: () => Settings;
  dbService: MaterialDbService<TMaterial>;
  destroyRef: DestroyRef;
  modalDialogService: ModalDialogService;
  injector: Injector;
  modalComponent: ComponentType<unknown>;
  /** Patches the form's numeric fields from a selected/DB material. */
  setProperties: (material: TMaterial, form: TForm, settings: Settings) => void;
  /** Whether the form has no material properties yet (a new entry), so the selected material's are applied once the list loads. */
  needsMaterialProperties: (form: TForm) => boolean;
  /** Builds the DB properties (sans id/substance/isDefault) from the current form raw value, to recover a deleted material. Values must be converted to the DB's Imperial units. */
  buildRecoveryProperties: (rawFormValue: ReturnType<TForm['getRawValue']>, settings: Settings) => Omit<TMaterial, 'id' | 'substance' | 'isDefault'>;
}

/**
 * Shared material-selection flow (load, select, add, recover deleted) behind the loss forms that pick a
 * database material. Each form's DB service, modal, and field mapping differ; the flow doesn't.
 */
export class MaterialSelector<TMaterial extends Material, TForm extends MaterialForm> {
  readonly materialTypes = signal<TMaterial[]>([]);
  readonly missingMaterialId = signal<number | null>(null);

  constructor(private readonly config: MaterialSelectorConfig<TMaterial, TForm>) {}

  get selectedMaterial(): TMaterial | undefined {
    return this.materialTypes().find(m => m.id === this.config.form().controls.materialId.value);
  }

  /** Follows the cached list, so a material added or restored from any entry shows up in every entry. */
  loadMaterials(): void {
    let hasCheckedSavedMaterial = false;
    this.config.dbService.materials().pipe(takeUntilDestroyed(this.config.destroyRef)).subscribe(materials => {
      this.materialTypes.set(materials);
      // An empty list means the cache hasn't loaded yet (the databases always hold default materials).
      if (!hasCheckedSavedMaterial && materials.length) {
        hasCheckedSavedMaterial = true;
        this.applySavedMaterialIfNeeded(materials);
        this.checkMaterialExists(materials);
      } else if (materials.some(m => m.id === this.missingMaterialId())) {
        this.missingMaterialId.set(null);
      }
    });
  }

  onMaterialSelected(materialId: number | null): void {
    const material = this.materialTypes().find(m => m.id === materialId);
    if (material) this.applyMaterial(material);
  }

  applyMaterial(material: TMaterial): void {
    this.config.setProperties(material, this.config.form(), this.config.settings());
    this.missingMaterialId.set(null);
  }

  restoreDeletedMaterial(): void {
    const materialId = this.missingMaterialId();
    if (materialId == null) return;
    if (this.materialTypes().some(m => m.id === materialId)) {
      this.missingMaterialId.set(null);
      return;
    }
    // Inside the generic class TypeScript only sees MaterialForm's `unknown` return, not TForm's own.
    const rawValue = this.config.form().getRawValue() as ReturnType<TForm['getRawValue']>;
    const record = rebuildDeletedMaterialRecord<TMaterial>(materialId, this.config.buildRecoveryProperties(rawValue, this.config.settings()));
    this.config.dbService.addMaterial(record).pipe(take(1), takeUntilDestroyed(this.config.destroyRef)).subscribe({
      next: inserted => {
        this.config.form().patchValue({ materialId: inserted.id });
        this.missingMaterialId.set(null);
      },
      error: error => console.error('Could not restore the deleted material.', error),
    });
  }

  dismissMissingMaterial(): void {
    this.missingMaterialId.set(null);
  }

  openAddMaterialModal(): void {
    const data: MaterialModalData = { settings: this.config.settings() };
    const dialogRef = this.config.modalDialogService.openModal<TMaterial, MaterialModalData, unknown>(
      this.config.modalComponent, { data }, this.config.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.config.destroyRef)).subscribe(material => {
      if (material) {
        this.config.form().patchValue({ materialId: material.id });
        this.applyMaterial(material);
      }
    });
  }

  private applySavedMaterialIfNeeded(materials: TMaterial[]): void {
    const material = materials.find(m => m.id === this.config.form().controls.materialId.value);
    if (material && this.config.needsMaterialProperties(this.config.form())) this.applyMaterial(material);
  }

  private checkMaterialExists(materials: TMaterial[]): void {
    const materialId = this.config.form().controls.materialId.value;
    const exists = materials.some(m => m.id === materialId);
    this.missingMaterialId.set(materialId != null && !exists ? materialId : null);
  }
}
