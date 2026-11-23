import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FeedwaterEconomizerHelpComponent } from './feedwater-economizer-help.component';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

const FIELD_CASES: Array<{ field: string, heading: string }> = [
  { field: 'operationHours', heading: 'Operating Hours' },
  { field: 'flueGasTemperature', heading: 'Flue Gas Temperature' },
  { field: 'fuelCost', heading: 'Fuel Cost' },
  { field: 'operatingHours', heading: 'Operating Hours' },
  { field: 'materialTypeId', heading: 'Fuel' },
  { field: 'oxygenCalculationMethod', heading: 'Percent Oxygen Or Excess Air' },
  { field: 'flueGasO2', heading: 'O2 in Flue Gas' },
  { field: 'excessAir', heading: 'Excess Air' },
  { field: 'combustionAirTemperature', heading: 'Combustion Air Temperature' },
  { field: 'moistureInCombustionAir', heading: 'Moisture in Combustion Air' },
  { field: 'energyRateInput', heading: 'Boiler Energy Rate Input' },
  { field: 'steamPressure', heading: 'Steam Pressure' },
  { field: 'steamCondition', heading: 'Steam Condition' },
  { field: 'steamTemperature', heading: 'Steam Temperature' },
  { field: 'feedWaterTemperature', heading: 'Feed Water Temperature' },
  { field: 'percBlowdown', heading: 'Boiler Blowdown Percentage of Feed Water' },
  { field: 'hxEfficiency', heading: 'Heat Exchanger Effectiveness' },
  { field: 'higherHeatingVal', heading: 'Higher Heating Value' },
];

const UNIT_FIELD_CASES: Array<{ field: string, heading: string, imperialText: string, metricText: string }> = [
  { field: 'fuelTemp', heading: 'Fuel Temperature', imperialText: 'about 10℉', metricText: 'about 5℃' },
  { field: 'ambientAirTemperature', heading: 'Ambient Air Temperature', imperialText: 'less than 150℉', metricText: 'less than 65℃' },
];

describe('FeedwaterEconomizerHelpComponent', () => {
  let component: FeedwaterEconomizerHelpComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerHelpComponent>;
  let serviceStub: Partial<FeedwaterEconomizerService>;

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
    fixture = TestBed.createComponent(FeedwaterEconomizerHelpComponent);
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
      declarations: [FeedwaterEconomizerHelpComponent],
      providers: [{ provide: FeedwaterEconomizerService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('tracks the current field from the service', () => {
      createComponent();
      setField('fuelCost');
      expect(component.currentField).toBe('fuelCost');
    });

    it('shows only the general help and docs link when no field is focused', () => {
      createComponent();
      expect(fieldSections().length).toBe(0);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Feed Water Economizer Help');
      expect(fixture.nativeElement.querySelector('a.pl-1').getAttribute('href'))
        .toContain('group__water__heating__using__flue__calculator');
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

    it('shows the operating hours range table', () => {
      createComponent();
      setField('operationHours');
      const cells = Array.from(fieldSections()[0].querySelectorAll('td')).map((td: HTMLElement) => td.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);
    });
  });

  describe('unit-specific field help', () => {
    UNIT_FIELD_CASES.forEach(({ field, heading, imperialText, metricText }) => {
      it(`shows the imperial ${field} help for imperial settings`, () => {
        createComponent(IMPERIAL);
        setField(field);
        const sections = fieldSections();
        expect(sections.length).toBe(1);
        expect(headingText(sections[0])).toBe(heading);
        expect(sections[0].textContent.replace(/\s+/g, ' ')).toContain(imperialText);
      });

      it(`shows the metric ${field} help for metric settings`, () => {
        createComponent(METRIC);
        setField(field);
        const sections = fieldSections();
        expect(sections.length).toBe(1);
        expect(headingText(sections[0])).toBe(heading);
        expect(sections[0].textContent.replace(/\s+/g, ' ')).toContain(metricText);
      });

      it(`shows no ${field} help when the unit system is neither imperial nor metric`, () => {
        createComponent({ unitsOfMeasure: 'Other' } as Settings);
        setField(field);
        expect(fieldSections().length).toBe(0);
      });
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after destroy', () => {
      createComponent();
      setField('fuelCost');
      fixture.destroy();
      serviceStub.currentField.next('hxEfficiency');
      expect(component.currentField).toBe('fuelCost');
    });
  });
});
