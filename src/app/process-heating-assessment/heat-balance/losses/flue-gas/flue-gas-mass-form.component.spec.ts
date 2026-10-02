import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { FLUE_GAS_FUEL_ANALYSIS, FlueGasFormService, FlueGasMassForm } from './flue-gas-form.service';
import { FlueGasMassFormComponent } from './flue-gas-mass-form.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const MOCK_MATERIALS: SolidLiquidFlueGasMaterial[] = [
  { id: 1, substance: 'Coal', carbon: 75, hydrogen: 5, sulphur: 1, inertAsh: 8, o2: 8, moisture: 2, nitrogen: 1, heatingValue: 12000, isDefault: true },
  { id: 2, substance: 'Fuel Oil', carbon: 86, hydrogen: 12, sulphur: 1, inertAsh: 0, o2: 0.5, moisture: 0.3, nitrogen: 0.2, heatingValue: 18000, isDefault: true },
];

describe('FlueGasMassFormComponent', () => {
  let component: FlueGasMassFormComponent;
  let fixture: ComponentFixture<FlueGasMassFormComponent>;
  let formService: FlueGasFormService;
  let dbServiceSpy: jasmine.SpyObj<SolidLiquidMaterialDbService>;
  let materials: BehaviorSubject<SolidLiquidFlueGasMaterial[]>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<SolidLiquidFlueGasMaterial | undefined>;

  beforeEach(async () => {
    materials = new BehaviorSubject<SolidLiquidFlueGasMaterial[]>(MOCK_MATERIALS);
    dbServiceSpy = jasmine.createSpyObj('SolidLiquidMaterialDbService', ['addMaterial'], { dbSolidLiquidFlueGasMaterials: materials });
    dialogClosed = new Subject<SolidLiquidFlueGasMaterial | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as never);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlueGasMassFormComponent],
      providers: [
        FlueGasFormService,
        ConvertUnitsService,
        { provide: SolidLiquidMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(FlueGasFormService);
    fixture = TestBed.createComponent(FlueGasMassFormComponent);
    component = fixture.componentInstance;
  });

  function formForMaterial(materialId: number, carbon?: number): FlueGasMassForm {
    return formService.getFlueGasMassForm({ flueGasByMass: { gasTypeId: materialId, carbon } }, MOCK_SETTINGS);
  }

  function render(form: FlueGasMassForm = formService.getFlueGasMassForm({}, MOCK_SETTINGS)): void {
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('loads materials from the database into the material selector', () => {
      render();

      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });

    it('applies the matching fuel when the form has no analysis yet', () => {
      render(formForMaterial(2));

      expect(component.form().controls.carbon.value).toBe(86);
      expect(component.form().controls.heatingValue.value).toBe(18000);
    });

    it('does not overwrite an already-populated analysis', () => {
      render(formForMaterial(2, 55));

      expect(component.form().controls.carbon.value).toBe(55);
      expect(component.form().controls.hydrogen.value).not.toBe(12);
    });

    it('flags a materialId with no matching loaded fuel as missing', () => {
      render(formForMaterial(999));

      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('materialSelector user actions', () => {
    it('applies every analysis field of the selected fuel', () => {
      render();

      component.materialSelector.onMaterialSelected(2);

      for (const { key } of FLUE_GAS_FUEL_ANALYSIS) {
        expect(component.form().controls[key].value).withContext(key).toBe(MOCK_MATERIALS[1][key]);
      }
    });

    it('opens the add-fuel modal and applies the returned fuel on close', () => {
      render();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const added: SolidLiquidFlueGasMaterial = { ...MOCK_MATERIALS[1], id: 3, substance: 'Custom', isDefault: false };
      dialogClosed.next(added);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.carbon.value).toBe(86);
      expect(component.materialSelector.materialTypes()).toContain(added);
    });

    it('restores a deleted fuel and clears the missing-material flag', fakeAsync(() => {
      dbServiceSpy.addMaterial.and.resolveTo(999);
      render(formForMaterial(999, 55));

      component.materialSelector.restoreDeletedMaterial();
      flushMicrotasks();

      expect(dbServiceSpy.addMaterial).toHaveBeenCalledWith(jasmine.objectContaining({ carbon: 55 }));
      expect(component.materialSelector.missingMaterialId()).toBeNull();
    }));

    it('dismisses the missing-material warning without saving a record', () => {
      render(formForMaterial(999));

      component.materialSelector.dismissMissingMaterial();

      expect(component.materialSelector.missingMaterialId()).toBeNull();
      expect(dbServiceSpy.addMaterial).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('hides the missing-material alert when the fuel exists', () => {
      render();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when the fuel is not in the database', () => {
      render(formForMaterial(999));

      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('renders ash discharge, unburned carbon and an input for every analysis field', () => {
      render();

      for (const control of ['ashDischargeTemperature', 'unburnedCarbonInAsh', ...FLUE_GAS_FUEL_ANALYSIS.map(({ key }) => key)]) {
        expect(fixture.nativeElement.querySelector(`#${control}_instance-1`)).withContext(control).not.toBeNull();
      }
    });
  });

  describe('destroy', () => {
    it('stops listening to the fuel database after the component is destroyed', () => {
      render();
      fixture.destroy();

      materials.next([]);

      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });
  });
});
