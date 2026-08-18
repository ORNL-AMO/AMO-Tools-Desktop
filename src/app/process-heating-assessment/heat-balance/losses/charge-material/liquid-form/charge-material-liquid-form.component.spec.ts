import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { ChargeMaterialLiquidFormComponent } from './charge-material-liquid-form.component';
import { LiquidMaterialFormService } from './liquid-material-form.service';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

const MOCK_MATERIALS: LiquidLoadChargeMaterial[] = [
  { id: 1, substance: 'Water', specificHeatLiquid: 1, specificHeatVapor: 0.48, latentHeat: 970, vaporizationTemperature: 212 },
  { id: 2, substance: 'Oil', specificHeatLiquid: 0.5, specificHeatVapor: 0.4, latentHeat: 150, vaporizationTemperature: 600 },
];

function makeLiquidForm(formService: LiquidMaterialFormService, overrides: Partial<LiquidLoadChargeMaterial> & { materialId?: number } = {}) {
  return formService.getLiquidChargeMaterialForm({
    liquidChargeMaterial: {
      materialId: overrides.materialId ?? 1,
      specificHeatLiquid: overrides.specificHeatLiquid,
      specificHeatVapor: overrides.specificHeatVapor,
      latentHeat: overrides.latentHeat,
      vaporizingTemperature: overrides.vaporizationTemperature ?? 212,
      feedRate: 100,
      chargeFeedRate: 100,
      initialTemperature: 70,
      dischargeTemperature: 150,
      percentVaporized: 0,
      percentReacted: 0,
      reactionHeat: 0,
      thermicReactionType: 0,
      additionalHeat: 0,
    },
  });
}

