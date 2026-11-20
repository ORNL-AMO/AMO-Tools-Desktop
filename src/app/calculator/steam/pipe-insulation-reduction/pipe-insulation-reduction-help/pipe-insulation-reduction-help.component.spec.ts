import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeInsulationReductionHelpComponent } from './pipe-insulation-reduction-help.component';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'operatingHours', heading: 'Operation Hours' },
  { field: 'utilityCost', heading: 'Utility Cost' },
  { field: 'systemEfficiency', heading: 'System Efficiency' },
  { field: 'pipeLength', heading: 'Pipe Length' },
  { field: 'pipeDiameterSelection', heading: 'Pipe Diameter' },
  { field: 'windVelocity', heading: 'Average Wind Speed' },
  { field: 'pipeTemperature', heading: 'Pipe Temperature' },
  { field: 'ambientTemperature', heading: 'Ambient Temperature' },
  { field: 'pipeBaseMaterialSelection', heading: 'Pipe Base Material' },
  { field: 'insulationMaterialSelection', heading: 'Insulation Material' },
  { field: 'insulationThickness', heading: 'Insulation Thickness' },
  { field: 'pipeJacketMaterialSelection', heading: 'Pipe Jacket Material' },
];

const UNIT_CASES: Array<{ field: string, imperial: string, metric: string }> = [
  { field: 'utilityCost', imperial: '($/MMBtu).', metric: '($/GJ).' },
  { field: 'pipeLength', imperial: '(ft)', metric: '(m)' },
  { field: 'pipeTemperature', imperial: '(℉)', metric: '(℃)' },
  { field: 'ambientTemperature', imperial: '(℉)', metric: '(℃)' },
  { field: 'insulationThickness', imperial: '(in)', metric: '(m)' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('PipeInsulationReductionHelpComponent', () => {
  let component: PipeInsulationReductionHelpComponent;
  let fixture: ComponentFixture<PipeInsulationReductionHelpComponent>;

  function createComponent(currentField: string, settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(PipeInsulationReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  function getSectionHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 > h6'))
      .map((heading: HTMLElement) => heading.childNodes[0])
      .filter((node: Node) => node.nodeType === Node.TEXT_NODE)
      .map((node: Node) => normalize(node.textContent))
      .filter(text => text !== '');
  }

  function getUnitSpans(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 > h6 small span'))
      .map((span: HTMLElement) => normalize(span.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PipeInsulationReductionHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('renders the header and docs link', () => {
      createComponent(undefined);
      expect(component).toBeTruthy();
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toBe('Pipe Insulation Reduction Help');
      expect(fixture.nativeElement.querySelector('a.click-link').getAttribute('href')).toContain('group__insulated__pipe__reduction__calculator');
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      createComponent(undefined);
      expect(getSectionHeadings()).toEqual([]);
    });

    it('renders no field section when currentField matches no section', () => {
      createComponent('unknownField');
      expect(getSectionHeadings()).toEqual([]);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.heading} section when currentField is ${section.field}`, () => {
        createComponent(section.field);
        expect(getSectionHeadings()).toEqual([section.heading]);
      });
    });

    it('renders the operating hours range table only for operatingHours', () => {
      createComponent('operatingHours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('table td')).map((c: HTMLElement) => normalize(c.textContent));
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);
    });

    it('renders no table for other fields', () => {
      createComponent('pipeLength');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    UNIT_CASES.forEach(c => {
      it(`shows only the imperial unit for ${c.field}`, () => {
        createComponent(c.field, IMPERIAL_SETTINGS);
        expect(getUnitSpans()).toEqual([c.imperial]);
      });

      it(`shows only the metric unit for ${c.field}`, () => {
        createComponent(c.field, METRIC_SETTINGS);
        expect(getUnitSpans()).toEqual([c.metric]);
      });
    });
  });
});
