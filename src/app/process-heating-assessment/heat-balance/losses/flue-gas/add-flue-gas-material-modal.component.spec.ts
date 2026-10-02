import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { fakeAsync, flushMicrotasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { AddFlueGasMaterialModalComponent } from './add-flue-gas-material-modal.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_DATA: MaterialModalData = { settings: MOCK_SETTINGS };

const COMPOSITION = { CH4: 87, C2H6: 8.5, N2: 3.6, H2: 0.4, C3H8: 0, C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0.4, SO2: 0, O2: 0.1 };
const HEATING_VALUES = { heatingValue: 1000, heatingValueVolume: 950, specificGravity: 0.6 };

describe('AddFlueGasMaterialModalComponent', () => {
  let component: AddFlueGasMaterialModalComponent;
  let fixture: ComponentFixture<AddFlueGasMaterialModalComponent>;
  let dbServiceSpy: jasmine.SpyObj<FlueGasMaterialDbService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<FlueGasMaterial>>;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('FlueGasMaterialDbService', ['addMaterial']);
    dbServiceSpy.addMaterial.and.resolveTo(7);
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasByVolumeCalculateHeatingValue']);
    apiSpy.flueGasByVolumeCalculateHeatingValue.and.returnValue(HEATING_VALUES as never);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddFlueGasMaterialModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: MOCK_DATA },
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

  describe('save', () => {
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
