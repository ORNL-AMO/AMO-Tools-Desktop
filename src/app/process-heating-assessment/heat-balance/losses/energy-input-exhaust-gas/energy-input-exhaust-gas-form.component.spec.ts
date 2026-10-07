import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { EnergyInputExhaustGasLoss } from '../../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputExhaustGasFormComponent } from './energy-input-exhaust-gas-form.component';
import { EnergyInputExhaustGasFormService } from './energy-input-exhaust-gas-form.service';
import { EnergyInputExhaustGasItem } from './energy-input-exhaust-gas.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric', energyResultUnit: 'kJ' } as Settings;

describe('EnergyInputExhaustGasFormComponent', () => {
  let component: EnergyInputExhaustGasFormComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasFormComponent>;
  let formService: EnergyInputExhaustGasFormService;
  let modalDialogServiceSpy: jasmine.SpyObj<ModalDialogService>;
  let closed$: Subject<number | undefined>;

  beforeEach(async () => {
    closed$ = new Subject<number | undefined>();
    modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    modalDialogServiceSpy.openModal.and.returnValue({ closed: closed$.asObservable() } as never);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EnergyInputExhaustGasFormComponent],
      providers: [EnergyInputExhaustGasFormService, { provide: ModalDialogService, useValue: modalDialogServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    formService = TestBed.inject(EnergyInputExhaustGasFormService);
    fixture = TestBed.createComponent(EnergyInputExhaustGasFormComponent);
    component = fixture.componentInstance;
  });

  function render(loss: EnergyInputExhaustGasLoss = {}, settings: Settings = IMPERIAL): EnergyInputExhaustGasItem {
    const item: EnergyInputExhaustGasItem = { id: 'item-1', name: 'Loss #1', collapse: false, heatLoss: null, form: formService.getEnergyInputExhaustGasForm(loss) };
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
    return item;
  }

  const query = (id: string) => fixture.nativeElement.querySelector(`[id="${id}"]`);

  describe('initialization', () => {
    it('exposes the item form', () => {
      const item = render();

      expect(component.form()).toBe(item.form as ReturnType<typeof component.form>);
    });

    it('generates a control id for every form control', () => {
      render();

      expect(Object.keys(component.controlIds())).toEqual(Object.keys(component.form().controls));
    });
  });

  describe('openFlueGasModal', () => {
    it('opens the dialog with the current settings', () => {
      render();

      component.openFlueGasModal();

      expect(modalDialogServiceSpy.openModal.calls.mostRecent().args[1]?.data).toEqual({ settings: IMPERIAL });
    });

    it('applies the calculated available heat rounded to 1 decimal', () => {
      const item = render({ totalHeatInput: 5 });
      component.openFlueGasModal();

      closed$.next(78.456);

      expect((item.form as ReturnType<typeof component.form>).controls.availableHeat.value).toBe(78.5);
    });

    it('leaves available heat unchanged when the dialog is cancelled', () => {
      const item = render({ totalHeatInput: 5, availableHeat: 60 });
      component.openFlueGasModal();

      closed$.next(undefined);

      expect((item.form as ReturnType<typeof component.form>).controls.availableHeat.value).toBe(60);
    });
  });

  describe('template conditionals', () => {
    it('hides available heat when total additional fuel heat is 0', () => {
      render({ totalHeatInput: 0 });

      expect(query(component.controlIds().availableHeat)).toBeNull();
    });

    it('shows available heat once total additional fuel heat is greater than 0', () => {
      render({ totalHeatInput: 0 });

      const heatInput: HTMLInputElement = query(component.controlIds().totalHeatInput);
      heatInput.value = '5';
      heatInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(query(component.controlIds().availableHeat)).not.toBeNull();
    });

    it('shows MMBtu/hr in Imperial and GJ/hr in Metric', () => {
      render();
      expect(fixture.nativeElement.textContent).toContain('MMBtu/hr');

      fixture.componentRef.setInput('settings', METRIC);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('GJ/hr');
    });

    it('marks the efficiency group invalid when out of range', () => {
      render({ electricalHeaterEfficiency: 101 });

      expect(query(component.controlIds().electricalHeaterEfficiency).closest('.input-group').classList).toContain('invalid');
    });

    it('does not mark the efficiency group invalid for a valid value', () => {
      render();

      expect(query(component.controlIds().electricalHeaterEfficiency).closest('.input-group').classList).not.toContain('invalid');
    });
  });
});
