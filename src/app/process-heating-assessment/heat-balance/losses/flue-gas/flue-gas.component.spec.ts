import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { FlueGasAvailableHeatResult } from './flue-gas-calculation.service';
import { FlueGasComponent } from './flue-gas.component';
import { FlueGasForm, FlueGasType } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
const RESULT: FlueGasAvailableHeatResult = { calculatedFlueGasO2: 2, calculatedExcessAir: 10, availableHeat: 75 };

describe('FlueGasComponent', () => {
  let component: FlueGasComponent;
  let fixture: ComponentFixture<FlueGasComponent>;
  let serviceSpy: jasmine.SpyObj<FlueGasService>;
  let formList: WritableSignal<FlueGasForm[]>;
  let flueGasType: WritableSignal<FlueGasType>;
  let result: WritableSignal<FlueGasAvailableHeatResult | null>;

  beforeEach(async () => {
    formList = signal<FlueGasForm[]>([]);
    flueGasType = signal<FlueGasType>(FlueGasType.ByVolume);
    result = signal<FlueGasAvailableHeatResult | null>(null);
    serviceSpy = jasmine.createSpyObj('FlueGasService', ['initialize', 'switchType'], { formList, flueGasType, result });

    await TestBed.configureTestingModule({
      imports: [FormsModule, SharedPipesModule],
      declarations: [FlueGasComponent],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: signal(MOCK_SETTINGS) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    TestBed.overrideComponent(FlueGasComponent, {
      set: { providers: [{ provide: FlueGasService, useValue: serviceSpy }] },
    });

    fixture = TestBed.createComponent(FlueGasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('initializes the service with the default baseline scenario', () => {
      expect(serviceSpy.initialize).toHaveBeenCalledWith('baseline');
    });

    it('initializes the service with a modification scenario from the scenario input', () => {
      const modFixture = TestBed.createComponent(FlueGasComponent);
      modFixture.componentRef.setInput('scenario', 'mod-1');
      modFixture.detectChanges();

      expect(serviceSpy.initialize).toHaveBeenCalledWith('mod-1');
    });
  });

  describe('available heat warning', () => {
    it('is empty while no result exists', () => {
      expect(component.availableHeatWarning()).toBeNull();
    });

    it('is empty for an available heat inside 0 to 100 percent', () => {
      result.set(RESULT);

      expect(component.availableHeatWarning()).toBeNull();
    });

    it('warns when available heat is above 100 percent', () => {
      result.set({ ...RESULT, availableHeat: 120 });

      expect(component.availableHeatWarning()).toContain('Available heat is 120.00%');
    });
  });

  describe('fuel type switch', () => {
    it('asks the service to switch type when the selection changes', () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.value = select.options[1].value;
      select.dispatchEvent(new Event('change'));

      expect(serviceSpy.switchType).toHaveBeenCalledWith(FlueGasType.ByMass);
    });
  });

  describe('template visibility', () => {
    it('renders no sub-form before the service has built one', () => {
      expect(fixture.nativeElement.querySelector('app-flue-gas-volume-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-flue-gas-mass-form')).toBeNull();
    });

    it('renders the By Volume form for the By Volume type', () => {
      formList.set([{} as FlueGasForm]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-flue-gas-volume-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-flue-gas-mass-form')).toBeNull();
    });

    it('renders the By Mass form for the By Mass type', () => {
      flueGasType.set(FlueGasType.ByMass);
      formList.set([{} as FlueGasForm]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-flue-gas-mass-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-flue-gas-volume-form')).toBeNull();
    });

    it('shows placeholders when there is no result', () => {
      formList.set([{} as FlueGasForm]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.loss-results').textContent).toContain('——');
    });

    it('shows the calculated values from the service result', () => {
      formList.set([{} as FlueGasForm]);
      result.set(RESULT);
      fixture.detectChanges();

      const text = fixture.nativeElement.querySelector('.loss-results').textContent;
      expect(text).toContain('75');
      expect(text).toContain('10');
    });

    it('shows the available heat warning only when it applies', () => {
      formList.set([{} as FlueGasForm]);
      result.set(RESULT);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();

      result.set({ ...RESULT, availableHeat: 120 });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });
  });
});
