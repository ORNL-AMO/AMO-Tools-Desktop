import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { AddLiquidMaterialModalComponent } from './add-liquid-material-modal.component';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { MaterialModalData } from '../../../../models/material-modal-data';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const MOCK_DATA: MaterialModalData = { settings: MOCK_SETTINGS };

const VALID_FORM_VALUE = {
  substance: 'Solvent',
  specificHeatLiquid: 0.6,
  specificHeatVapor: 0.3,
  latentHeat: 200,
  vaporizationTemperature: 300,
};

// The modal's FormBuilder group infers numeric controls as FormControl<null> (no non-null initial
// value or generic given), so patching with real numbers needs a cast at this one boundary.
function fillValidForm(form: AddLiquidMaterialModalComponent['form']): void {
  form.patchValue(VALID_FORM_VALUE as unknown as Partial<typeof form['value']>);
}

const EXISTING_MATERIAL: LiquidLoadChargeMaterial = { id: 1, substance: 'Water', specificHeatLiquid: 1, specificHeatVapor: 0.48, latentHeat: 970, vaporizationTemperature: 212, isDefault: true };

describe('AddLiquidMaterialModalComponent', () => {
  let component: AddLiquidMaterialModalComponent;
  let fixture: ComponentFixture<AddLiquidMaterialModalComponent>;
  let dbServiceSpy: jasmine.SpyObj<LiquidLoadMaterialDbService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<LiquidLoadChargeMaterial>>;

  beforeEach(async () => {
    MOCK_SETTINGS.unitsOfMeasure = 'Imperial';
    dbServiceSpy = jasmine.createSpyObj('LiquidLoadMaterialDbService', ['addWithObservable', 'getAllWithObservable']);
    dbServiceSpy.getAllWithObservable.and.returnValue(new BehaviorSubject<LiquidLoadChargeMaterial[]>([EXISTING_MATERIAL]));
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddLiquidMaterialModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: MOCK_DATA },
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: LiquidLoadMaterialDbService, useValue: dbServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddLiquidMaterialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('existing material', () => {
    it('lists the saved materials', () => {
      expect(component.materials()).toEqual([EXISTING_MATERIAL]);
    });

    it('starts a new material from the selected one with a (mod) name', () => {
      component.applyExistingMaterial(EXISTING_MATERIAL);

      expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({ substance: 'Water (mod)', specificHeatLiquid: 1, specificHeatVapor: 0.48, latentHeat: 970, vaporizationTemperature: 212 }));
    });

    it('converts the selected material to Metric units for display', () => {
      MOCK_SETTINGS.unitsOfMeasure = 'Metric';

      component.applyExistingMaterial(EXISTING_MATERIAL);

      expect(component.form.getRawValue().specificHeatLiquid).not.toBe(1);
    });

    it('ignores an empty selection', () => {
      component.applyExistingMaterial(null);

      expect(component.form.controls.substance.value).toBe('');
    });
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('reads settings from the injected dialog data', () => {
      expect(component.settings).toBe(MOCK_SETTINGS);
    });
  });

  describe('save', () => {
    it('does not call the database service when the form is invalid', () => {
      component.save();
      expect(dbServiceSpy.addWithObservable).not.toHaveBeenCalled();
    });

    it('adds the material to the database with the form values when valid', () => {
      fillValidForm(component.form);
      dbServiceSpy.addWithObservable.and.returnValue(of({ id: 3, ...VALID_FORM_VALUE, isDefault: false }));

      component.save();

      expect(dbServiceSpy.addWithObservable).toHaveBeenCalledWith(jasmine.objectContaining({
        ...VALID_FORM_VALUE,
        isDefault: false,
      }));
    });

    it('closes the dialog with the inserted material once the database call completes', () => {
      fillValidForm(component.form);
      const inserted: LiquidLoadChargeMaterial = { id: 3, ...VALID_FORM_VALUE, isDefault: false };
      dbServiceSpy.addWithObservable.and.returnValue(of(inserted));

      component.save();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(inserted);
    });
  });

  describe('close', () => {
    it('closes the dialog without a result', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('template rendering', () => {
    it('disables the save button when the form is invalid', () => {
      const saveButton: HTMLButtonElement = fixture.nativeElement.querySelectorAll('button')[1];
      expect(saveButton.disabled).toBeTrue();
    });

    it('enables the save button when the form is valid', () => {
      fillValidForm(component.form);
      fixture.detectChanges();

      const saveButton: HTMLButtonElement = fixture.nativeElement.querySelectorAll('button')[1];
      expect(saveButton.disabled).toBeFalse();
    });
  });
});
