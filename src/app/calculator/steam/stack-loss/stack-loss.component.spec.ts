import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { StackLossComponent } from './stack-loss.component';
import { StackLossService } from './stack-loss.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ProcessHeatingApiService } from '../../../tools-suite-api/process-heating-api.service';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../settings/settings.service';

const MOCK_SETTINGS = { ...SteamImperialDefaults, unitsOfMeasure: 'Imperial' } as Settings;

describe('StackLossComponent', () => {
  let component: StackLossComponent;
  let fixture: ComponentFixture<StackLossComponent>;
  let stackLossService: StackLossService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(StackLossComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  function fillVolumeForm(): void {
    const example = stackLossService.getExampleData(MOCK_SETTINGS);
    component.stackLossForm = stackLossService.initByVolumeFormFromLoss(example);
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, SharedPipesModule],
      declarations: [StackLossComponent],
      providers: [
        StackLossService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: ProcessHeatingApiService, useValue: {} },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    stackLossService = TestBed.inject(StackLossService);
    spyOn(stackLossService, 'flueGasByVolume').and.returnValue({ availableHeat: 0.8 } as any);
    spyOn(stackLossService, 'flueGasByMass').and.returnValue(0.75);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-stack-loss');
    });

    it('builds a by-volume form when there is no saved fuel type', () => {
      spyOn(stackLossService, 'initFormVolume').and.callThrough();
      createComponent();
      expect(component.method).toBe(1);
      expect(stackLossService.initFormVolume).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(component.stackLossForm.controls.CH4).toBeDefined();
    });

    it('builds the form from saved by-volume input', () => {
      stackLossService.stackLossInput = stackLossService.getExampleData(MOCK_SETTINGS);
      spyOn(stackLossService, 'initByVolumeFormFromLoss').and.callThrough();
      createComponent();
      expect(stackLossService.initByVolumeFormFromLoss).toHaveBeenCalledWith(stackLossService.stackLossInput);
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    });

    it('uses the global default panel tab when set', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('observe modalOpen', () => {
    it('tracks the modal open state', () => {
      createComponent();
      stackLossService.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });

    it('stops tracking after destroy', () => {
      createComponent();
      fixture.destroy();
      stackLossService.modalOpen.next(true);
      expect(component.isModalOpen).toBeFalse();
    });
  });

  describe('changeFuelType', () => {
    beforeEach(() => createComponent());

    it('builds a mass form for solid/liquid fuel', () => {
      component.method = 0;
      component.changeFuelType();
      expect(component.stackLossForm.controls.carbon).toBeDefined();
    });

    it('builds a volume form for gas fuel', () => {
      component.method = 0;
      component.changeFuelType();
      component.method = 1;
      component.changeFuelType();
      expect(component.stackLossForm.controls.CH4).toBeDefined();
    });
  });

  describe('calculation', () => {
    beforeEach(() => createComponent());

    it('calculates by volume for a valid form', () => {
      fillVolumeForm();
      component.calculate(component.stackLossForm);
      expect(stackLossService.flueGasByVolume).toHaveBeenCalledWith(component.flueGasByVolume, MOCK_SETTINGS);
      expect(component.boilerEfficiency).toBeCloseTo(80, 5);
      expect(component.stackLossPercent).toBeCloseTo(20, 5);
      expect(stackLossService.stackLossInput.flueGasType).toBe(1);
    });

    it('zeroes the results for an invalid form', () => {
      component.calculate(component.stackLossForm);
      expect(stackLossService.flueGasByVolume).not.toHaveBeenCalled();
      expect(component.boilerEfficiency).toBe(0);
      expect(component.stackLossPercent).toBe(0);
    });

    it('calculates by mass for a valid solid/liquid form', () => {
      component.method = 0;
      component.stackLossForm = stackLossService.initFormMass(MOCK_SETTINGS);
      component.stackLossForm.patchValue({
        flueGasTemperature: 300, excessAirPercentage: 10, o2InFlueGas: 2, combustionAirTemperature: 60,
        ashDischargeTemperature: 100, unburnedCarbonInAsh: 1, carbon: 70, hydrogen: 5, sulphur: 1,
        inertAsh: 10, o2: 7, moisture: 5, nitrogen: 2
      });
      component.calculate(component.stackLossForm);
      expect(stackLossService.flueGasByMass).toHaveBeenCalledWith(component.flueGasByMass, MOCK_SETTINGS);
      expect(stackLossService.stackLossInput.flueGasType).toBe(0);
      expect(component.boilerEfficiency).toBeCloseTo(75, 5);
      expect(component.stackLossPercent).toBeCloseTo(25, 5);
    });

    it('zeroes the results for an invalid solid/liquid form', () => {
      component.method = 0;
      component.stackLossForm = stackLossService.initFormMass(MOCK_SETTINGS);
      component.calculate(component.stackLossForm);
      expect(stackLossService.flueGasByMass).not.toHaveBeenCalled();
      expect(component.boilerEfficiency).toBe(0);
    });

    it('emits the efficiency when in a modal', () => {
      const emitted = [];
      component.emitEfficiency.subscribe(value => emitted.push(value));
      component.inModal = true;
      fillVolumeForm();
      component.calculate(component.stackLossForm);
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBeCloseTo(80, 5);
    });

    it('does not emit the efficiency outside a modal', () => {
      const emitted = [];
      component.emitEfficiency.subscribe(value => emitted.push(value));
      fillVolumeForm();
      component.calculate(component.stackLossForm);
      expect(emitted.length).toBe(0);
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('resets the saved input and form', () => {
      stackLossService.stackLossInput = stackLossService.getExampleData(MOCK_SETTINGS);
      component.btnResetData();
      expect(stackLossService.stackLossInput.flueGasType).toBe(1);
      expect(component.stackLossForm.controls.flueGasTemperature.value).toBe('');
    });

    it('generates the example and calculates', () => {
      component.btnGenerateData();
      expect(stackLossService.flueGasByVolume).toHaveBeenCalled();
      expect(component.boilerEfficiency).toBeCloseTo(80, 5);
    });

    it('sets the selected tab, field and small screen tab', () => {
      component.setTab('help');
      component.changeField('gasTypeId');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('gasTypeId');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    it('shows the stack loss form when a form exists', () => {
      createComponent();
      expect(query('app-stack-loss-form')).not.toBeNull();
    });

    it('hides the stack loss form when there is no form', () => {
      createComponent();
      component.stackLossForm = undefined;
      fixture.detectChanges();
      expect(query('app-stack-loss-form')).toBeNull();
    });

    it('shows the reset and example buttons outside a modal', () => {
      createComponent();
      expect(query('.btn-group')).not.toBeNull();
    });

    it('hides the reset and example buttons in a modal', () => {
      createComponent({ settings: MOCK_SETTINGS, inModal: true });
      expect(query('.btn-group')).toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-percent-graph')).not.toBeNull();
      expect(query('app-stack-loss-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-stack-loss-help')).not.toBeNull();
      expect(query('app-percent-graph')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-stack-loss-help')).toBeNull();
      expect(query('app-percent-graph')).toBeNull();
    });
  });
});
