import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasFormService, FlueGasVolumeForm } from './flue-gas-form.service';
import { FlueGasVolumeFormComponent } from './flue-gas-volume-form.component';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const MOCK_MATERIALS = [
  { id: 1, substance: 'Natural Gas', CH4: 87, C2H6: 8.5, N2: 3.6, H2: 0.4, C3H8: 0, C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0.4, SO2: 0, O2: 0.1, specificGravity: 0.6, heatingValue: 1000, heatingValueVolume: 950 },
  { id: 2, substance: 'Hydrogen', CH4: 0, C2H6: 0, N2: 0, H2: 100, C3H8: 0, C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0, specificGravity: 0.07, heatingValue: 300, heatingValueVolume: 290 },
] as FlueGasMaterial[];

describe('FlueGasVolumeFormComponent', () => {
  let component: FlueGasVolumeFormComponent;
  let fixture: ComponentFixture<FlueGasVolumeFormComponent>;
  let formService: FlueGasFormService;
  let dbServiceSpy: jasmine.SpyObj<FlueGasMaterialDbService>;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let dialogClosed: Subject<FlueGasMaterial | undefined>;

  beforeEach(async () => {
    dbServiceSpy = jasmine.createSpyObj('FlueGasMaterialDbService', ['addMaterial'], {
      dbFlueGasMaterials: new BehaviorSubject<FlueGasMaterial[]>(MOCK_MATERIALS),
    });
    dialogClosed = new Subject<FlueGasMaterial | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: dialogClosed.asObservable() } as never);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlueGasVolumeFormComponent],
      providers: [
        FlueGasFormService,
        ConvertUnitsService,
        { provide: FlueGasMaterialDbService, useValue: dbServiceSpy },
        { provide: ModalDialogService, useValue: modalDialogServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(FlueGasFormService);
    fixture = TestBed.createComponent(FlueGasVolumeFormComponent);
    component = fixture.componentInstance;
  });

  function render(form: FlueGasVolumeForm = formService.getFlueGasVolumeForm({}, MOCK_SETTINGS)): void {
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('instanceId', 'instance-1');
    fixture.detectChanges();
  }

  function formForMaterial(materialId: number, composition: Partial<Record<'CH4', number>> = {}): FlueGasVolumeForm {
    return formService.getFlueGasVolumeForm({ flueGasByVolume: { gasTypeId: materialId, ...composition } }, MOCK_SETTINGS);
  }

  describe('initialization', () => {
    it('loads materials from the database into the material selector', () => {
      render();

      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });

    it('applies the matching material when the form has no composition yet', () => {
      render(formForMaterial(2));

      expect(component.form().controls.H2.value).toBe(100);
      expect(component.form().controls.specificGravity.value).toBe(0.07);
    });

    it('does not overwrite an already-populated composition', () => {
      render(formForMaterial(2, { CH4: 55 }));

      expect(component.form().controls.CH4.value).toBe(55);
      expect(component.form().controls.H2.value).not.toBe(100);
    });

    it('flags a materialId with no matching loaded material as missing', () => {
      render(formForMaterial(999));

      expect(component.materialSelector.missingMaterialId()).toBe(999);
    });
  });

  describe('materialSelector user actions', () => {
    it('applies the selected material when a material is chosen', () => {
      render();

      component.materialSelector.onMaterialSelected(2);

      expect(component.form().controls.H2.value).toBe(100);
      expect(component.form().controls.heatingValue.value).toBe(300);
    });

    it('opens the add-material modal and applies the returned material on close', () => {
      render();
      component.materialSelector.openAddMaterialModal();
      expect(modalDialogServiceSpy.openModal).toHaveBeenCalled();

      const added = { ...MOCK_MATERIALS[1], id: 3, substance: 'Custom' } as FlueGasMaterial;
      dialogClosed.next(added);

      expect(component.form().controls.materialId.value).toBe(3);
      expect(component.form().controls.H2.value).toBe(100);
      expect(component.materialSelector.materialTypes()).toContain(added);
    });

    it('restores a deleted material and clears the missing-material flag', fakeAsync(() => {
      dbServiceSpy.addMaterial.and.resolveTo(999);
      render(formForMaterial(999, { CH4: 55 }));

      component.materialSelector.restoreDeletedMaterial();
      flushMicrotasks();

      expect(dbServiceSpy.addMaterial).toHaveBeenCalledWith(jasmine.objectContaining({ CH4: 55 }));
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
    it('hides the missing-material alert when the material exists', () => {
      render();

      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the missing-material alert when the material is not in the database', () => {
      render(formForMaterial(999));

      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('renders an input for every gas fraction', () => {
      render();

      for (const fraction of ['CH4', 'C2H6', 'N2', 'H2', 'C3H8', 'C4H10_CnH2n', 'H2O', 'CO', 'CO2', 'SO2', 'O2']) {
        expect(fixture.nativeElement.querySelector(`#${fraction}_instance-1`)).withContext(fraction).not.toBeNull();
      }
    });
  });

  describe('destroy', () => {
    it('does not re-apply a material after the component is destroyed', () => {
      const materials = (dbServiceSpy.dbFlueGasMaterials as BehaviorSubject<FlueGasMaterial[]>);
      render(formForMaterial(2, { CH4: 55 }));
      fixture.destroy();

      materials.next([{ ...MOCK_MATERIALS[1], H2: 1 } as FlueGasMaterial]);

      expect(component.materialSelector.materialTypes()).toEqual(MOCK_MATERIALS);
    });
  });
});
