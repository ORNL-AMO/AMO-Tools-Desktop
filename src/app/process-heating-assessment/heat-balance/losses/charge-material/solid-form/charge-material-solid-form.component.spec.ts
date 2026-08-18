import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { ChargeMaterialSolidFormComponent } from './charge-material-solid-form.component';
import { SolidMaterialFormService } from './solid-material-form.service';
import { SolidLoadMaterialDbService } from '../../../../../indexedDb/solid-load-material-db.service';
import { ModalDialogService } from '../../../../../shared/modal-dialog.service';
import { SolidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

const MOCK_MATERIALS: SolidLoadChargeMaterial[] = [
  { id: 1, substance: 'Iron', specificHeatSolid: 0.11, specificHeatLiquid: 0.16, latentHeat: 65, meltingPoint: 2795 },
  { id: 2, substance: 'Aluminum', specificHeatSolid: 0.21, specificHeatLiquid: 0.26, latentHeat: 170, meltingPoint: 1220 },
];

function makeSolidForm(formService: SolidMaterialFormService, overrides: Partial<SolidLoadChargeMaterial> & { materialId?: number } = {}) {
  return formService.getSolidChargeMaterialForm({
    solidChargeMaterial: {
      materialId: overrides.materialId ?? 1,
      specificHeatSolid: overrides.specificHeatSolid,
      latentHeat: overrides.latentHeat,
      specificHeatLiquid: overrides.specificHeatLiquid,
      meltingPoint: overrides.meltingPoint ?? 2795,
      chargeFeedRate: 100,
      waterContentCharged: 0,
      waterContentDischarged: 0,
      initialTemperature: 70,
      dischargeTemperature: 2000,
      waterVaporDischargeTemperature: 212,
      chargeMelted: 0,
      chargeReacted: 0,
      reactionHeat: 0,
      thermicReactionType: 0,
      additionalHeat: 0,
    },
  });
}

describe('ChargeMaterialSolidFormComponent', () => {
  let component: ChargeMaterialSolidFormComponent;
  let fixture: ComponentFixture<ChargeMaterialSolidFormComponent>;
  let solidFormService: SolidMaterialFormService;
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
      declarations: [ChargeMaterialSolidFormComponent],
      providers: [
        SolidMaterialFormService,
        { provide: SolidLoadMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    solidFormService = TestBed.inject(SolidMaterialFormService);

    fixture = TestBed.createComponent(ChargeMaterialSolidFormComponent);
    component = fixture.componentInstance;
  });

  function setInputsAndInit(form = makeSolidForm(solidFormService)): void {
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
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 2, specificHeatSolid: null }));
      expect(component.form().controls.materialSpecificHeatOfSolidMaterial.value).toBe(0.21);
      expect(component.form().controls.materialLatentHeatOfFusion.value).toBe(170);
    });

    it('does not overwrite an already-populated specific heat value', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 2, specificHeatSolid: 99 }));
      expect(component.form().controls.materialSpecificHeatOfSolidMaterial.value).toBe(99);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 999 }));
      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('observeInitialTemperatureValidator', () => {
    it('calls setInitialTempValidator when the discharge temperature changes', () => {
      setInputsAndInit();
      spyOn(solidFormService, 'setInitialTempValidator').and.callThrough();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(1800);

      expect(solidFormService.setInitialTempValidator).toHaveBeenCalledWith(component.form());
    });
  });

  describe('observeWarnings', () => {
    it('sets warnings from the current form state on init', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { meltingPoint: 2795 }));
      component.form().patchValue({ chargeMaterialDischargeTemperature: 3000, percentChargeMelted: 0 }, { emitEvent: false });
      component.form().controls.chargeMaterialDischargeTemperature.setValue(3000);

      expect(component.warnings().dischargeAboveMeltingPointNoMeltPercent).toContain('higher than the melting point');
    });

    it('recomputes warnings when the form value changes again', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { meltingPoint: 2795 }));

      component.form().patchValue({ chargeMaterialDischargeTemperature: 3000, percentChargeMelted: 0 });
      expect(component.warnings().dischargeAboveMeltingPointNoMeltPercent).not.toBeNull();

      component.form().patchValue({ percentChargeMelted: 50 });
      expect(component.warnings().dischargeAboveMeltingPointNoMeltPercent).toBeNull();
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material properties when a material is chosen', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 1, specificHeatSolid: 5 }));
      component.materialSelector.onMaterialSelected(2);
      expect(component.form().controls.materialSpecificHeatOfSolidMaterial.value).toBe(0.21);
    });

    it('opens the add-material modal and applies the returned material on close', () => {
      setInputsAndInit();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const newMaterial: SolidLoadChargeMaterial = { id: 3, substance: 'Copper', specificHeatSolid: 0.09, specificHeatLiquid: 0.15, latentHeat: 80, meltingPoint: 1981 };
      dialogClosed.next(newMaterial);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.materialSpecificHeatOfSolidMaterial.value).toBe(0.09);
      expect(component.materialSelector.materialTypes()).toContain(newMaterial);
    });

    it('restores a deleted material record and clears the missing-material flag', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 999, specificHeatSolid: 5, specificHeatLiquid: 6, latentHeat: 7, meltingPoint: 8 }));
      const restored: SolidLoadChargeMaterial = { id: 999, substance: 'Custom Material', specificHeatSolid: 5, specificHeatLiquid: 6, latentHeat: 7, meltingPoint: 8, isDefault: false };
      dbServiceSpy.addWithObservable.and.returnValue(of(restored));

      component.materialSelector.restoreDeletedMaterial();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({ id: 999, substance: 'Custom Material' }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(component.form().controls.materialId.value).toBe(999);
    });

    it('dismisses the missing-material warning without restoring a record', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 999 }));
      component.materialSelector.dismissMissingMaterial();
      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(dbServiceSpy.addWithObservable).not.toHaveBeenCalled();
    });
  });

  describe('differs', () => {
    it('returns false when the form value matches the database value', () => {
      setInputsAndInit();
      expect(component.differs(0.11, 0.11, component.UNITS.specificHeat)).toBeFalse();
    });

    it('returns true when the form value has been overridden from the database value', () => {
      setInputsAndInit();
      expect(component.differs(5, 0.11, component.UNITS.specificHeat)).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('hides the missing-material alert when missingMaterialId is null', () => {
      setInputsAndInit();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when missingMaterialId is set', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 999 }));
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the "differs from database" note when the value matches the selected material', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 1, specificHeatSolid: 0.11 }));
      expect(fixture.nativeElement.querySelector('[formcontrolname="materialSpecificHeatOfSolidMaterial"] ~ .text-warning')).toBeNull();
    });

    it('shows the "differs from database" note when the value has been overridden', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { materialId: 1, specificHeatSolid: 99 }));
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

    it('hides the melting-point warnings when neither condition is met', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { meltingPoint: 2795 }));
      component.form().patchValue({ chargeMaterialDischargeTemperature: 2795, percentChargeMelted: 0 });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.alert-warning.my-1').length).toBe(0);
    });
  });

  describe('destroy', () => {
    it('stops recomputing warnings after the component is destroyed', () => {
      setInputsAndInit(makeSolidForm(solidFormService, { meltingPoint: 2795 }));
      fixture.destroy();

      const warningsBefore = component.warnings();
      component.form().patchValue({ chargeMaterialDischargeTemperature: 3000, percentChargeMelted: 0 });

      expect(component.warnings()).toBe(warningsBefore);
    });

    it('stops applying the initial-temperature validator after the component is destroyed', () => {
      setInputsAndInit();
      spyOn(solidFormService, 'setInitialTempValidator').and.callThrough();
      fixture.destroy();

      component.form().controls.chargeMaterialDischargeTemperature.setValue(1500);

      expect(solidFormService.setInitialTempValidator).not.toHaveBeenCalled();
    });
  });
});