describe('ChargeMaterialLiquidFormComponent', () => {
  let component: ChargeMaterialLiquidFormComponent;
  let fixture: ComponentFixture<ChargeMaterialLiquidFormComponent>;
  let liquidFormService: LiquidMaterialFormService;
  let dbServiceSpy: jasmine.SpyObj<LiquidLoadMaterialDbService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<LiquidLoadChargeMaterial | undefined>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('LiquidLoadMaterialDbService', ['getAllWithObservable', 'addWithObservable']);
    dbServiceSpy.getAllWithObservable.and.returnValue(of(MOCK_MATERIALS));

    dialogClosed = new Subject<LiquidLoadChargeMaterial | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as any);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ChargeMaterialLiquidFormComponent],
      providers: [
        LiquidMaterialFormService,
        { provide: LiquidLoadMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    liquidFormService = TestBed.inject(LiquidMaterialFormService);

    fixture = TestBed.createComponent(ChargeMaterialLiquidFormComponent);
    component = fixture.componentInstance;
  });

  function setInputsAndInit(form = makeLiquidForm(liquidFormService)): void {
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
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 2, specificHeatLiquid: null }));
      expect(component.form().controls.specificHeatOfLiquid.value).toBe(0.5);
      expect(component.form().controls.latentHeatOfVaporization.value).toBe(150);
    });

    it('does not overwrite an already-populated specific heat value', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 2, specificHeatLiquid: 99 }));
      expect(component.form().controls.specificHeatOfLiquid.value).toBe(99);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 999 }));
      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('observeInitialTemperatureValidator', () => {
    it('calls setInitialTempValidator when the discharge temperature changes', () => {
      setInputsAndInit();
      spyOn(liquidFormService, 'setInitialTempValidator').and.callThrough();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(160);

      expect(liquidFormService.setInitialTempValidator).toHaveBeenCalledWith(component.form());
    });
  });

  describe('observeWarnings', () => {
    it('sets warnings from the current form state on init', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { vaporizationTemperature: 212 }));
      component.form().controls.chargeMaterialDischargeTemperature.setValue(300);

      expect(component.warnings().dischargeAboveVaporizingNoVaporPercent).toContain('higher than the Vaporizing Temperature');
    });

    it('recomputes warnings when the form value changes again', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { vaporizationTemperature: 212 }));

      component.form().patchValue({ chargeMaterialDischargeTemperature: 300, percentChargeVaporized: 0 });
      expect(component.warnings().dischargeAboveVaporizingNoVaporPercent).not.toBeNull();

      component.form().patchValue({ percentChargeVaporized: 50 });
      expect(component.warnings().dischargeAboveVaporizingNoVaporPercent).toBeNull();
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material properties when a material is chosen', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 1, specificHeatLiquid: 5 }));
      component.materialSelector.onMaterialSelected(2);
      expect(component.form().controls.specificHeatOfLiquid.value).toBe(0.5);
    });

    it('opens the add-material modal and applies the returned material on close', () => {
      setInputsAndInit();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const newMaterial: LiquidLoadChargeMaterial = { id: 3, substance: 'Solvent', specificHeatLiquid: 0.6, specificHeatVapor: 0.3, latentHeat: 200, vaporizationTemperature: 300 };
      dialogClosed.next(newMaterial);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.specificHeatOfLiquid.value).toBe(0.6);
      expect(component.materialSelector.materialTypes()).toContain(newMaterial);
    });

    it('restores a deleted material record and clears the missing-material flag', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 999, specificHeatLiquid: 5, specificHeatVapor: 6, latentHeat: 7, vaporizationTemperature: 8 }));
      const restored: LiquidLoadChargeMaterial = { id: 999, substance: 'Custom Material', specificHeatLiquid: 5, specificHeatVapor: 6, latentHeat: 7, vaporizationTemperature: 8, isDefault: false };
      dbServiceSpy.addWithObservable.and.returnValue(of(restored));

      component.materialSelector.restoreDeletedMaterial();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({ id: 999, substance: 'Custom Material' }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(component.form().controls.materialId.value).toBe(999);
    });

    it('dismisses the missing-material warning without restoring a record', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 999 }));
      component.materialSelector.dismissMissingMaterial();
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(dbServiceSpy.addWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('differs', () => {
    it('returns false when the form value matches the database value', () => {
      setInputsAndInit();
      expect(component.differs(1, 1, component.UNITS.specificHeat)).toBeFalse();
    });

    it('returns true when the form value has been overridden from the database value', () => {
      setInputsAndInit();
      expect(component.differs(5, 1, component.UNITS.specificHeat)).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('hides the missing-material alert when missingMaterialId is null', () => {
      setInputsAndInit();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when missingMaterialId is set', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 999 }));
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the "differs from database" note when the value matches the selected material', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 1, specificHeatLiquid: 1 }));
      expect(fixture.nativeElement.querySelector('.text-warning')).toBeNull();
    });

    it('shows the "differs from database" note when the value has been overridden', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { materialId: 1, specificHeatLiquid: 99 }));
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

    it('hides the vaporizing-point warnings when no condition is met', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { vaporizationTemperature: 212 }));
      component.form().patchValue({ initialTemperature: 70, chargeMaterialDischargeTemperature: 150, percentChargeVaporized: 0 });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.alert-warning.my-1').length).toBe(0);
    });
  });

  describe('destroy', () => {
    it('stops recomputing warnings after the component is destroyed', () => {
      setInputsAndInit(makeLiquidForm(liquidFormService, { vaporizationTemperature: 212 }));
      fixture.destroy();

      const warningsBefore = component.warnings();
      component.form().patchValue({ chargeMaterialDischargeTemperature: 300, percentChargeVaporized: 0 });

      expect(component.warnings()).toBe(warningsBefore);
    });

    it('stops applying the initial-temperature validator after the component is destroyed', () => {
      setInputsAndInit();
      spyOn(liquidFormService, 'setInitialTempValidator').and.callThrough();
      fixture.destroy();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(400);

      expect(liquidFormService.setInitialTempValidator).not.toHaveBeenCalled();
    });
  });
});
