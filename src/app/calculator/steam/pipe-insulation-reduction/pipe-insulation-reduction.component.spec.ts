import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { PipeInsulationReductionComponent } from './pipe-insulation-reduction.component';
import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { PipeInsulationReductionResults } from '../../../shared/models/standalone';
import { Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', fuelCost: 3.99, otherFuelCost: 5, electricityCost: 0.066 } as Settings;

function makeResults(): PipeInsulationReductionResults {
  return {
    baselineResults: { heatLength: 0, annualHeatLoss: 10, energyCost: 20, energySourceType: 0, heatedOrChilled: 0 },
    modificationResults: undefined,
    annualHeatSavings: 0,
    annualCostSavings: 0,
    energyUnit: 'MMBtu'
  };
}

describe('PipeInsulationReductionComponent', () => {
  let component: PipeInsulationReductionComponent;
  let fixture: ComponentFixture<PipeInsulationReductionComponent>;
  let service: PipeInsulationReductionService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(PipeInsulationReductionComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PipeInsulationReductionComponent],
      providers: [
        PipeInsulationReductionService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['pipeInsulationReduction']) },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(PipeInsulationReductionService);
    spyOn(service, 'getResults').and.returnValue(makeResults());
  });

  describe('initialization', () => {
    it('sends the analytics event, builds the baseline and gets results', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-pipe-insulation-reduction');
      expect(service.baselineData).toBeDefined();
      expect(component.baselineForm).toBeDefined();
      expect(component.modificationExists).toBe(false);
      expect(service.getResults).toHaveBeenCalledWith(MOCK_SETTINGS, service.baselineData, undefined);
      expect(component.pipeInsulationReductionResults).toEqual(makeResults());
    });

    it('uses the operating hours input for a new baseline', () => {
      createComponent({ settings: MOCK_SETTINGS, operatingHours: { hoursPerYear: 5000 } });
      expect(service.baselineData.operatingHours).toBe(5000);
    });

    it('builds a disabled modification form when modification data exists', () => {
      service.baselineData = service.initObject(MOCK_SETTINGS, undefined);
      service.modificationData = service.initObject(MOCK_SETTINGS, undefined);
      createComponent();
      expect(component.modificationExists).toBe(true);
      expect(component.modificationForm.disabled).toBe(true);
    });

    it('falls back to global settings and default panel tab', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('template visibility', () => {
    it('shows the add-modification prompt and no modification form when no modification exists', () => {
      createComponent();
      expect(queryAll('app-pipe-insulation-reduction-form').length).toBe(1);
      expect(query('.no-data')).not.toBeNull();
    });

    it('shows the modification form and hides the prompt when a modification exists', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      expect(queryAll('app-pipe-insulation-reduction-form').length).toBe(2);
      expect(query('.no-data')).toBeNull();
    });

    it('hides treasure hunt actions when not in treasure hunt', () => {
      createComponent();
      expect(query('.fa-save')).toBeNull();
      expect(query('.treasure-hunt-help')).toBeNull();
    });

    it('shows treasure hunt actions when in treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-pipe-insulation-reduction-results')).not.toBeNull();
      expect(query('app-pipe-insulation-reduction-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-pipe-insulation-reduction-help')).not.toBeNull();
      expect(query('app-pipe-insulation-reduction-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-pipe-insulation-reduction-help')).toBeNull();
      expect(query('app-pipe-insulation-reduction-results')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('creates a modification copied from the baseline and selects it', () => {
      service.baselineData.pipeLength = 77;
      component.createModification();
      expect(service.modificationData.pipeLength).toBe(77);
      expect(component.modificationExists).toBe(true);
      expect(component.baselineSelected).toBe(false);
      expect(component.baselineForm.disabled).toBe(true);
      expect(component.modificationForm.controls.utilityType.disabled).toBe(true);
      expect(component.modificationForm.controls.heatedOrChilled.disabled).toBe(true);
      expect(component.modificationForm.controls.pipeJacketMaterialSelection.disabled).toBe(true);
    });

    it('selects the baseline and disables the modification form', () => {
      component.createModification();
      component.setBaselineSelected();
      expect(component.baselineSelected).toBe(true);
      expect(component.baselineForm.controls.pipeLength.enabled).toBe(true);
      expect(component.baselineForm.controls.pipeJacketMaterialSelection.disabled).toBe(true);
      expect(component.modificationForm.disabled).toBe(true);
    });

    it('resets data and removes the modification', () => {
      component.createModification();
      component.btnResetData();
      fixture.detectChanges();
      expect(service.modificationData).toBeNull();
      expect(component.modificationExists).toBe(false);
      expect(component.modificationForm).toBeUndefined();
      expect(query('.no-data')).not.toBeNull();
    });

    it('generates an example with a modification and selects the baseline', () => {
      spyOn(service, 'generateExample').and.callFake((settings, isBaseline) => {
        return { ...service.initObject(settings, undefined), pipeLength: isBaseline ? 1 : 2 };
      });
      component.btnGenerateExample();
      fixture.detectChanges();
      expect(service.baselineData.pipeLength).toBe(1);
      expect(service.modificationData.pipeLength).toBe(2);
      expect(component.modificationExists).toBe(true);
      expect(component.baselineSelected).toBe(true);
      expect(queryAll('app-pipe-insulation-reduction-form').length).toBe(2);
    });

    it('emits the save payload', () => {
      const emitted = [];
      component.emitSave.subscribe(v => emitted.push(v));
      component.save();
      expect(emitted).toEqual([{ baseline: service.baselineData, modification: service.modificationData, opportunityType: Treasure.pipeInsulation }]);
    });

    it('emits cancel', () => {
      const emitted = [];
      component.emitCancel.subscribe(v => emitted.push(v));
      component.cancel();
      expect(emitted).toEqual([true]);
    });

    it('sets the current field and small screen tab', () => {
      component.changeField('pipeLength');
      component.setSmallScreenTab('details');
      expect(component.currentField).toBe('pipeLength');
      expect(component.smallScreenTab).toBe('details');
    });

    it('selects modification from the small screen tab', () => {
      component.createModification();
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBe(true);
      component.setSmallScreenTab('modification');
      expect(component.baselineSelected).toBe(false);
    });
  });

  describe('destroy', () => {
    it('clears service data when in treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      fixture.destroy();
      expect(service.baselineData).toBeUndefined();
      expect(service.modificationData).toBeUndefined();
    });

    it('keeps service data when standalone', () => {
      createComponent();
      fixture.destroy();
      expect(service.baselineData).toBeDefined();
    });
  });
});
