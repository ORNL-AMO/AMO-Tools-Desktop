import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { ChargeMaterialGasFormComponent } from './charge-material-gas-form.component';
import { GasMaterialFormService } from './gas-material-form.service';
import { GasLoadMaterialDbService } from '../../../../../indexedDb/gas-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { GasLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

const MOCK_MATERIALS: GasLoadChargeMaterial[] = [
  { id: 1, substance: 'Natural Gas', specificHeatVapor: 0.24 },
  { id: 2, substance: 'Propane', specificHeatVapor: 0.4 },
];

function makeGasForm(formService: GasMaterialFormService, overrides: Partial<GasLoadChargeMaterial> & { materialId?: number } = {}) {
  return formService.getGasChargeMaterialForm({
    gasChargeMaterial: {
      materialId: overrides.materialId ?? 1,
      specificHeatGas: overrides.specificHeatVapor,
      feedRate: 100,
      percentVapor: 0,
      initialTemperature: 70,
      dischargeTemperature: 150,
      specificHeatVapor: 0,
      percentReacted: 0,
      reactionHeat: 0,
      thermicReactionType: 0,
      additionalHeat: 0,
    },
  });
}

describe('ChargeMaterialGasFormComponent', () => {
  let component: ChargeMaterialGasFormComponent;
  let fixture: ComponentFixture<ChargeMaterialGasFormComponent>;
  let gasFormService: GasMaterialFormService;
  let dbServiceSpy: jasmine.SpyObj<GasLoadMaterialDbService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<GasLoadChargeMaterial | undefined>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('GasLoadMaterialDbService', ['getAllWithObservable', 'addWithObservable']);
    dbServiceSpy.getAllWithObservable.and.returnValue(of(MOCK_MATERIALS));

    dialogClosed = new Subject<GasLoadChargeMaterial | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as any);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ChargeMaterialGasFormComponent],
      providers: [
        GasMaterialFormService,
        { provide: GasLoadMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gasFormService = TestBed.inject(GasMaterialFormService);

    fixture = TestBed.createComponent(ChargeMaterialGasFormComponent);
    component = fixture.componentInstance;
  });

  function setInputsAndInit(form = makeGasForm(gasFormService)): void {
    fixture.componentRef.setInput('form', form);
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
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 2, specificHeatVapor: null }));
      expect(component.form().controls.specificHeatOfGas.value).toBe(0.4);
    });

    it('does not overwrite an already-populated specific heat value', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 2, specificHeatVapor: 99 }));
      expect(component.form().controls.specificHeatOfGas.value).toBe(99);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 999 }));
      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('observeInitialTemperatureValidator', () => {
    it('calls setInitialTempValidator when the discharge temperature changes', () => {
      setInputsAndInit();
      spyOn(gasFormService, 'setInitialTempValidator').and.callThrough();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(200);

      expect(gasFormService.setInitialTempValidator).toHaveBeenCalledWith(component.form());
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material properties when a material is chosen', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 1, specificHeatVapor: 5 }));
      component.materialSelector.onMaterialSelected(2);
      expect(component.form().controls.specificHeatOfGas.value).toBe(0.4);
    });

    it('opens the add-material modal and applies the returned material on close', () => {
      setInputsAndInit();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const newMaterial: GasLoadChargeMaterial = { id: 3, substance: 'Hydrogen', specificHeatVapor: 3.4 };
      dialogClosed.next(newMaterial);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.specificHeatOfGas.value).toBe(3.4);
      expect(component.materialSelector.materialTypes()).toContain(newMaterial);
    });

    it('restores a deleted material record and clears the missing-material flag', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 999, specificHeatVapor: 5 }));
      const restored: GasLoadChargeMaterial = { id: 999, substance: 'Custom Material', specificHeatVapor: 5, isDefault: false };
      dbServiceSpy.addWithObservable.and.returnValue(of(restored));

      component.materialSelector.restoreDeletedMaterial();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({ id: 999, substance: 'Custom Material' }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(component.form().controls.materialId.value).toBe(999);
    });

    it('dismisses the missing-material warning without restoring a record', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 999 }));
      component.materialSelector.dismissMissingMaterial();
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(dbServiceSpy.addWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('differs', () => {
    it('returns false when the form value matches the database value', () => {
      setInputsAndInit();
      expect(component.differs(0.24, 0.24, component.UNITS.specificHeat)).toBeFalse();
    });

    it('returns true when the form value has been overridden from the database value', () => {
      setInputsAndInit();
      expect(component.differs(5, 0.24, component.UNITS.specificHeat)).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('hides the missing-material alert when missingMaterialId is null', () => {
      setInputsAndInit();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when missingMaterialId is set', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 999 }));
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the "differs from database" note when the value matches the selected material', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 1, specificHeatVapor: 0.24 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).toBeNull();
    });

    it('shows the "differs from database" note when the value has been overridden', () => {
      setInputsAndInit(makeGasForm(gasFormService, { materialId: 1, specificHeatVapor: 99 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).not.toBeNull();
    });

    it('shows a required error on feedRate when empty', () => {
      setInputsAndInit();
      const feedRate = component.form().controls.feedRate;
      feedRate.setValue(null);
      feedRate.markAsDirty();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Value Required');
    });
  });

  describe('destroy', () => {
    it('stops applying the initial-temperature validator after the component is destroyed', () => {
      setInputsAndInit();
      spyOn(gasFormService, 'setInitialTempValidator').and.callThrough();
      fixture.destroy();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(500);

      expect(gasFormService.setInitialTempValidator).not.toHaveBeenCalled();
    });
  });
});
