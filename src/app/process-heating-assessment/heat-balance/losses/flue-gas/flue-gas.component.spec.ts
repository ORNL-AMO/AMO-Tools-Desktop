import { Component, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { FlueGasAvailableHeatResult } from './flue-gas-calculation.service';
import { FlueGasComponent } from './flue-gas.component';
import { FlueGasForm, FlueGasType } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';
import { ProcessHeatingUiService } from '../../../services/process-heating-ui.service';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'Btu' } as Settings;
@Component({ selector: 'app-flue-gas-volume-form', template: '<ng-content></ng-content>', standalone: false })
class FlueGasVolumeFormStubComponent {}

@Component({ selector: 'app-flue-gas-mass-form', template: '<ng-content></ng-content>', standalone: false })
class FlueGasMassFormStubComponent {}

const RESULT: FlueGasAvailableHeatResult = { calculatedFlueGasO2: 2, calculatedExcessAir: 10, availableHeat: 75 };

describe('FlueGasComponent', () => {
  let component: FlueGasComponent;
  let fixture: ComponentFixture<FlueGasComponent>;
  let serviceSpy: jasmine.SpyObj<FlueGasService>;
  let formList: WritableSignal<FlueGasForm[]>;
  let flueGasType: WritableSignal<FlueGasType>;
  let result: WritableSignal<FlueGasAvailableHeatResult | null>;
  let warnings: WritableSignal<FlueGasWarnings | null>;
  let resultsServiceSpy: jasmine.SpyObj<ProcessHeatingResultsService>;
  let phast: WritableSignal<object | undefined>;

  beforeEach(async () => {
    formList = signal<FlueGasForm[]>([]);
    flueGasType = signal<FlueGasType>(FlueGasType.ByVolume);
    result = signal<FlueGasAvailableHeatResult | null>(null);
    warnings = signal<FlueGasWarnings | null>(null);
    phast = signal<object | undefined>(undefined);
    resultsServiceSpy = jasmine.createSpyObj('ProcessHeatingResultsService', ['getResults']);
    serviceSpy = jasmine.createSpyObj('FlueGasService', ['initialize', 'switchType', 'differingFields'], { formList, flueGasType, result, warnings });

    await TestBed.configureTestingModule({
      imports: [FormsModule, SharedPipesModule],
      declarations: [FlueGasComponent, FlueGasVolumeFormStubComponent, FlueGasMassFormStubComponent],
      providers: [
        { provide: ProcessHeatingUiService, useValue: { focusedFieldSignal: signal('default') } },
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: signal(MOCK_SETTINGS), scenarioPhastSignal: () => phast() } },
        { provide: ProcessHeatingResultsService, useValue: resultsServiceSpy },
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
      formList.set([{} as FlueGasForm]);
      fixture.detectChanges();
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

    it('shows gross heat and flue gas losses from the total heat input and available heat', () => {
      formList.set([{} as FlueGasForm]);
      phast.set({});
      resultsServiceSpy.getResults.and.returnValue({ totalInput: 75, exothermicHeat: 0 } as never);
      result.set(RESULT);
      fixture.detectChanges();

      const text = fixture.nativeElement.querySelector('.loss-results').textContent;
      expect(text).toContain('Gross Heat 100.000 Btu/hr');
      expect(text).toContain('Flue Gas Losses 25.0000 Btu/hr');
    });
  });

  describe('compare indicators', () => {
    const select = (): HTMLElement => fixture.nativeElement.querySelector('select');

    it('highlights the fuel type select when it differs from baseline', () => {
      formList.set([{} as FlueGasForm]);
      serviceSpy.differingFields.and.returnValue(new Set(['flueGasType']) as never);
      fixture.detectChanges();

      expect(select().classList).toContain('indicate-different');
    });

    it('leaves the fuel type select unhighlighted when it matches baseline', () => {
      formList.set([{} as FlueGasForm]);
      serviceSpy.differingFields.and.returnValue(new Set(['flueGasByVolume.CH4']) as never);
      fixture.detectChanges();

      expect(select().classList).not.toContain('indicate-different');
    });
  });
});
