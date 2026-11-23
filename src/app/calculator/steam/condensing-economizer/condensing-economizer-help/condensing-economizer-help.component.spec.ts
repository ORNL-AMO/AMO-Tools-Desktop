import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CondensingEconomizerHelpComponent } from './condensing-economizer-help.component';
import { CondensingEconomizerService } from '../condensing-economizer.service';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

const FIELD_CASES: Array<{ field: string, heading: string }> = [
  { field: 'operationHours', heading: 'Operating Hours' },
  { field: 'flueGasTemperature', heading: 'Flue Gas Temperature' },
  { field: 'modifiedFlueGasTemperature', heading: 'New Flue Gas Temperature' },
  { field: 'heatInput', heading: 'Heat Input' },
  { field: 'fuelCost', heading: 'Fuel Cost' },
  { field: 'operatingHours', heading: 'Operating Hours' },
  { field: 'flueGasO2', heading: 'O2 in Flue Gas' },
  { field: 'combustionAirTemperature', heading: 'Combustion Air Temperature' },
  { field: 'moistureInCombustionAir', heading: 'Moisture in Combustion Air' },
  { field: 'feedWaterTemperature', heading: 'Feedwater Temperature' },
];

describe('CondensingEconomizerHelpComponent', () => {
  let component: CondensingEconomizerHelpComponent;
  let fixture: ComponentFixture<CondensingEconomizerHelpComponent>;
  let serviceStub: Partial<CondensingEconomizerService>;

  function fieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2'))
      .filter((el: HTMLElement) => el.querySelector('h6')) as Array<HTMLElement>;
  }

  function headingText(section: HTMLElement): string {
    const h6 = section.querySelector('h6').cloneNode(true) as HTMLElement;
    h6.querySelector('small')?.remove();
    return h6.textContent.replace(/\s+/g, ' ').trim();
  }

  function createComponent(settings: Settings = IMPERIAL): void {
    fixture = TestBed.createComponent(CondensingEconomizerHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function setField(field: string): void {
    serviceStub.currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { currentField: new BehaviorSubject<string>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [CondensingEconomizerHelpComponent],
      providers: [{ provide: CondensingEconomizerService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('tracks the current field from the service', () => {
      createComponent();
      setField('heatInput');
      expect(component.currentField).toBe('heatInput');
    });

    it('shows only the general help when no field is focused', () => {
      createComponent();
      expect(fieldSections().length).toBe(0);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Heat Recovery From Condensing Heat Exchanger Help');
    });

    it('shows no field help for an unknown field', () => {
      createComponent();
      setField('unknownField');
      expect(fieldSections().length).toBe(0);
    });
  });

  describe('field help visibility', () => {
    FIELD_CASES.forEach(({ field, heading }) => {
      it(`shows only the ${field} help when ${field} is focused`, () => {
        createComponent();
        setField(field);
        const sections = fieldSections();
        expect(sections.length).toBe(1);
        expect(headingText(sections[0])).toBe(heading);
      });
    });
  });

  describe('unit-specific field help', () => {
    it('shows the imperial fuel temperature help for imperial settings', () => {
      createComponent(IMPERIAL);
      setField('fuelTemp');
      const sections = fieldSections();
      expect(sections.length).toBe(1);
      expect(headingText(sections[0])).toBe('Fuel Temperature');
      expect(sections[0].textContent.replace(/\s+/g, ' ')).toContain('about 10℉');
    });

    it('shows the metric fuel temperature help for metric settings', () => {
      createComponent(METRIC);
      setField('fuelTemp');
      const sections = fieldSections();
      expect(sections.length).toBe(1);
      expect(headingText(sections[0])).toBe('Fuel Temperature');
      expect(sections[0].textContent.replace(/\s+/g, ' ')).toContain('about 5℃');
    });

    it('shows no fuel temperature help when the unit system is neither imperial nor metric', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings);
      setField('fuelTemp');
      expect(fieldSections().length).toBe(0);
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after destroy', () => {
      createComponent();
      setField('heatInput');
      fixture.destroy();
      serviceStub.currentField.next('fuelCost');
      expect(component.currentField).toBe('heatInput');
    });
  });
});
