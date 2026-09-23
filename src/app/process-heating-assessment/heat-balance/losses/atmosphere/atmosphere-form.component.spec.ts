import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AtmosphereFormComponent } from './atmosphere-form.component';
import { AtmosphereFormService } from './atmosphere-form.service';
import { AtmosphereItem } from './atmosphere.service';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

const MOCK_MATERIALS: AtmosphereSpecificHeat[] = [
  { id: 1, substance: 'Air', specificHeat: 0.0185 },
  { id: 2, substance: 'Nitrogen', specificHeat: 0.0186 },
];

function makeAtmosphereItem(formService: AtmosphereFormService, overrides: Partial<AtmosphereLoss> = {}): AtmosphereItem {
  return {
    id: 'item-1',
    name: 'Loss #1',
    collapse: false,
    heatLoss: null,
    form: formService.getAtmosphereForm({
      atmosphereGas: 1,
      specificHeat: undefined,
      inletTemperature: 70,
      outletTemperature: 1000,
      flowRate: 500,
      correctionFactor: 1.0,
      ...overrides,
    }),
  };
}

describe('AtmosphereFormComponent', () => {
  let component: AtmosphereFormComponent;
  let fixture: ComponentFixture<AtmosphereFormComponent>;
  let formService: AtmosphereFormService;
  let dbServiceSpy: jasmine.SpyObj<AtmosphereDbService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<AtmosphereSpecificHeat | undefined>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('AtmosphereDbService', ['getAllWithObservable', 'addWithObservable']);
    dbServiceSpy.getAllWithObservable.and.returnValue(of(MOCK_MATERIALS));

    dialogClosed = new Subject<AtmosphereSpecificHeat | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as any);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AtmosphereFormComponent],
      providers: [
        AtmosphereFormService,
        { provide: AtmosphereDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(AtmosphereFormService);

    fixture = TestBed.createComponent(AtmosphereFormComponent);
    component = fixture.componentInstance;
  });

  function setInputsAndInit(item = makeAtmosphereItem(formService)): void {
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('loads materials from the database into the material selector', () => {
      setInputsAndInit();
      expect(dbServiceSpy.getAllWithObservable).toHaveBeenCalled();
      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });

    it('applies the matching loaded material when the form has no specific heat value yet', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 2, specificHeat: undefined }));
      expect(component.form().controls.specificHeat.value).toBe(0.0186);
    });

    it('does not overwrite an already-populated specific heat value', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 2, specificHeat: 99 }));
      expect(component.form().controls.specificHeat.value).toBe(99);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 999 }));
      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('observeOutletTempValidator', () => {
    it('calls setOutletTempValidator when the inlet temperature changes', () => {
      setInputsAndInit();
      spyOn(formService, 'setOutletTempValidator').and.callThrough();

      component.form().controls.inletTemp.setValue(200);

      expect(formService.setOutletTempValidator).toHaveBeenCalledWith(component.form());
    });

    it('invalidates outlet temperature once it drops below the new inlet temperature', () => {
      setInputsAndInit();
      component.form().controls.inletTemp.setValue(1200);

      expect(component.form().controls.outletTemp.invalid).toBeTrue();
    });

    it('clears the stale minimum-temperature validator once the inlet temperature is cleared', () => {
      setInputsAndInit();
      component.form().controls.inletTemp.setValue(1200);
      expect(component.form().controls.outletTemp.invalid).toBeTrue();

      component.form().controls.inletTemp.setValue(null);

      expect(component.form().controls.outletTemp.invalid).toBeFalse();
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material properties when a material is chosen', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 1, specificHeat: 5 }));
      component.materialSelector.onMaterialSelected(2);
      expect(component.form().controls.specificHeat.value).toBe(0.0186);
    });

    it('opens the add-material modal and applies the returned material on close', () => {
      setInputsAndInit();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const newMaterial: AtmosphereSpecificHeat = { id: 3, substance: 'Hydrogen', specificHeat: 3.4 };
      dialogClosed.next(newMaterial);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.specificHeat.value).toBe(3.4);
      expect(component.materialSelector.materialTypes()).toContain(newMaterial);
    });

    it('restores a deleted material record and clears the missing-material flag', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 999, specificHeat: 5 }));
      const restored: AtmosphereSpecificHeat = { id: 999, substance: 'Custom Material', specificHeat: 5, isDefault: false };
      dbServiceSpy.addWithObservable.and.returnValue(of(restored));

      component.materialSelector.restoreDeletedMaterial();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({ id: 999, substance: 'Custom Material' }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(component.form().controls.materialId.value).toBe(999);
    });

    it('dismisses the missing-material warning without restoring a record', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 999 }));
      component.materialSelector.dismissMissingMaterial();
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(dbServiceSpy.addWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('differs', () => {
    it('returns false when the form value matches the database value', () => {
      setInputsAndInit();
      expect(component.differs(0.0185, 0.0185)).toBeFalse();
    });

    it('returns true when the form value has been overridden from the database value', () => {
      setInputsAndInit();
      expect(component.differs(5, 0.0185)).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('hides the missing-material alert when missingMaterialId is null', () => {
      setInputsAndInit();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when missingMaterialId is set', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 999 }));
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the "differs from database" note when the value matches the selected material', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 1, specificHeat: 0.0185 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).toBeNull();
    });

    it('shows the "differs from database" note when the value has been overridden', () => {
      setInputsAndInit(makeAtmosphereItem(formService, { atmosphereGas: 1, specificHeat: 99 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).not.toBeNull();
    });

    it('shows a required error on flowRate when empty', () => {
      setInputsAndInit();
      const flowRate = component.form().controls.flowRate;
      flowRate.setValue(null);
      flowRate.markAsDirty();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });
  });

  describe('destroy', () => {
    it('stops applying the outlet-temperature validator after the component is destroyed', () => {
      setInputsAndInit();
      spyOn(formService, 'setOutletTempValidator').and.callThrough();
      fixture.destroy();

      component.form().controls.inletTemp.setValue(500);

      expect(formService.setOutletTempValidator).not.toHaveBeenCalled();
    });
  });
});
