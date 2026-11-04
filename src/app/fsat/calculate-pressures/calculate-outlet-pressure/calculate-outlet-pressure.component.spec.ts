import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { CalculateOutletPressureComponent } from './calculate-outlet-pressure.component';
import { FsatService, InletVelocityPressureInputs } from '../../fsat.service';
import { FsatWarningService } from '../../fsat-warning.service';
import { OutletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(): string {
    return '';
  }
}

const FLOW_ERROR = 'Flow rate is required to calculate Inlet Velocity Pressure';

function makeSettings(unitsOfMeasure: string = 'Imperial'): Settings {
  return { unitsOfMeasure, fanPressureMeasurement: 'inH2o' } as Settings;
}

function makeData(overrides: Partial<OutletPressureData> = {}): OutletPressureData {
  return {
    outletSystemEffectLoss: 0,
    outletDamperLoss: 0,
    airTreatmentLoss: 0,
    systemDamperLoss: 0,
    outletDuctworkLoss: 0,
    processRequirementsFixed: 0,
    processRequirements: 0,
    calculatedOutletPressure: 0,
    inletVelocityPressure: 0,
    userDefinedVelocityPressure: false,
    fanOutletArea: 0,
    ...overrides,
  };
}

const MOCK_VELOCITY_INPUTS: InletVelocityPressureInputs = { gasDensity: 0.07, flowRate: 1000, ductArea: 0 };

