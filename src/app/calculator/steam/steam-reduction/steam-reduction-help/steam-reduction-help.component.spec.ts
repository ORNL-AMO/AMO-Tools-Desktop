import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SteamReductionHelpComponent } from './steam-reduction-help.component';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'utilityCost', heading: 'Utility Cost' },
  { field: 'hoursPerYear', heading: 'Operation Hours' },
  { field: 'systemEfficiency', heading: 'System Efficiency' },
  { field: 'pressure', heading: 'Pressure' },
  { field: 'measurementMethod', heading: 'Method of Measurement' },
  { field: 'flowMeterFlowRate', heading: 'Flow Rate (Flow Meter Method)' },
  { field: 'isNameplate', heading: 'Method of Measurement' },
  { field: 'areaOfDuct', heading: 'Area of Duct' },
  { field: 'airVelocity', heading: 'Air Velocity' },
  { field: 'airFlow', heading: 'Air Flow Rate' },
  { field: 'airInletTemperature', heading: 'Inlet Temperature (Air)' },
  { field: 'airOutletTemperature', heading: 'Outlet Temperature (Air)' },
  { field: 'waterFlowRate', heading: 'Water Flow Rate' },
  { field: 'waterInletTemperature', heading: 'Inlet Temperature (Water)' },
  { field: 'waterOutletTemperature', heading: 'Outlet Temperature (Water)' },
  { field: 'consumption', heading: 'Consumption' },
  { field: 'units', heading: 'Number of Units' },
];

const UNIT_SECTIONS: Array<{ field: string, imperial: string, metric: string }> = [
  { field: 'utilityCost', imperial: '($/MMBtu).', metric: '($/MJ).' },
  { field: 'pressure', imperial: '(psig).', metric: '(Pag).' },
  { field: 'flowMeterFlowRate', imperial: '(lb/hr).', metric: '(kg/hr).' },
  { field: 'consumption', imperial: '(MMBtu).', metric: '(MJ).' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('SteamReductionHelpComponent', () => {
  let component: SteamReductionHelpComponent;
  let fixture: ComponentFixture<SteamReductionHelpComponent>;

  function getSectionHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 > h6'))
      .filter((heading: HTMLElement) => heading.childNodes[0].nodeType === Node.TEXT_NODE)
      .map((heading: HTMLElement) => normalize(heading.childNodes[0].textContent));
  }

  function getUnitSpans(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 small > span'))
      .map((span: HTMLElement) => normalize(span.textContent));
  }

  function render(currentField: string, settings: Settings = IMPERIAL_SETTINGS): void {
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SteamReductionHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SteamReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', IMPERIAL_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('always renders the calculator help header and docs link', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toBe('Steam Reduction Help');
      expect(normalize(fixture.nativeElement.querySelector('a.click-link').textContent)).toBe('How is Steam Reduction calculated?');
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      expect(getSectionHeadings()).toEqual([]);
    });

    it('renders no field section when currentField matches no section', () => {
      render('operatingHours');
      expect(getSectionHeadings()).toEqual([]);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.heading} section when currentField is ${section.field}`, () => {
        render(section.field);
        expect(getSectionHeadings()).toEqual([section.heading]);
      });
    });

    it('renders the operating hours range table only in the hoursPerYear section', () => {
      render('hoursPerYear');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('table td'))
        .map((cell: HTMLElement) => normalize(cell.textContent));
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      render('pressure');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  });

  describe('unit text', () => {
    UNIT_SECTIONS.forEach(section => {
      it(`shows the imperial unit for ${section.field}`, () => {
        render(section.field, IMPERIAL_SETTINGS);
        expect(getUnitSpans()).toEqual([section.imperial]);
      });

      it(`shows the metric unit for ${section.field}`, () => {
        render(section.field, METRIC_SETTINGS);
        expect(getUnitSpans()).toEqual([section.metric]);
      });
    });
  });
});
