import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { fakeAsync, flushMicrotasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SigFigsPipe } from '../../../../shared/shared-pipes/sig-figs.pipe';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { AddFlueGasMaterialModalComponent } from './add-flue-gas-material-modal.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_DATA: MaterialModalData = { settings: MOCK_SETTINGS };

const COMPOSITION = { CH4: 87, C2H6: 8.5, N2: 3.6, H2: 0.4, C3H8: 0, C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0.4, SO2: 0, O2: 0.1 };
const EXISTING_MATERIAL: FlueGasMaterial = { id: 1, substance: 'Natural Gas', ...COMPOSITION, heatingValue: 1000, heatingValueVolume: 950, specificGravity: 0.6 };
const HEATING_VALUES = { heatingValue: 1000, heatingValueVolume: 950, specificGravity: 0.6 };

describe('AddFlueGasMaterialModalComponent', () => {
  let component: AddFlueGasMaterialModalComponent;
  let fixture: ComponentFixture<AddFlueGasMaterialModalComponent>;
  let dbServiceSpy: jasmine.SpyObj<FlueGasMaterialDbService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<FlueGasMaterial>>;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(async () => {
    MOCK_SETTINGS.unitsOfMeasure = 'Imperial';
    dbServiceSpy = jasmine.createSpyObj('FlueGasMaterialDbService', ['addMaterial'], { dbFlueGasMaterials: new BehaviorSubject<FlueGasMaterial[]>([EXISTING_MATERIAL]) });
    dbServiceSpy.addMaterial.and.resolveTo(7);
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasByVolumeCalculateHeatingValue']);
    apiSpy.flueGasByVolumeCalculateHeatingValue.and.returnValue(HEATING_VALUES as never);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddFlueGasMaterialModalComponent, SigFigsPipe],
      providers: [
        { provide: DIALOG_DATA, useValue: MOCK_DATA },
        ConvertUnitsService,
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: FlueGasMaterialDbService, useValue: dbServiceSpy },
        { provide: ProcessHeatingApiService, useValue: apiSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFlueGasMaterialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.form.patchValue({ substance: 'Test gas', ...COMPOSITION });
  }

  describe('initialization', () => {
    it('reads settings from the injected dialog data', () => {
      expect(component.settings).toBe(MOCK_SETTINGS);
    });
  });

  describe('existing material', () => {
    it('lists the saved materials', () => {
      expect(component.materials()).toEqual([EXISTING_MATERIAL]);
    });

    it('starts a new fuel from the selected material with a (mod) name', () => {
      component.applyExistingMaterial(EXISTING_MATERIAL);

      expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({ substance: 'Natural Gas (mod)', ...COMPOSITION }));
    });

    it('ignores an empty selection', () => {
      component.applyExistingMaterial(null);

      expect(component.form.controls.substance.value).toBe('');
    });
  });

  describe('results', () => {
    it('totals the components and reports the difference from 100%', () => {
      fillValidForm();

      expect(component.totalOfComponents()).toBeCloseTo(100, 6);
      expect(component.difference()).toBeCloseTo(0, 6);
      expect(component.hasLargeDifference()).toBeFalse();
    });

    it('flags a difference beyond 0.4%', () => {
      fillValidForm();
      component.form.patchValue({ CH4: 80 });

      expect(component.hasLargeDifference()).toBeTrue();
    });

    it('shows the calculated heating values once every component is entered', () => {
      expect(component.calculatedProperties()).toBeNull();

      fillValidForm();

      expect(component.calculatedProperties()).toEqual(jasmine.objectContaining(HEATING_VALUES));
    });

    it('converts heating values to kJ for Metric settings', () => {
      component.settings.unitsOfMeasure = 'Metric';
      fillValidForm();

      expect(component.calculatedProperties()?.heatingValue).toBeCloseTo(2326, 0);
    });
  });

  describe('save', () => {
    [-1, 101].forEach(value => {
      it(`does not save when a percentage is ${value}`, () => {
        fillValidForm();
        component.form.patchValue({ CH4: value });

        component.save();

        expect(component.form.controls.CH4.invalid).toBeTrue();
        expect(dbServiceSpy.addMaterial).not.toHaveBeenCalled();
      });
    });

    it('does not save when the form is invalid', () => {
      component.save();

      expect(dbServiceSpy.addMaterial).not.toHaveBeenCalled();
    });

    it('saves the composition with the calculated heating values as a non-default material', () => {
      fillValidForm();

      component.save();

      expect(apiSpy.flueGasByVolumeCalculateHeatingValue).toHaveBeenCalledWith(COMPOSITION);
      expect(dbServiceSpy.addMaterial).toHaveBeenCalledWith(jasmine.objectContaining({
        substance: 'Test gas', ...COMPOSITION, ...HEATING_VALUES, isDefault: false,
      }));
    });

    it('closes the dialog with the inserted material once the save completes', fakeAsync(() => {
      fillValidForm();

      component.save();
      flushMicrotasks();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({ id: 7, substance: 'Test gas' }));
    }));
  });

  describe('close', () => {
    it('closes the dialog without a result', () => {
      component.close();

      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('template rendering', () => {
    it('disables the save button while the form is invalid', () => {
      const saveButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary');

      expect(saveButton.disabled).toBeTrue();
    });

    it('enables the save button when the form is valid', () => {
      fillValidForm();
      fixture.detectChanges();

      const saveButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary');
      expect(saveButton.disabled).toBeFalse();
    });
  });
});
