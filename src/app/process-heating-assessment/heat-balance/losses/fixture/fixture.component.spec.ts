import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FixtureComponent } from './fixture.component';
import { FixtureItem, FixtureService } from './fixture.service';
import { FixtureFormService } from './fixture-form.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;

function makeItem(formService: FixtureFormService, id: string, name: string, heatLoss: number | null = null): FixtureItem {
  return { id, name, collapse: false, heatLoss, form: formService.getFixtureForm({}) };
}

describe('FixtureComponent', () => {
  let component: FixtureComponent;
  let fixture: ComponentFixture<FixtureComponent>;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let fixtureServiceSpy: jasmine.SpyObj<FixtureService>;
  let settingsSignal: WritableSignal<Settings>;
  let lossesSignal: WritableSignal<FixtureItem[]>;
  let totalSignal: WritableSignal<number>;
  let item: FixtureItem;

  beforeEach(async () => {
    settingsSignal = signal(MOCK_SETTINGS);
    assessmentServiceSpy = jasmine.createSpyObj('ProcessHeatingAssessmentService', [], {
      settingsSignal,
    });

    lossesSignal = signal<FixtureItem[]>([]);
    totalSignal = signal(0);

    fixtureServiceSpy = jasmine.createSpyObj(
      'FixtureService',
      ['initialize', 'setName', 'add', 'remove', 'toggleCollapse'],
      {
        losses: lossesSignal,
        total: totalSignal,
      },
    );

    await TestBed.configureTestingModule({
      declarations: [FixtureComponent],
      imports: [SharedPipesModule],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        FixtureFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideComponent(FixtureComponent, {
      set: { providers: [{ provide: FixtureService, useValue: fixtureServiceSpy }] },
    });

    item = makeItem(TestBed.inject(FixtureFormService), 'loss-1', 'Loss #1');

    fixture = TestBed.createComponent(FixtureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('initializes the fixture service with the default baseline scenario', () => {
      expect(fixtureServiceSpy.initialize).toHaveBeenCalledWith('baseline');
    });

    it('initializes the fixture service with a modification scenario from the scenario input', () => {
      const modFixture = TestBed.createComponent(FixtureComponent);
      modFixture.componentRef.setInput('scenario', 'mod-1');
      modFixture.detectChanges();

      expect(fixtureServiceSpy.initialize).toHaveBeenCalledWith('mod-1');
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
      expect(fixtureServiceSpy.add).toHaveBeenCalled();
    });

    it('calls remove with the item id when a loss is removed', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.text-danger').click();
      expect(fixtureServiceSpy.remove).toHaveBeenCalledWith(item.id);
    });

    it('calls toggleCollapse with the item id', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.card-header .btn-link').click();
      expect(fixtureServiceSpy.toggleCollapse).toHaveBeenCalledWith(item.id);
    });

    it('calls setName with the item id and given name on name change', () => {
      lossesSignal.set([item]);
      fixture.detectChanges();

      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('.card-header input[type="text"]');
      nameInput.value = 'New Name';
      nameInput.dispatchEvent(new Event('input'));

      expect(fixtureServiceSpy.setName).toHaveBeenCalledWith(item.id, 'New Name');
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

      expect(fixture.nativeElement.querySelector('app-fixture-form')).not.toBeNull();
    });

    it('hides the sub-form when the item is collapsed', () => {
      lossesSignal.set([{ ...item, collapse: true }]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-fixture-form')).toBeNull();
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
});
