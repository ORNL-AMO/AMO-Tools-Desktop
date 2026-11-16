import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { HeadToolComponent, HeadToolResults } from './head-tool.component';
import { HeadToolService } from './head-tool.service';
import { PsatService } from '../../../psat/psat.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PSAT } from '../../../shared/models/psat';
import { Calculator, HeadTool, HeadToolSuction } from '../../../shared/models/calculators';

const MOCK_SETTINGS = {
  distanceMeasurement: 'ft',
  flowMeasurement: 'gpm',
  pressureMeasurement: 'psi',
} as Settings;

function makeHeadTool(overrides: Partial<HeadTool> = {}): HeadTool {
  return {
    specificGravity: 1,
    flowRate: 2000,
    suctionPipeDiameter: 12,
    suctionGaugePressure: 5,
    suctionGaugeElevation: 10,
    suctionLineLossCoefficients: 0.5,
    dischargePipeDiameter: 12,
    dischargeGaugePressure: 124,
    dischargeGaugeElevation: 10,
    dischargeLineLossCoefficients: 1,
    ...overrides,
  };
}

function makeHeadToolSuction(overrides: Partial<HeadToolSuction> = {}): HeadToolSuction {
  return {
    specificGravity: 1,
    flowRate: 2000,
    suctionPipeDiameter: 12,
    suctionTankGasOverPressure: 0,
    suctionTankFluidSurfaceElevation: 10,
    suctionLineLossCoefficients: 0.5,
    dischargePipeDiameter: 12,
    dischargeGaugePressure: 124,
    dischargeGaugeElevation: 10,
    dischargeLineLossCoefficients: 1,
    ...overrides,
  };
}

function makeResults(pumpHead: number): HeadToolResults {
  return {
    differentialElevationHead: 1,
    differentialPressureHead: 2,
    differentialVelocityHead: 3,
    estimatedSuctionFrictionHead: 4,
    estimatedDischargeFrictionHead: 5,
    pumpHead: pumpHead,
  };
}

function makePsat(flowRate: number): PSAT {
  return { inputs: { flow_rate: flowRate, head: 0 } } as PSAT;
}

