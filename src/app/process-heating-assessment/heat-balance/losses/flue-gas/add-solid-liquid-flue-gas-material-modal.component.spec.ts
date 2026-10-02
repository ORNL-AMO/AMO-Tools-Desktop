import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { fakeAsync, flushMicrotasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { AddSolidLiquidFlueGasMaterialModalComponent } from './add-solid-liquid-flue-gas-material-modal.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_DATA: MaterialModalData = { settings: MOCK_SETTINGS };

const ANALYSIS = { carbon: 70.3, hydrogen: 4.9, sulphur: 2.2, inertAsh: 1.5, o2: 8.7, moisture: 4.9, nitrogen: 7.5 };
const HEATING_VALUE = 12000;

describe('AddSolidLiquidFlueGasMaterialModalComponent', () => {
  let component: AddSolidLiquidFlueGasMaterialModalComponent;
  let fixture: ComponentFixture<AddSolidLiquidFlueGasMaterialModalComponent>;
  let dbServiceSpy: jasmine.SpyObj<SolidLiquidMaterialDbService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<SolidLiquidFlueGasMaterial>>;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('SolidLiquidMaterialDbService', ['addMaterial']);
    dbServiceSpy.addMaterial.and.resolveTo(7);
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasByMassCalculateHeatingValue']);
    apiSpy.flueGasByMassCalculateHeatingValue.and.returnValue(HEATING_VALUE);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddSolidLiquidFlueGasMaterialModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: MOCK_DATA },
        { provide: DialogRef, useValue: dialogRefSpy },
        { provide: SolidLiquidMaterialDbService, useValue: dbServiceSpy },
        { provide: ProcessHeatingApiService, useValue: apiSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSolidLiquidFlueGasMaterialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component.form.patchValue({ substance: 'Test fuel', ...ANALYSIS });
  }

  describe('initialization', () => {
    it('reads settings from the injected dialog data', () => {
      expect(component.settings).toBe(MOCK_SETTINGS);
    });
  });

  describe('save', () => {
    it('does not save when the form is invalid', () => {
      component.save();

      expect(dbServiceSpy.addMaterial).not.toHaveBeenCalled();
    });

    it('saves the fuel analysis with the calculated heating value as a non-default material', () => {
      fillValidForm();

      component.save();

      expect(apiSpy.flueGasByMassCalculateHeatingValue).toHaveBeenCalledWith(ANALYSIS);
      expect(dbServiceSpy.addMaterial).toHaveBeenCalledWith(jasmine.objectContaining({
        substance: 'Test fuel', ...ANALYSIS, heatingValue: HEATING_VALUE, isDefault: false,
      }));
    });

    it('closes the dialog with the inserted material once the save completes', fakeAsync(() => {
      fillValidForm();

      component.save();
      flushMicrotasks();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({ id: 7, substance: 'Test fuel' }));
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
