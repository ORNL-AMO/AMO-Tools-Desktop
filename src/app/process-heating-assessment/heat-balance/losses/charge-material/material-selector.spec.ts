import { DestroyRef, Injector } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { Settings } from '../../../../shared/models/settings';
import { MaterialDbService } from './material-db.adapters';
import { MaterialSelector } from './material-selector';

interface TestMaterial {
  id?: number;
  substance?: string;
  isDefault?: boolean;
  specificHeat?: number;
}

type TestForm = FormGroup<{ materialId: FormControl<number | null>; specificHeat: FormControl<number | null> }>;

const IRON: TestMaterial = { id: 1, substance: 'Iron', specificHeat: 0.11 };
const COPPER: TestMaterial = { id: 2, substance: 'Copper', specificHeat: 0.09 };

describe('MaterialSelector', () => {
  let cache: BehaviorSubject<TestMaterial[]>;
  let addMaterial: jasmine.Spy<(material: TestMaterial) => Observable<TestMaterial>>;
  let form: TestForm;

  function buildForm(materialId: number | null, specificHeat: number | null): TestForm {
    return new FormGroup({ materialId: new FormControl(materialId), specificHeat: new FormControl(specificHeat) });
  }

  function buildSelector(): MaterialSelector<TestMaterial, TestForm> {
    const dbService: MaterialDbService<TestMaterial> = { materials: () => cache.asObservable(), addMaterial };
    return new MaterialSelector<TestMaterial, TestForm>({
      form: () => form,
      settings: () => ({ unitsOfMeasure: 'Imperial' } as Settings),
      dbService,
      destroyRef: TestBed.inject(DestroyRef),
      modalDialogService: jasmine.createSpyObj<ModalDialogService>('ModalDialogService', ['openModal']),
      injector: TestBed.inject(Injector),
      modalComponent: class {},
      setProperties: (material, target) => target.patchValue({ specificHeat: material.specificHeat }),
      needsMaterialProperties: target => target.controls.specificHeat.value == null,
      buildRecoveryProperties: rawValue => ({ specificHeat: rawValue.specificHeat ?? undefined }),
    });
  }

  beforeEach(() => {
    cache = new BehaviorSubject<TestMaterial[]>([IRON, COPPER]);
    addMaterial = jasmine.createSpy('addMaterial');
  });

  describe('loading', () => {
    it('applies the saved material to a new entry that has no properties yet', () => {
      form = buildForm(2, null);
      buildSelector().loadMaterials();
      expect(form.controls.specificHeat.value).toBe(0.09);
    });

    it('keeps properties the entry already has', () => {
      form = buildForm(2, 5);
      buildSelector().loadMaterials();
      expect(form.controls.specificHeat.value).toBe(5);
    });

    it('waits for the cache to load when the form opens before it', () => {
      cache.next([]);
      form = buildForm(2, null);
      const selector = buildSelector();
      selector.loadMaterials();
      expect(selector.missingMaterialId()).toBeNull();

      cache.next([IRON, COPPER]);

      expect(form.controls.specificHeat.value).toBe(0.09);
      expect(selector.missingMaterialId()).toBeNull();
    });

    it('flags a saved material that is no longer in the list', () => {
      form = buildForm(99, 5);
      const selector = buildSelector();
      selector.loadMaterials();
      expect(selector.missingMaterialId()).toBe(99);
    });
  });

  describe('shared list', () => {
    it('shows a material added from another entry', () => {
      form = buildForm(1, 0.11);
      const selector = buildSelector();
      selector.loadMaterials();

      const nickel: TestMaterial = { id: 3, substance: 'Nickel', specificHeat: 0.12 };
      cache.next([IRON, COPPER, nickel]);

      expect(selector.materialTypes()).toContain(nickel);
    });

    it('clears the missing-material flag once another entry restores that material', () => {
      form = buildForm(99, 5);
      const selector = buildSelector();
      selector.loadMaterials();

      cache.next([IRON, COPPER, { id: 99, substance: 'Custom Material', specificHeat: 5 }]);

      expect(selector.missingMaterialId()).toBeNull();
    });
  });

  describe('restoring a deleted material', () => {
    it('saves a rebuilt record with the missing id and keeps it selected', fakeAsync(() => {
      form = buildForm(99, 5);
      const selector = buildSelector();
      selector.loadMaterials();
      addMaterial.and.callFake(material => of(material));

      selector.restoreDeletedMaterial();
      flushMicrotasks();

      expect(addMaterial).toHaveBeenCalledOnceWith(jasmine.objectContaining({ id: 99, substance: 'Custom Material', specificHeat: 5 }));
      expect(form.controls.materialId.value).toBe(99);
      expect(selector.missingMaterialId()).toBeNull();
    }));

    it('does not save again when the material is already back in the list', () => {
      form = buildForm(99, 5);
      const selector = buildSelector();
      selector.loadMaterials();
      selector.materialTypes.set([IRON, COPPER, { id: 99, substance: 'Custom Material' }]);

      selector.restoreDeletedMaterial();

      expect(addMaterial).not.toHaveBeenCalled();
      expect(selector.missingMaterialId()).toBeNull();
    });

    it('keeps the missing-material flag when saving fails', () => {
      form = buildForm(99, 5);
      const selector = buildSelector();
      selector.loadMaterials();
      addMaterial.and.returnValue(throwError(() => new Error('write failed')));
      spyOn(console, 'error');

      selector.restoreDeletedMaterial();

      expect(selector.missingMaterialId()).toBe(99);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
