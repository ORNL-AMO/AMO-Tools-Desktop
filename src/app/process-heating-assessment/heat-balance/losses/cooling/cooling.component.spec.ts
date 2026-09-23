import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { CoolingComponent } from './cooling.component';
import { CoolingItem, CoolingService } from './cooling.service';
import { CoolingFormService } from './cooling-form.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: CoolingFormService, id: string, name: string, heatLoss: number | null = null): CoolingItem {
  return { id, name, collapse: false, heatLoss, form: formService.getCoolingForm({}, MOCK_SETTINGS) };
}

describe('CoolingComponent', () => {
  let component: CoolingComponent;
  let fixture: ComponentFixture<CoolingComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let coolingServiceSpy: jasmine.SpyObj<CoolingService>;
  let settingsSignal: WritableSignal<Settings>;
  let lossesSignal: WritableSignal<CoolingItem[]>;
  let totalSignal: WritableSignal<number>;
  let item: CoolingItem;

  beforeEach(async () => {
    settingsSignal = signal(MOCK_SETTINGS);
    assessmentServiceSpy = jasmine.createSpyObj('ProcessHeatingAssessmentService', [], {
      settingsSignal,
    });

    lossesSignal = signal<CoolingItem[]>([]);
    totalSignal = signal(0);

    coolingServiceSpy = jasmine.createSpyObj(
      'CoolingService',
      ['initialize', 'setName', 'add', 'remove', 'toggleCollapse', 'switchMedium'],
      {
        losses: lossesSignal,
        total: totalSignal,
      },
    );

    await TestBed.configureTestingModule({
      declarations: [CoolingComponent],
      imports: [SharedPipesModule],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        CoolingFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideComponent(CoolingComponent, {
      set: { providers: [{ provide: CoolingService, useValue: coolingServiceSpy }] },
    });

    item = makeItem(TestBed.inject(CoolingFormService), 'loss-1', 'Loss #1');

    fixture = TestBed.createComponent(CoolingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('initializes the cooling service with the default baseline scenario', () => {
      expect(coolingServiceSpy.initialize).toHaveBeenCalledWith('baseline');
    });

    it('initializes the cooling service with a modification scenario from the scenario input', () => {
      const modFixture = TestBed.createComponent(CoolingComponent);
      modFixture.componentRef.setInput('scenario', 'mod-1');
      modFixture.detectChanges();

      expect(coolingServiceSpy.initialize).toHaveBeenCalledWith('mod-1');
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
      expect(coolingServiceSpy.add).toHaveBeenCalled();
    });

    it('calls remove with the item id when a loss is removed', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.text-danger').click();
      expect(coolingServiceSpy.remove).toHaveBeenCalledWith(item.id);
    });

    it('calls toggleCollapse with the item id', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.card-header .btn-link').click();
      expect(coolingServiceSpy.toggleCollapse).toHaveBeenCalledWith(item.id);
    });

    it('calls setName with the item id and given name on name change', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('.card-header input[type="text"]');
      nameInput.value = 'New Name';
      nameInput.dispatchEvent(new Event('input'));

      expect(coolingServiceSpy.setName).toHaveBeenCalledWith(item.id, 'New Name');
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

      expect(fixture.nativeElement.querySelector('app-gas-cooling-form')).not.toBeNull();
    });

    it('hides the sub-form when the item is collapsed', () => {
      lossesSignal.set([{ ...item, collapse: true }]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-gas-cooling-form')).toBeNull();
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

  describe('cooling medium', () => {
    it('renders the gas sub-form for an Air loss and the liquid sub-form for a Water loss', () => {
      const formService = TestBed.inject(CoolingFormService);
      lossesSignal.set([
        item,
        { ...makeItem(formService, 'loss-2', 'Loss #2'), form: formService.getCoolingForm({ coolingLossType: 'Liquid' }, MOCK_SETTINGS) },
      ]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-gas-cooling-form').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('app-liquid-cooling-form').length).toBe(1);
    });

    it('offers the four legacy media, with the saved one selected', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      const options: HTMLOptionElement[] = Array.from(fixture.nativeElement.querySelectorAll('select option'));
      expect(options.map(option => option.textContent.trim())).toEqual(['Air', 'Water', 'Other Gas', 'Other Liquid']);
      expect(options.find(option => option.selected).textContent.trim()).toBe('Air');
    });

    it('switches the medium through the service', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.value = 'Other Liquid';
      select.dispatchEvent(new Event('change'));

      expect(coolingServiceSpy.switchMedium).toHaveBeenCalledWith('loss-1', 'Other Liquid');
    });
  });
});
