import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StackLossHelpComponent } from './stack-loss-help.component';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

const FIELD_HELP: Array<{ field: string, headings: string[] }> = [
  { field: 'measurementType', headings: ['Type of Fuel'] },
  { field: 'gasTypeId', headings: ['Fuel'] },
  { field: 'flueGasTemperature', headings: ['Stack Gas Temperature'] },
  { field: 'oxygenCalculationMethod', headings: ['O2 in Flue Gas / Excess Air Dropdown'] },
  { field: 'excessAirPercentage', headings: ['Excess Air'] },
  { field: 'o2InFlueGas', headings: ['O2 in Flue Gas'] },
  { field: 'combustionAirTemperature', headings: ['Ambient Air Temperature'] },
  { field: 'fuelTemperature', headings: ['Fuel temperature', 'Fuel temperature'] },
  { field: 'moistureInAirCombustion', headings: ['Moisture in Air'] },
  { field: 'unburnedCarbonInAsh', headings: ['Unburned Carbon in Ash'] },
];

const UNIT_HELP: Array<{ field: string, settings: Settings, heading: string, text: string, otherText: string }> = [
  { field: 'ambientAirTemp', settings: IMPERIAL, heading: 'Ambient Air Temperature', text: '150℉', otherText: '65℃' },
  { field: 'ambientAirTemp', settings: METRIC, heading: 'Ambient Air Temperature', text: '65℃', otherText: '150℉' },
  { field: 'ashDischargeTemperature', settings: IMPERIAL, heading: 'Ash Discharge Temperature', text: '2700℉', otherText: '1500℃' },
  { field: 'ashDischargeTemperature', settings: METRIC, heading: 'Ash Discharge Temperature', text: '1500℃', otherText: '2700℉' },
];

describe('StackLossHelpComponent', () => {
  let component: StackLossHelpComponent;
  let fixture: ComponentFixture<StackLossHelpComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function fieldSections(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-1, .help-info > div.my-2') as NodeListOf<HTMLElement>)
      .filter(section => !section.querySelector('ul'));
  }

  function headings(): string[] {
    return fieldSections().map(section => {
      const h6 = section.querySelector('h6').cloneNode(true) as HTMLElement;
      h6.querySelectorAll('small').forEach(small => small.remove());
      return h6.textContent.trim().replace(/\s+/g, ' ');
    });
  }

  function createComponent(currentField: string = 'default', settings: Settings = IMPERIAL): void {
    fixture = TestBed.createComponent(StackLossHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentField', currentField);
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StackLossHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('savings suggestions', () => {
    beforeEach(() => createComponent());

    it('starts collapsed with the right chevron', () => {
      expect(component.displaySuggestions).toBeFalse();
      expect(query('.fa-chevron-right')).not.toBeNull();
      expect(query('.fa-chevron-down')).toBeNull();
      expect(query('.help-info ul')).toBeNull();
    });

    it('expands with the down chevron when toggled', () => {
      component.toggleSuggestions();
      fixture.detectChanges();
      expect(query('.fa-chevron-down')).not.toBeNull();
      expect(query('.fa-chevron-right')).toBeNull();
      expect(query('.help-info ul').querySelectorAll('li').length).toBe(6);
    });

    it('collapses again when toggled twice', () => {
      component.toggleSuggestions();
      component.toggleSuggestions();
      fixture.detectChanges();
      expect(component.displaySuggestions).toBeFalse();
      expect(query('.help-info ul')).toBeNull();
    });
  });

  describe('field help', () => {
    it('shows no field help for the default field', () => {
      createComponent();
      expect(fieldSections().length).toBe(0);
    });

    FIELD_HELP.forEach(({ field, headings: expected }) => {
      it(`shows only the ${expected[0]} help when currentField is ${field}`, () => {
        createComponent(field);
        expect(headings()).toEqual(expected);
      });
    });

    UNIT_HELP.forEach(({ field, settings, heading, text, otherText }) => {
      it(`shows only the ${settings.unitsOfMeasure} ${heading} help when currentField is ${field}`, () => {
        createComponent(field, settings);
        expect(headings()).toEqual([heading]);
        const content = fieldSections()[0].textContent;
        expect(content).toContain(text);
        expect(content).not.toContain(otherText);
      });
    });

    it('shows no unit specific help for other units of measure', () => {
      createComponent('ambientAirTemp', { unitsOfMeasure: 'Other' } as Settings);
      expect(fieldSections().length).toBe(0);
    });
  });
});
