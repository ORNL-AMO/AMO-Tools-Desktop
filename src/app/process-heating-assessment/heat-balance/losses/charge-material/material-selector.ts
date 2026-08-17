import { DestroyRef, Injector, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ComponentType } from '@angular/cdk/portal';
import { Settings } from '../../../../shared/models/settings';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { rebuildDeletedMaterialRecord } from './charge-material-db-material.util';

type Material = { id?: number; substance?: string; isDefault?: boolean };

export interface MaterialDbService<TMaterial> {
  getAllWithObservable(): Observable<TMaterial[]>;
  addWithObservable(material: TMaterial): Observable<TMaterial>;
}

export interface MaterialSelectorConfig<TMaterial extends Material, TForm extends FormGroup<any>> {
  form: () => TForm;
  settings: () => Settings;
  dbService: MaterialDbService<TMaterial>;
  destroyRef: DestroyRef;
  modalDialogService: ModalDialogService;
  injector: Injector;
  modalComponent: ComponentType<unknown>;
  /** Patches the form's numeric fields from a selected/DB material. */
  setProperties: (material: TMaterial, form: TForm, settings: Settings) => void;
  /** Builds the DB properties (sans id/substance/isDefault) from the current form raw value, to recover a deleted material. Values must be converted to the DB's Imperial units. */
  buildRecoveryProperties: (rawFormValue: ReturnType<TForm['getRawValue']>, settings: Settings) => Omit<TMaterial, 'id' | 'substance' | 'isDefault'>;
}

/**
 * Shared material-selection flow (load, select, add, recover deleted) behind the gas/liquid/solid
 * charge-material forms. Each form's DB service, modal, and field mapping differ; the flow doesn't.
 */
export class MaterialSelector<TMaterial extends Material, TForm extends FormGroup<any>> {
  readonly materialTypes = signal<TMaterial[]>([]);
  readonly missingMaterialId = signal<number | null>(null);

  constructor(private readonly config: MaterialSelectorConfig<TMaterial, TForm>) {}

  get selectedMaterial(): TMaterial | undefined {
    return this.materialTypes().find(m => m.id === this.config.form().controls.materialId.value);
  }

  loadMaterials(onLoaded?: (materials: TMaterial[]) => void): void {
    this.config.dbService.getAllWithObservable().pipe(take(1), takeUntilDestroyed(this.config.destroyRef)).subscribe(materials => {
      this.materialTypes.set(materials);
      this.checkMaterialExists(materials);
      onLoaded?.(materials);
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
    const rawValue = this.config.form().getRawValue();
    const record = rebuildDeletedMaterialRecord<TMaterial>(materialId, this.config.buildRecoveryProperties(rawValue, this.config.settings()));
    this.config.dbService.addWithObservable(record).pipe(take(1), takeUntilDestroyed(this.config.destroyRef)).subscribe(inserted => {
      this.materialTypes.set([...this.materialTypes(), inserted]);
      this.config.form().patchValue({ materialId: inserted.id });
      this.missingMaterialId.set(null);
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
        this.materialTypes.set([...this.materialTypes(), material]);
        this.config.form().patchValue({ materialId: material.id });
        this.applyMaterial(material);
      }
    });
  }

  private checkMaterialExists(materials: TMaterial[]): void {
    const materialId = this.config.form().controls.materialId.value;
    const exists = materials.some(m => m.id === materialId);
    this.missingMaterialId.set(materialId != null && !exists ? materialId : null);
  }
}
