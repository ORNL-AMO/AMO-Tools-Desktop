import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TurbineHelpComponent } from './turbine-help.component';
import { TurbineRanges, TurbineService } from '../turbine.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return (value ?? '') + (suffix || '');
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
} as Settings;

const MOCK_RANGES: TurbineRanges = {
  inletPressureMin: 1, inletPressureMax: 2,
  inletQuantityValueMin: 3, inletQuantityValueMax: 4,
  isentropicEfficiencyMin: 20, isentropicEfficiencyMax: 100,
  generatorEfficiencyMin: 50, generatorEfficiencyMax: 100,
  massFlowOrPowerOutMin: 0, massFlowOrPowerOutMax: 10000,
  outletSteamPressureMin: 5, outletSteamPressureMax: 6,
  outletQuantityValueMin: 7, outletQuantityValueMax: 8,
};

const SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'solveFor', heading: '"Solve For" Option' },
  { field: 'inletPressure', heading: 'Pressure (Inlet)' },
  { field: 'inletQuantity', heading: 'Known Variable' },
  { field: 'outletQuantity', heading: 'Known Variable' },
  { field: 'turbineProperty', heading: 'Turbine Property' },
  { field: 'isentropicEfficiency', heading: 'Isentropic Efficiency' },
  { field: 'generatorEfficiency', heading: 'Generator Efficiency' },
  { field: 'outletSteamPressure', heading: 'Outlet Steam Pressure' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TurbineHelpComponent', () => {
  let component: TurbineHelpComponent;
  let fixture: ComponentFixture<TurbineHelpComponent>;
  let turbineServiceSpy: jasmine.SpyObj<TurbineService>;

  function createComponent(inputs: { [key: string]: any }): void {
    fixture = TestBed.createComponent(TurbineHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  function sections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function sectionHeading(): string {
    const h6: HTMLElement = sections()[0].querySelector('h6');
    const parts: Array<string> = [];
    for (const node of Array.from(h6.childNodes)) {
      if (node.nodeName === 'BR') {
        break;
      }
      if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
        parts.push(node.textContent);
      }
    }
    return normalize(parts.join(' '));
  }

  function descriptionSpans(): Array<string> {
    return Array.from(sections()[0].querySelectorAll('h6 small span')).map((s: HTMLElement) => normalize(s.textContent));
  }

  function tableCells(): Array<string> {
    return Array.from(sections()[0].querySelectorAll('table td')).map((c: HTMLElement) => normalize(c.textContent));
  }

  beforeEach(async () => {
    turbineServiceSpy = jasmine.createSpyObj('TurbineService', ['getRangeValues']);
    turbineServiceSpy.getRangeValues.and.returnValue(MOCK_RANGES);

    await TestBed.configureTestingModule({
      declarations: [TurbineHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: TurbineService, useValue: turbineServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('gets ranges for the inlet and outlet quantities', () => {
      createComponent({ inletQuantity: 1, outletQuantity: 2 });
      expect(turbineServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 1, 2);
      expect(component.rangeValues).toBe(MOCK_RANGES);
    });

    it('refreshes ranges when the quantities change', () => {
      createComponent({ inletQuantity: 0, outletQuantity: 0 });
      turbineServiceSpy.getRangeValues.calls.reset();
      fixture.componentRef.setInput('outletQuantity', 1);
      fixture.detectChanges();
      expect(turbineServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 0, 1);
    });
  });

  describe('template visibility', () => {
    it('renders no field section for the default field', () => {
      createComponent({ currentField: 'default' });
      expect(sections().length).toBe(0);
    });

    SECTIONS.forEach(s => {
      it(`renders only the ${s.heading} section for ${s.field}`, () => {
        createComponent({ currentField: s.field });
        expect(sections().length).toBe(1);
        expect(sectionHeading()).toBe(s.heading);
      });
    });

    it('renders the inlet pressure range table', () => {
      createComponent({ currentField: 'inletPressure' });
      expect(tableCells()).toEqual(['1 psig', '2 psig']);
    });

    it('renders the efficiency range tables', () => {
      createComponent({ currentField: 'isentropicEfficiency' });
      expect(tableCells()).toEqual(['20 %', '100 %']);
      fixture.componentRef.setInput('currentField', 'generatorEfficiency');
      fixture.detectChanges();
      expect(tableCells()).toEqual(['50 %', '100 %']);
    });

    it('renders the outlet steam pressure range table', () => {
      createComponent({ currentField: 'outletSteamPressure' });
      expect(tableCells()).toEqual(['5 psig', '6 psig']);
    });

    it('renders no table for sections without ranges', () => {
      createComponent({ currentField: 'solveFor' });
      expect(sections()[0].querySelector('table')).toBeNull();
    });
  });

  describe('inlet quantity value section', () => {
    const CASES: Array<{ quantity: number, heading: string, description: string, unit: string }> = [
      { quantity: 0, heading: 'Temperature (Inlet)', description: 'The temperature at the inlet.', unit: 'F' },
      { quantity: 1, heading: 'Specific Enthalpy', description: 'Specific Enthalpy (h)', unit: 'btuLb' },
      { quantity: 2, heading: 'Specific Entropy', description: 'Specific Entropy (s)', unit: 'btulbF' },
      { quantity: 3, heading: 'Saturated Quality', description: 'Quality is the vapor mass percentage', unit: '' },
    ];

    CASES.forEach(c => {
      it(`renders the ${c.heading} heading, description and range for inlet quantity ${c.quantity}`, () => {
        createComponent({ currentField: 'inletQuantityValue', inletQuantity: c.quantity });
        expect(sectionHeading()).toBe(c.heading);
        const descriptions = descriptionSpans();
        expect(descriptions.length).toBe(1);
        expect(descriptions[0]).toContain(c.description);
        expect(tableCells()).toEqual([normalize(`3 ${c.unit}`), normalize(`4 ${c.unit}`)]);
      });
    });

    it('renders no heading or description for an unknown inlet quantity', () => {
      createComponent({ currentField: 'inletQuantityValue', inletQuantity: 9 });
      expect(sectionHeading()).toBe('');
      expect(descriptionSpans()).toEqual([]);
    });
  });

  describe('outlet quantity value section', () => {
    it('renders the section with no heading or description because outletQuantityValue is not a component property', () => {
      createComponent({ currentField: 'outletQuantityValue', outletQuantity: 0 });
      expect(sections().length).toBe(1);
      expect(sectionHeading()).toBe('');
      expect(descriptionSpans()).toEqual([]);
    });

    it('renders the outlet range with the outlet quantity unit', () => {
      createComponent({ currentField: 'outletQuantityValue', outletQuantity: 1 });
      expect(tableCells()).toEqual(['7 btuLb', '8 btuLb']);
    });
  });

  describe('mass flow or power out section', () => {
    it('renders the mass flow heading, description and range for mass flow', () => {
      createComponent({ currentField: 'massFlowOrPowerOut', turbineProperty: 0 });
      expect(sectionHeading()).toBe('Mass Flow');
      expect(descriptionSpans()).toEqual(['Mass flow of the inlet steam.']);
      expect(tableCells()).toEqual(['0 klb/hr', '10000 klb/hr']);
    });

    it('renders the power out heading, description and range for power out', () => {
      createComponent({ currentField: 'massFlowOrPowerOut', turbineProperty: 1 });
      expect(sectionHeading()).toBe('Power Out');
      expect(descriptionSpans()).toEqual(['The electricity generated by the turbine.']);
      expect(tableCells()).toEqual(['0 kW', '— —']);
    });

    it('renders no heading, description or range row for an unknown property', () => {
      createComponent({ currentField: 'massFlowOrPowerOut', turbineProperty: 5 });
      expect(sectionHeading()).toBe('');
      expect(descriptionSpans()).toEqual([]);
      expect(tableCells()).toEqual([]);
    });
  });
});
