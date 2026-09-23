import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { FixtureFormComponent } from './fixture-form.component';
import { FixtureFormService } from './fixture-form.service';
import { FixtureItem } from './fixture.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

const MOCK_MATERIALS: SolidLoadChargeMaterial[] = [
  { id: 1, substance: 'Steel', specificHeatSolid: 0.12, latentHeat: 120, meltingPoint: 2800, specificHeatLiquid: 0.18 },
  { id: 2, substance: 'Aluminum', specificHeatSolid: 0.25, latentHeat: 170, meltingPoint: 1220, specificHeatLiquid: 0.26 },
];

function makeFixtureItem(formService: FixtureFormService, overrides: Partial<FixtureLoss> = {}): FixtureItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getFixtureForm({
      materialName: 1,
      specificHeat: undefined,
      feedRate: 500,
      initialTemperature: 70,
      finalTemperature: 1000,
      correctionFactor: 1.0,
      ...overrides,
    }),
  };
}

describe('FixtureFormComponent', () => {
  let component: FixtureFormComponent;
  let fixture: ComponentFixture<FixtureFormComponent>;
  let formService: FixtureFormService;
  let dbServiceSpy: jasmine.SpyObj<SolidLoadMaterialDbService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<SolidLoadChargeMaterial | undefined>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('SolidLoadMaterialDbService', ['getAllWithObservable', 'addWithObservable']);
    dbServiceSpy.getAllWithObservable.and.returnValue(of(MOCK_MATERIALS));

    dialogClosed = new Subject<SolidLoadChargeMaterial | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as any);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FixtureFormComponent],
      providers: [
        FixtureFormService,
        { provide: SolidLoadMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(FixtureFormService);

    fixture = TestBed.createComponent(FixtureFormComponent);
    component = fixture.componentInstance;
  });

  function setInputsAndInit(item = makeFixtureItem(formService)): void {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('loads solid materials from the database into the material selector', () => {
      setInputsAndInit();
      expect(dbServiceSpy.getAllWithObservable).toHaveBeenCalled();
      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });

    it('applies the matching material, including the hidden recovery fields, when specific heat is empty', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 2, specificHeat: undefined }));
      expect(component.form().getRawValue()).toEqual(jasmine.objectContaining({
        specificHeat: 0.25,
        latentHeat: 170,
        meltingPoint: 1220,
        specificHeatLiquid: 0.26,
      }));
    });

    it('does not overwrite an already-populated specific heat value', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 2, specificHeat: 99 }));
      expect(component.form().controls.specificHeat.value).toBe(99);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 999 }));
      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material properties when a material is chosen', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 1, specificHeat: 5 }));
      component.materialSelector.onMaterialSelected(2);
      expect(component.form().controls.specificHeat.value).toBe(0.25);
    });

    it('opens the solid add-material modal and applies the returned material on close', () => {
      setInputsAndInit();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const newMaterial: SolidLoadChargeMaterial = { id: 3, substance: 'Copper', specificHeatSolid: 0.09, latentHeat: 88, meltingPoint: 1980, specificHeatLiquid: 0.12 };
      dialogClosed.next(newMaterial);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.specificHeat.value).toBe(0.09);
      expect(component.materialSelector.materialTypes()).toContain(newMaterial);
    });

    it('restores a deleted material from the stored values and clears the missing-material flag', () => {
      setInputsAndInit(makeFixtureItem(formService, {
        materialName: 999, specificHeat: 0.2, latentHeat: 100, meltingPoint: 1500, specificHeatLiquid: 0.3,
      }));
      const restored: SolidLoadChargeMaterial = {
        id: 999, substance: 'Custom Material', specificHeatSolid: 0.2, latentHeat: 100, meltingPoint: 1500, specificHeatLiquid: 0.3, isDefault: false,
      };
      dbServiceSpy.addWithObservable.and.returnValue(of(restored));

      component.materialSelector.restoreDeletedMaterial();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 999, specificHeatSolid: 0.2, latentHeat: 100, meltingPoint: 1500, specificHeatLiquid: 0.3,
      }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
    });
  });

  describe('validation', () => {
    it('allows a specific heat of 0 but rejects a negative one', () => {
      setInputsAndInit();
      const specificHeat = component.form().controls.specificHeat;

      specificHeat.setValue(0);
      expect(specificHeat.valid).toBeTrue();

      specificHeat.setValue(-1);
      expect(specificHeat.invalid).toBeTrue();
    });

    it('requires a feed rate greater than 0', () => {
      setInputsAndInit();
      const feedRate = component.form().controls.feedRate;
      feedRate.setValue(0);
      feedRate.markAsDirty();
      fixture.detectChanges();

      expect(feedRate.invalid).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('Value must be greater than 0');
    });

    it('does not require outlet temperature to exceed inlet temperature', () => {
      setInputsAndInit(makeFixtureItem(formService, { initialTemperature: 1000, finalTemperature: 70 }));
      expect(component.form().controls.finalTemp.valid).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the missing-material alert when missingMaterialId is set', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 999 }));
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the "differs from database" note when the value matches the selected material', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 1, specificHeat: 0.12 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).toBeNull();
    });

    it('shows the "differs from database" note when the value has been overridden', () => {
      setInputsAndInit(makeFixtureItem(formService, { materialName: 1, specificHeat: 99 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).not.toBeNull();
    });
  });
});
