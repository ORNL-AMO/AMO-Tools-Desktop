import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TankInsulationReductionHelpComponent } from './tank-insulation-reduction-help.component';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'operatingHours', heading: 'Operation Hours' },
  { field: 'utilityCost', heading: 'Utility Cost' },
  { field: 'systemEfficiency', heading: 'System Efficiency' },
  { field: 'tankHeight', heading: 'Tank Height' },
  { field: 'tankDiameter', heading: 'Tank Diameter' },
  { field: 'tankThickness', heading: 'Tank Wall Thickness' },
  { field: 'tankTemperature', heading: 'Internal Tank Temperature' },
  { field: 'ambientTemperature', heading: 'Ambient Temperature' },
  { field: 'tankMaterialSelection', heading: 'Tank Base Material' },
  { field: 'insulationMaterialSelection', heading: 'Insulation Material' },
  { field: 'customInsulationConductivity', heading: 'Insulation Conductivity' },
  { field: 'insulationThickness', heading: 'Insulation Thickness' },
  { field: 'jacketMaterialSelection', heading: 'Tank Jacket Material' },
];

const UNIT_SECTIONS: Array<{ field: string, imperial: string, metric: string }> = [
  { field: 'utilityCost', imperial: '($/MMBtu).', metric: '($/GJ).' },
  { field: 'tankHeight', imperial: '(ft)', metric: '(m)' },
  { field: 'tankDiameter', imperial: '(ft)', metric: '(m)' },
  { field: 'tankThickness', imperial: '(ft)', metric: '(m)' },
  { field: 'tankTemperature', imperial: '(℉)', metric: '(℃)' },
  { field: 'ambientTemperature', imperial: '(℉)', metric: '(℃)' },
  { field: 'customInsulationConductivity', imperial: 'Btu/(hr * ft * ℉)', metric: 'W/mK' },
  { field: 'insulationThickness', imperial: '(ft)', metric: '(m)' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TankInsulationReductionHelpComponent', () => {
  let component: TankInsulationReductionHelpComponent;
  let fixture: ComponentFixture<TankInsulationReductionHelpComponent>;

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
      declarations: [TankInsulationReductionHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TankInsulationReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', IMPERIAL_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('always renders the calculator help header and docs link', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toBe('Tank Insulation Reduction Help');
      expect(normalize(fixture.nativeElement.querySelector('a.click-link').textContent)).toBe('How is Tank Insulation Reduction calculated?');
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      expect(getSectionHeadings()).toEqual([]);
    });

    it('renders no field section when currentField matches no section', () => {
      render('surfaceTemperature');
      expect(getSectionHeadings()).toEqual([]);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.heading} section when currentField is ${section.field}`, () => {
        render(section.field);
        expect(getSectionHeadings()).toEqual([section.heading]);
      });
    });

    it('renders the operating hours range table only in the operatingHours section', () => {
      render('operatingHours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('table td'))
        .map((cell: HTMLElement) => normalize(cell.textContent));
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      render('tankHeight');
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
