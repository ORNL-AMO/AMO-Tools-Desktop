import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { fakeAsync, flushMicrotasks, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SigFigsPipe } from '../../../../shared/shared-pipes/sig-figs.pipe';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';
import { MaterialModalData } from '../../../models/material-modal-data';
import { AddSolidLiquidFlueGasMaterialModalComponent } from './add-solid-liquid-flue-gas-material-modal.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_DATA: MaterialModalData = { settings: MOCK_SETTINGS };

const ANALYSIS = { carbon: 70.3, hydrogen: 4.9, sulphur: 2.2, inertAsh: 1.5, o2: 8.7, moisture: 4.9, nitrogen: 7.5 };
const EXISTING_MATERIAL: SolidLiquidFlueGasMaterial = { id: 1, substance: 'Coal', ...ANALYSIS, heatingValue: 12000 };
const HEATING_VALUE = 12000;

describe('AddSolidLiquidFlueGasMaterialModalComponent', () => {
  let component: AddSolidLiquidFlueGasMaterialModalComponent;
  let fixture: ComponentFixture<AddSolidLiquidFlueGasMaterialModalComponent>;
  let dbServiceSpy: jasmine.SpyObj<SolidLiquidMaterialDbService>;
  let dialogRefSpy: jasmine.SpyObj<DialogRef<SolidLiquidFlueGasMaterial>>;
  let apiSpy: jasmine.SpyObj<ProcessHeatingApiService>;

  beforeEach(async () => {
    MOCK_SETTINGS.unitsOfMeasure = 'Imperial';
    dbServiceSpy = jasmine.createSpyObj('SolidLiquidMaterialDbService', ['addMaterial'], { dbSolidLiquidFlueGasMaterials: new BehaviorSubject<SolidLiquidFlueGasMaterial[]>([EXISTING_MATERIAL]) });
    dbServiceSpy.addMaterial.and.resolveTo(7);
    dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
    apiSpy = jasmine.createSpyObj('ProcessHeatingApiService', ['flueGasByMassCalculateHeatingValue']);
    apiSpy.flueGasByMassCalculateHeatingValue.and.returnValue(HEATING_VALUE);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AddSolidLiquidFlueGasMaterialModalComponent, SigFigsPipe],
      providers: [
        ConvertUnitsService,
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

  describe('existing material', () => {
    it('lists the saved materials', () => {
      expect(component.materials()).toEqual([EXISTING_MATERIAL]);
    });

    it('starts a new fuel from the selected material with a (mod) name', () => {
      component.applyExistingMaterial(EXISTING_MATERIAL);

      expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({ substance: 'Coal (mod)', ...ANALYSIS }));
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
      expect(component.hasLargeDifference()).toBeFalse();
    });

    it('flags a difference beyond 0.4%', () => {
      fillValidForm();
      component.form.patchValue({ carbon: 60 });

      expect(component.hasLargeDifference()).toBeTrue();
    });

    it('shows the heating value once every component is entered', () => {
      expect(component.heatingValue()).toBeNull();

      fillValidForm();

      expect(component.heatingValue()).toBe(HEATING_VALUE);
    });

    it('converts the heating value to kJ/kg for Metric settings', () => {
      MOCK_SETTINGS.unitsOfMeasure = 'Metric';
      fillValidForm();

      expect(component.heatingValue()).toBeCloseTo(27912, -1);
    });
  });

  describe('results rendering', () => {
    it('renders the totals and heating value rows', () => {
      fillValidForm();
      fixture.detectChanges();

      const text: string = fixture.nativeElement.querySelector('dl').textContent;
      expect(text).toContain('Total of Fuel Components');
      expect(text).toContain('Difference');
      expect(text).toContain('Heating Value');
      expect(text).toContain('Btu/lb');
    });
  });

  describe('save', () => {
    [-1, 101].forEach(value => {
      it(`does not save when a percentage is ${value}`, () => {
        fillValidForm();
        component.form.patchValue({ carbon: value });

        component.save();

        expect(component.form.controls.carbon.invalid).toBeTrue();
        expect(dbServiceSpy.addMaterial).not.toHaveBeenCalled();
      });
    });

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