describe('CalculateOutletPressureComponent', () => {
  let component: CalculateOutletPressureComponent;
  let fixture: ComponentFixture<CalculateOutletPressureComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let fsatWarningServiceSpy: jasmine.SpyObj<FsatWarningService>;

  beforeEach(async () => {
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['calculateInletVelocityPressure']);
    fsatServiceSpy.calculateInletVelocityPressure.and.returnValue(5.5);
    fsatWarningServiceSpy = jasmine.createSpyObj('FsatWarningService', ['checkCalcInletVelocityPressureError']);
    fsatWarningServiceSpy.checkCalcInletVelocityPressureError.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [CalculateOutletPressureComponent, SettingsLabelStubPipe],
      providers: [
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: FsatWarningService, useValue: fsatWarningServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  /** Must be called inside fakeAsync: ngAfterViewInit defers calculate() with setTimeout. */
  function createComponent(options: { data?: OutletPressureData; usingStaticPressure?: boolean; units?: string } = {}): void {
    fixture = TestBed.createComponent(CalculateOutletPressureComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', makeSettings(options.units));
    fixture.componentRef.setInput('bodyHeight', 500);
    fixture.componentRef.setInput('usingStaticPressure', options.usingStaticPressure ?? false);
    fixture.componentRef.setInput('inletVelocityPressureInputs', { ...MOCK_VELOCITY_INPUTS });
    if (options.data) {
      fixture.componentRef.setInput('outletPressureData', options.data);
    }
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const query = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const queryAll = (selector: string): NodeListOf<HTMLElement> => fixture.nativeElement.querySelectorAll(selector);

  describe('initialization', () => {
    it('creates default outlet pressure data when none is provided', fakeAsync(() => {
      createComponent();
      expect(component).toBeTruthy();
      expect(component.outletPressureData.outletSystemEffectLoss).toBe(0);
      expect(component.outletPressureData.userDefinedVelocityPressure).toBeFalse();
    }));

    it('keeps provided outlet pressure data', fakeAsync(() => {
      const data = makeData({ outletSystemEffectLoss: 2 });
      createComponent({ data, usingStaticPressure: true });
      expect(component.outletPressureData).toBe(data);
    }));

    it('emits the calculated data after the view initializes', fakeAsync(() => {
      const emitted: OutletPressureData[] = [];
      fixture = TestBed.createComponent(CalculateOutletPressureComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('settings', makeSettings());
      fixture.componentRef.setInput('usingStaticPressure', true);
      component.emitSave.subscribe((v: OutletPressureData) => emitted.push(v));
      fixture.detectChanges();
      tick();
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBe(component.outletPressureData);
    }));
  });

  describe('calculate', () => {
    it('sets calculated outlet pressure to the sum of the loss fields', fakeAsync(() => {
      createComponent({ data: makeData({ outletSystemEffectLoss: 1, outletDuctworkLoss: 2, processRequirements: 3 }), usingStaticPressure: true });
      expect(component.outletPressureData.calculatedOutletPressure).toBe(6);
      expect(query('.form-group.pt-1 .text-center').textContent).toContain('6.0');
    }));

    it('calculates inlet velocity pressure from the fan outlet area when not user defined and not static', fakeAsync(() => {
      createComponent({ data: makeData({ fanOutletArea: 4 }), usingStaticPressure: false });
      expect(fsatServiceSpy.calculateInletVelocityPressure).toHaveBeenCalled();
      expect(component.inletVelocityPressureInputs.ductArea).toBe(4);
      expect(component.outletPressureData.inletVelocityPressure).toBe(5.5);
    }));

    it('reports the flow rate error returned by the warning service', fakeAsync(() => {
      fsatWarningServiceSpy.checkCalcInletVelocityPressureError.and.returnValue(FLOW_ERROR);
      createComponent({ data: makeData({ fanOutletArea: 4 }), usingStaticPressure: false });
      expect(component.calcInletVelocityPressureError).toBe(FLOW_ERROR);
    }));

    it('does not calculate velocity pressure and resets the area when pressure is static', fakeAsync(() => {
      createComponent({ data: makeData({ fanOutletArea: 4 }), usingStaticPressure: true });
      expect(fsatServiceSpy.calculateInletVelocityPressure).not.toHaveBeenCalled();
      expect(component.outletPressureData.fanOutletArea).toBe(0);
    }));

    describe('emitInvalid', () => {
      let invalidEmitted: boolean[];

      function calculateWith(data: OutletPressureData, usingStaticPressure: boolean): void {
        createComponent({ data, usingStaticPressure });
        invalidEmitted = [];
        component.emitInvalid.subscribe((v: boolean) => invalidEmitted.push(v));
        component.calculate();
      }

      it('is valid when pressure is static', fakeAsync(() => {
        calculateWith(makeData(), true);
        expect(invalidEmitted).toEqual([false]);
      }));

      it('is invalid when estimating and the fan outlet area is zero', fakeAsync(() => {
        calculateWith(makeData({ fanOutletArea: 0 }), false);
        expect(invalidEmitted).toEqual([true]);
      }));

      it('is valid when estimating and the fan outlet area is entered', fakeAsync(() => {
        calculateWith(makeData({ fanOutletArea: 4 }), false);
        expect(invalidEmitted).toEqual([false]);
      }));

      it('is invalid when user defined and the velocity pressure is zero', fakeAsync(() => {
        calculateWith(makeData({ userDefinedVelocityPressure: true, inletVelocityPressure: 0 }), false);
        expect(invalidEmitted).toEqual([true]);
      }));

      it('is valid when user defined and the velocity pressure is entered', fakeAsync(() => {
        calculateWith(makeData({ userDefinedVelocityPressure: true, inletVelocityPressure: -1 }), false);
        expect(invalidEmitted).toEqual([false]);
      }));
    });
  });

  describe('changeField', () => {
    it('updates the current help field', fakeAsync(() => {
      createComponent();
      component.changeField('outletDuctworkLoss');
      expect(component.currentField).toBe('outletDuctworkLoss');
    }));
  });

  describe('template visibility', () => {
    describe('form', () => {
      it('shows the loss form when outlet pressure data exists', fakeAsync(() => {
        createComponent({ usingStaticPressure: true });
        expect(query('form')).not.toBeNull();
        expect(query('input[name="outletSystemEffectLoss"]')).not.toBeNull();
      }));

      it('hides the loss form when outlet pressure data is missing', fakeAsync(() => {
        createComponent({ usingStaticPressure: true });
        component.outletPressureData = null;
        fixture.detectChanges();
        expect(query('form')).toBeNull();
        expect(query('input[name="outletSystemEffectLoss"]')).toBeNull();
      }));

      it('always renders the help panel', fakeAsync(() => {
        createComponent({ usingStaticPressure: true });
        expect(query('app-calculate-outlet-pressure-help')).not.toBeNull();
      }));
    });

    describe('velocity pressure section', () => {
      it('is hidden when using static pressure', fakeAsync(() => {
        createComponent({ usingStaticPressure: true });
        expect(query('input[name="fanOutletArea"]')).toBeNull();
        expect(query('a.click-link')).toBeNull();
      }));

      it('is shown when not using static pressure', fakeAsync(() => {
        createComponent({ usingStaticPressure: false });
        expect(query('input[name="fanOutletArea"]')).not.toBeNull();
        expect(queryAll('a.click-link').length).toBe(1);
      }));
    });

    describe('estimated velocity pressure (not user defined)', () => {
      it('shows the fan outlet area input, the define link and no velocity pressure input', fakeAsync(() => {
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        expect(query('input[name="fanOutletArea"]')).not.toBeNull();
        expect(queryAll('a.click-link').length).toBe(1);
        expect(query('a.click-link').textContent).toContain('Define Outlet Velocity Pressure');
        expect(query('input[name="inletVelocityPressure"]')).toBeNull();
      }));

      it('shows the calculated velocity pressure value', fakeAsync(() => {
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        const display = queryAll('.input-group.justify-content-center .mr-2');
        expect(display.length).toBe(1);
        expect(display[0].textContent).toContain('5.5');
        expect(display[0].textContent).not.toContain('—');
      }));

      it('shows a placeholder when the velocity pressure is undefined', fakeAsync(() => {
        fsatServiceSpy.calculateInletVelocityPressure.and.returnValue(undefined);
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        const display = queryAll('.input-group.justify-content-center .mr-2');
        expect(display.length).toBe(1);
        expect(display[0].textContent).toContain('—');
      }));
    });

    describe('user defined velocity pressure', () => {
      const userDefined = (): OutletPressureData => makeData({ userDefinedVelocityPressure: true, inletVelocityPressure: -2 });

      it('hides the fan outlet area input and shows the velocity pressure input', fakeAsync(() => {
        createComponent({ data: userDefined() });
        expect(query('input[name="fanOutletArea"]')).toBeNull();
        expect(query('input[name="inletVelocityPressure"]')).not.toBeNull();
      }));

      it('shows the estimate link instead of the define link', fakeAsync(() => {
        createComponent({ data: userDefined() });
        expect(queryAll('a.click-link').length).toBe(1);
        expect(query('a.click-link').textContent).toContain('Estimate Outlet Velocity Pressure');
      }));

      it('hides the calculated velocity pressure display', fakeAsync(() => {
        createComponent({ data: userDefined() });
        expect(queryAll('.input-group.justify-content-center').length).toBe(0);
      }));

      it('switches between the two modes when the link is clicked', fakeAsync(() => {
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        query('a.click-link').click();
        fixture.detectChanges();
        expect(query('input[name="inletVelocityPressure"]')).not.toBeNull();
        expect(query('input[name="fanOutletArea"]')).toBeNull();

        query('a.click-link').click();
        fixture.detectChanges();
        expect(query('input[name="inletVelocityPressure"]')).toBeNull();
        expect(query('input[name="fanOutletArea"]')).not.toBeNull();
      }));
    });

    describe('fan outlet area units', () => {
      const unitsText = (): string => query('input[name="fanOutletArea"]').parentElement.querySelector('.units').textContent.trim();

      it('shows square feet for Imperial units only', fakeAsync(() => {
        createComponent({ units: 'Imperial' });
        expect(unitsText()).toBe('ft2');
      }));

      it('shows square meters for Metric units only', fakeAsync(() => {
        createComponent({ units: 'Metric' });
        expect(unitsText()).toBe('m2');
      }));

      it('shows no area units for any other unit system', fakeAsync(() => {
        createComponent({ units: 'Custom' });
        expect(unitsText()).toBe('');
      }));
    });

    describe('flow rate warning', () => {
      it('is shown when the warning service reports an error', fakeAsync(() => {
        fsatWarningServiceSpy.checkCalcInletVelocityPressureError.and.returnValue(FLOW_ERROR);
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        expect(query('.alert-warning')).not.toBeNull();
      }));

      it('is shown when the velocity pressure is zero', fakeAsync(() => {
        createComponent({ data: makeData({ userDefinedVelocityPressure: true, inletVelocityPressure: 0 }) });
        expect(query('.alert-warning')).not.toBeNull();
      }));

      it('is hidden when there is no error and a velocity pressure exists', fakeAsync(() => {
        createComponent({ data: makeData({ fanOutletArea: 4 }) });
        expect(query('.alert-warning')).toBeNull();
      }));
    });
  });
});
