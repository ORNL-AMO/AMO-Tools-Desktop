import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { EnergyInputComponent } from './energy-input.component';
import { EnergyInputItem, EnergyInputService } from './energy-input.service';
import { EnergyInputFormService, EnergyInputWarnings } from './energy-input-form.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: EnergyInputFormService, id: string, name: string, heatLoss: number | null = null): EnergyInputItem {
  return { id, name, collapse: false, heatLoss, form: formService.getEnergyInputForm({}) };
}

describe('EnergyInputComponent', () => {
  let component: EnergyInputComponent;
  let fixture: ComponentFixture<EnergyInputComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let energyInputServiceSpy: jasmine.SpyObj<EnergyInputService>;
  let settingsSignal: WritableSignal<Settings>;
  let lossesSignal: WritableSignal<EnergyInputItem[]>;
  let totalSignal: WritableSignal<number>;
  let warningsSignal: WritableSignal<EnergyInputWarnings>;
  let item: EnergyInputItem;

  beforeEach(async () => {
    settingsSignal = signal(MOCK_SETTINGS);
    assessmentServiceSpy = jasmine.createSpyObj('ProcessHeatingAssessmentService', [], {
      settingsSignal,
    });

    lossesSignal = signal<EnergyInputItem[]>([]);
    totalSignal = signal(0);
    warningsSignal = signal<EnergyInputWarnings>({ electricityInput: null, heatDelivered: null });

    energyInputServiceSpy = jasmine.createSpyObj(
      'EnergyInputService',
      ['initialize', 'setName', 'add', 'remove', 'toggleCollapse'],
      {
        losses: lossesSignal,
        total: totalSignal,
        warnings: warningsSignal,
      },
    );

    await TestBed.configureTestingModule({
      declarations: [EnergyInputComponent],
      imports: [SharedPipesModule],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        EnergyInputFormService,
        ConvertUnitsService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideComponent(EnergyInputComponent, {
      set: { providers: [{ provide: EnergyInputService, useValue: energyInputServiceSpy }] },
    });

    item = makeItem(TestBed.inject(EnergyInputFormService), 'loss-1', 'Loss #1');

    fixture = TestBed.createComponent(EnergyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('initializes the energy input service with the default baseline scenario', () => {
      expect(energyInputServiceSpy.initialize).toHaveBeenCalledWith('baseline');
    });

    it('initializes the energy input service with a modification scenario from the scenario input', () => {
      const modFixture = TestBed.createComponent(EnergyInputComponent);
      modFixture.componentRef.setInput('scenario', 'mod-1');
      modFixture.detectChanges();

      expect(energyInputServiceSpy.initialize).toHaveBeenCalledWith('mod-1');
    });
  });

  describe('resultsUnit', () => {
    it('computes kW when energyResultUnit is kWh', () => {
      settingsSignal.set({ ...MOCK_SETTINGS, energyResultUnit: 'kWh' });
      expect(component.resultsUnit).toBe('kW');
    });

    it('computes <unit>/hr for other energy result units', () => {
      settingsSignal.set({ ...MOCK_SETTINGS, energyResultUnit: 'Btu' });
      expect(component.resultsUnit).toBe('Btu/hr');
    });
  });

  describe('user-triggered actions', () => {
    it('calls add on the service when a loss is added', () => {
      fixture.nativeElement.querySelector('.btn-primary').click();
      expect(energyInputServiceSpy.add).toHaveBeenCalled();
    });

    it('hides the add button once an entry exists, since results read only the first entry', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.btn-primary')).toBeNull();
    });

    it('shows the add button again after the entry is removed', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();
      lossesSignal.set([]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.btn-primary')).not.toBeNull();
    });

    it('calls remove with the item id when a loss is removed', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.text-danger').click();
      expect(energyInputServiceSpy.remove).toHaveBeenCalledWith(item.id);
    });

    it('calls toggleCollapse with the item id', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.card-header .btn-link').click();
      expect(energyInputServiceSpy.toggleCollapse).toHaveBeenCalledWith(item.id);
    });

    it('calls setName with the item id and given name on name change', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('.card-header input[type="text"]');
      nameInput.value = 'New Name';
      nameInput.dispatchEvent(new Event('input'));

      expect(energyInputServiceSpy.setName).toHaveBeenCalledWith(item.id, 'New Name');
    });
  });

  describe('template rendering', () => {
    it('shows the empty-data message when there are no losses', () => {
      expect(fixture.nativeElement.querySelector('.no-data')).not.toBeNull();
    });

    it('hides the empty-data message and shows a card when a loss exists', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
      expect(fixture.nativeElement.querySelector('.card')).not.toBeNull();
    });

    it('shows the sub-form and hides the results summary when the item is expanded', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-energy-input-form')).not.toBeNull();
    });

    it('hides the sub-form when the item is collapsed', () => {
      lossesSignal.set([{ ...item, collapse: true }]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-energy-input-form')).toBeNull();
    });

    it('shows the heat loss value when set', () => {
      lossesSignal.set([{ ...item, heatLoss: 123.456 }]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.loss-results').textContent).toContain('123.456');
    });

    it('shows a placeholder when heat loss is not yet calculated', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.loss-results').textContent).toContain('——');
    });

    it('shows no warnings by default', () => {
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows the electricity input warning from the service', () => {
      warningsSignal.set({ electricityInput: 'Check Electricity Input value.', heatDelivered: null });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-warning').textContent).toContain('Check Electricity Input value.');
    });

    it('shows the heat delivered warning from the service', () => {
      warningsSignal.set({ electricityInput: null, heatDelivered: 'Too much heat delivered.' });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.alert-warning').textContent).toContain('Too much heat delivered.');
    });

    it('hides the total when there are no losses', () => {
      expect(fixture.nativeElement.querySelector('.loss-total')).toBeNull();
    });

    it('shows the total from the service when losses exist', () => {
      lossesSignal.set([item]);
      totalSignal.set(456);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.loss-total').textContent).toContain('456');
    });
  });
});