describe('HeadToolComponent', () => {
  let component: HeadToolComponent;
  let fixture: ComponentFixture<HeadToolComponent>;
  let headToolService: HeadToolService;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let globalSettings: Settings;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function findButton(text: string): HTMLButtonElement | undefined {
    return Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: HTMLButtonElement) => button.textContent.trim() === text) as HTMLButtonElement;
  }

  function createComponent(inputs: { settings?: Settings, psat?: PSAT, inAssessment?: boolean, assessmentId?: number } = {}): void {
    fixture = TestBed.createComponent(HeadToolComponent);
    component = fixture.componentInstance;
    // resizeTabs measures real DOM heights after a timeout; not relevant to these tests
    spyOn(component, 'resizeTabs');
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    globalSettings = { ...MOCK_SETTINGS };
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['headTool', 'headToolSuctionTank']);
    psatServiceSpy.headTool.and.returnValue(makeResults(10));
    psatServiceSpy.headToolSuctionTank.and.returnValue(makeResults(20));
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'updateWithObservable', 'addWithObservable', 'getAllCalculators', 'setAll']);
    calculatorDbServiceSpy.getByAssessmentId.and.returnValue(undefined);
    calculatorDbServiceSpy.updateWithObservable.and.returnValue(of(undefined));
    calculatorDbServiceSpy.addWithObservable.and.returnValue(of(undefined));
    calculatorDbServiceSpy.getAllCalculators.and.returnValue(of([]));
    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: undefined });
    (Object.getOwnPropertyDescriptor(settingsDbServiceSpy, 'globalSettings').get as jasmine.Spy).and.callFake(() => globalSettings);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HeadToolComponent],
      providers: [
        HeadToolService,
        ConvertUnitsService,
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    headToolService = TestBed.inject(HeadToolService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PUMP-head-tool');
    });

    it('falls back to the global settings when no settings input is given', () => {
      createComponent();
      expect(component.settings).toBe(globalSettings);
    });

    it('keeps the settings input when one is given', () => {
      const settings = { ...MOCK_SETTINGS, flowMeasurement: 'm3/h' } as Settings;
      createComponent({ settings });
      expect(component.settings).toBe(settings);
    });

    it('builds empty forms when standalone with no stored inputs', () => {
      createComponent();
      expect(component.headToolForm.controls.suctionPipeDiameter.value).toBe(0);
      expect(component.headToolSuctionForm.controls.suctionTankGasOverPressure.value).toBe(0);
      expect(component.headToolType).toBe('Suction tank elevation');
    });

    it('restores stored standalone inputs and head tool type from the service', () => {
      headToolService.headToolInputs = makeHeadTool({ suctionPipeDiameter: 7 });
      headToolService.headToolSuctionInputs = makeHeadToolSuction({ suctionTankGasOverPressure: 3 });
      headToolService.headToolType = 'Suction gauge elevation';
      createComponent();
      expect(component.headToolForm.controls.suctionPipeDiameter.value).toBe(7);
      expect(component.headToolSuctionForm.controls.suctionTankGasOverPressure.value).toBe(3);
      expect(component.headToolType).toBe('Suction gauge elevation');
    });

    it('patches the psat flow rate into both forms when a psat is given', () => {
      createComponent({ psat: makePsat(555) });
      expect(component.headToolForm.controls.flowRate.value).toBe(555);
      expect(component.headToolSuctionForm.controls.flowRate.value).toBe(555);
    });

    it('loads a saved assessment calculator into the forms', () => {
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue({
        assessmentId: 4,
        headTool: makeHeadTool({ flowRate: 111 }),
        headToolSuction: makeHeadToolSuction({ flowRate: 222 }),
        headToolType: 'Suction gauge elevation',
      });
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(1) });
      expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(4);
      expect(component.isSavedCalc).toBeTrue();
      expect(component.headToolForm.controls.flowRate.value).toBe(111);
      expect(component.headToolSuctionForm.controls.flowRate.value).toBe(222);
      expect(component.headToolType).toBe('Suction gauge elevation');
    });

    it('builds new forms when the saved assessment calculator has no head tool', () => {
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue({ assessmentId: 4 });
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(42) });
      expect(component.isSavedCalc).toBeTrue();
      expect(component.headToolForm.controls.flowRate.value).toBe(42);
    });

    it('builds new forms when the assessment has no saved calculator', () => {
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(42) });
      expect(component.isSavedCalc).toBeFalse();
      expect(component.headToolSuctionForm.controls.flowRate.value).toBe(42);
    });

    it('uses the global default panel tab when set', () => {
      globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('defaults to the results tab when no default panel tab is set', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('template visibility', () => {
    describe('settings', () => {
      it('renders the calculator when settings exist', () => {
        createComponent();
        expect(query('.calculator-container')).not.toBeNull();
      });

      it('hides the calculator when there are no settings', () => {
        // ngOnInit always falls back to global settings, so clear the input afterwards
        createComponent({ inAssessment: true, assessmentId: 1, psat: makePsat(1) });
        fixture.componentRef.setInput('settings', undefined);
        fixture.detectChanges();
        expect(query('.calculator-container')).toBeNull();
        expect(query('app-head-tool-suction-form')).toBeNull();
        expect(query('.save-button')).not.toBeNull();
      });
    });

    describe('head tool type forms', () => {
      it('shows only the suction tank form for "Suction tank elevation"', () => {
        createComponent();
        expect(query('app-head-tool-suction-form')).not.toBeNull();
        expect(query('app-head-tool-form')).toBeNull();
        expect(query('img[src="assets/images/img-tank-elevation-head.png"]')).not.toBeNull();
        expect(query('img[src="assets/images/img-suction-discharge-head.png"]')).toBeNull();
      });

      it('shows only the suction gauge form for "Suction gauge elevation"', () => {
        createComponent();
        component.setFormView('Suction gauge elevation');
        fixture.detectChanges();
        expect(query('app-head-tool-form')).not.toBeNull();
        expect(query('app-head-tool-suction-form')).toBeNull();
        expect(query('img[src="assets/images/img-suction-discharge-head.png"]')).not.toBeNull();
        expect(query('img[src="assets/images/img-tank-elevation-head.png"]')).toBeNull();
      });

      it('switches forms when the toggle buttons are clicked', () => {
        createComponent();
        findButton('Suction gauge elevation').click();
        fixture.detectChanges();
        expect(component.headToolType).toBe('Suction gauge elevation');
        expect(query('app-head-tool-form')).not.toBeNull();
        findButton('Suction tank elevation').click();
        fixture.detectChanges();
        expect(component.headToolType).toBe('Suction tank elevation');
        expect(query('app-head-tool-suction-form')).not.toBeNull();
        expect(query('app-head-tool-form')).toBeNull();
      });

      // ngOnDestroy reads both forms, so each test restores the form before cleanup
      it('hides the suction tank form when its type matches but the form is missing', () => {
        createComponent();
        const form = component.headToolSuctionForm;
        component.headToolSuctionForm = undefined;
        fixture.detectChanges();
        expect(query('app-head-tool-suction-form')).toBeNull();
        expect(query('img[src="assets/images/img-tank-elevation-head.png"]')).toBeNull();
        component.headToolSuctionForm = form;
      });

      it('hides the suction gauge form when its type matches but the form is missing', () => {
        createComponent();
        component.setFormView('Suction gauge elevation');
        const form = component.headToolForm;
        component.headToolForm = undefined;
        fixture.detectChanges();
        expect(query('app-head-tool-form')).toBeNull();
        expect(query('img[src="assets/images/img-suction-discharge-head.png"]')).toBeNull();
        component.headToolForm = form;
      });

      it('hides both forms for an unknown head tool type', () => {
        createComponent();
        component.setFormView('Other');
        fixture.detectChanges();
        expect(query('app-head-tool-form')).toBeNull();
        expect(query('app-head-tool-suction-form')).toBeNull();
      });
    });

    describe('help panel tabs', () => {
      it('shows results and hides help on the results tab', () => {
        createComponent();
        expect(query('app-head-tool-results')).not.toBeNull();
        expect(query('app-head-tool-help')).toBeNull();
      });

      it('shows help and hides results on the help tab', () => {
        createComponent();
        component.setTab('help');
        fixture.detectChanges();
        expect(query('app-head-tool-help')).not.toBeNull();
        expect(query('app-head-tool-results')).toBeNull();
      });

      it('hides both for an unknown tab', () => {
        createComponent();
        component.setTab('other');
        fixture.detectChanges();
        expect(query('app-head-tool-help')).toBeNull();
        expect(query('app-head-tool-results')).toBeNull();
      });
    });

    describe('save button', () => {
      it('is hidden when not in an assessment', () => {
        createComponent();
        expect(query('.save-button')).toBeNull();
      });

      it('is shown and disabled in an assessment before a positive result', () => {
        createComponent({ inAssessment: true, assessmentId: 1, psat: makePsat(1) });
        const button = query('.save-button') as HTMLButtonElement;
        expect(button).not.toBeNull();
        expect(button.disabled).toBeTrue();
      });

      it('is enabled in an assessment after a positive pump head', () => {
        createComponent({ inAssessment: true, assessmentId: 1, psat: makePsat(1) });
        component.calculateHeadTool();
        fixture.detectChanges();
        expect((query('.save-button') as HTMLButtonElement).disabled).toBeFalse();
      });
    });
  });

  describe('calculation triggers', () => {
    it('calculateHeadTool passes the gauge form values and settings and stores the results', () => {
      createComponent();
      component.headToolForm.patchValue({ specificGravity: 2, flowRate: 300, suctionPipeDiameter: 4 });
      component.calculateHeadTool();
      const args = psatServiceSpy.headTool.calls.mostRecent().args;
      expect(args[0]).toBe(2);
      expect(args[1]).toBe(300);
      expect(args[2]).toBe(4);
      expect(args[10]).toBe(component.settings);
      expect(component.results).toEqual(makeResults(10));
    });

    it('calculateHeadToolSuctionTank passes the tank form values and settings and stores the results', () => {
      createComponent();
      component.headToolSuctionForm.patchValue({ specificGravity: 3, suctionTankGasOverPressure: 6 });
      component.calculateHeadToolSuctionTank();
      const args = psatServiceSpy.headToolSuctionTank.calls.mostRecent().args;
      expect(args[0]).toBe(3);
      expect(args[3]).toBe(6);
      expect(args[10]).toBe(component.settings);
      expect(component.results).toEqual(makeResults(20));
    });

    it('updates the results when recalculated with new output', () => {
      createComponent();
      component.calculateHeadTool();
      psatServiceSpy.headTool.and.returnValue(makeResults(99));
      component.calculateHeadTool();
      expect(component.results.pumpHead).toBe(99);
    });

    it('does not enable saving outside an assessment', () => {
      createComponent();
      component.calculateHeadTool();
      expect(component.canSave).toBeFalse();
    });

    it('does not enable saving for a non-positive pump head', () => {
      psatServiceSpy.headToolSuctionTank.and.returnValue(makeResults(0));
      createComponent({ inAssessment: true, assessmentId: 1, psat: makePsat(1) });
      component.calculateHeadToolSuctionTank();
      expect(component.canSave).toBeFalse();
    });
  });

  describe('user actions', () => {
    it('setSmallScreenTab updates the small screen tab', () => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });

    it('changeField updates the current field', () => {
      createComponent();
      component.changeField('flowRate');
      expect(component.currentField).toBe('flowRate');
    });

    it('btnResetData rebuilds empty forms and recalculates both tools', () => {
      createComponent();
      component.headToolForm.patchValue({ flowRate: 500 });
      component.btnResetData();
      expect(component.headToolForm.controls.flowRate.value).toBe(0);
      expect(psatServiceSpy.headTool).toHaveBeenCalled();
      expect(psatServiceSpy.headToolSuctionTank).toHaveBeenCalled();
    });

    it('btnGenerateExample loads example forms, recalculates, and shows the suction gauge form', () => {
      createComponent();
      findButton('Generate Example').click();
      fixture.detectChanges();
      expect(component.headToolForm.controls.flowRate.value).toBe(2000);
      expect(component.headToolSuctionForm.controls.dischargeGaugePressure.value).toBe(124);
      expect(psatServiceSpy.headTool).toHaveBeenCalled();
      expect(psatServiceSpy.headToolSuctionTank).toHaveBeenCalled();
      expect(query('app-head-tool-form')).not.toBeNull();
    });

    it('closeTool emits close', () => {
      createComponent();
      const emitted: boolean[] = [];
      component.close.subscribe(value => emitted.push(value));
      component.closeTool();
      expect(emitted).toEqual([true]);
    });
  });

  describe('save', () => {
    it('outside an assessment copies the pump head to the psat and closes', async () => {
      const psat = makePsat(1);
      createComponent({ psat });
      component.calculateHeadTool();
      const closeSpy = spyOn(component.close, 'emit');
      await component.save();
      expect(psat.inputs.head).toBe(10);
      expect(calculatorDbServiceSpy.addWithObservable).not.toHaveBeenCalled();
      expect(calculatorDbServiceSpy.updateWithObservable).not.toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalledWith(true);
    });

    it('in an assessment with a saved calculator updates it', async () => {
      const saved: Calculator = { assessmentId: 4, headTool: makeHeadTool(), headToolSuction: makeHeadToolSuction(), headToolType: 'Suction tank elevation' };
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(saved);
      const updated: Calculator[] = [saved];
      calculatorDbServiceSpy.getAllCalculators.and.returnValue(of(updated));
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(1) });
      component.setFormView('Suction gauge elevation');
      component.headToolForm.patchValue({ flowRate: 321 });
      const closeSpy = spyOn(component.close, 'emit');
      await component.save();
      expect(calculatorDbServiceSpy.updateWithObservable).toHaveBeenCalledWith(saved);
      expect(saved.headTool.flowRate).toBe(321);
      expect(saved.headToolType).toBe('Suction gauge elevation');
      expect(calculatorDbServiceSpy.setAll).toHaveBeenCalledWith(updated);
      expect(closeSpy).toHaveBeenCalledWith(true);
    });

    it('in an assessment without a saved calculator adds a new one', async () => {
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(1) });
      const closeSpy = spyOn(component.close, 'emit');
      await component.save();
      const added = calculatorDbServiceSpy.addWithObservable.calls.mostRecent().args[0];
      expect(added.assessmentId).toBe(4);
      expect(added.headToolType).toBe('Suction tank elevation');
      expect(added.headTool.flowRate).toBe(1);
      expect(calculatorDbServiceSpy.setAll).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('destroy', () => {
    it('stores the standalone inputs and type on the service', () => {
      createComponent();
      component.setFormView('Suction gauge elevation');
      component.headToolForm.patchValue({ flowRate: 77 });
      component.headToolSuctionForm.patchValue({ flowRate: 88 });
      fixture.destroy();
      expect(headToolService.headToolType).toBe('Suction gauge elevation');
      expect(headToolService.headToolInputs.flowRate).toBe(77);
      expect(headToolService.headToolSuctionInputs.flowRate).toBe(88);
    });

    it('does not store inputs on the service in an assessment', () => {
      createComponent({ inAssessment: true, assessmentId: 4, psat: makePsat(1) });
      fixture.destroy();
      expect(headToolService.headToolType).toBeUndefined();
      expect(headToolService.headToolInputs).toBeUndefined();
    });
  });
});
