import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WaterHeatingHelpComponent } from './water-heating-help.component';
import { WaterHeatingService } from '../water-heating.service';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;

const FIELD_CASES: Array<{ field: string, heading: string }> = [
  { field: 'pressureSteamIn', heading: 'Vent Steam Pressure' },
  { field: 'flowSteamRate', heading: 'Vent Steam Mass Flow Rate' },
  { field: 'temperatureWaterIn', heading: 'Water HX Inlet Temperature' },
  { field: 'pressureWaterOut', heading: 'Water HX Outlet Pressure' },
  { field: 'flowWaterRate', heading: 'Water HX Flow Rate' },
  { field: 'effWaterHeater', heading: 'Current Water Heater Efficiency' },
  { field: 'operationHours', heading: 'Operating Hours' },
  { field: 'fuelCost', heading: 'Cost of Fuel (Water Heater)' },
  { field: 'fuelHV', heading: 'Heating Value of Natural Gas' },
  { field: 'tempMakeupWater', heading: 'Makeup Water Temperature' },
  { field: 'presMakeupWater', heading: 'Makeup Water Pressure' },
  { field: 'fuelCostBoiler', heading: 'Cost of Fuel (Steam Boiler)' },
  { field: 'heatingValueGas', heading: 'Cost of Fuel (Steam Boiler)' },
  { field: 'effBoiler', heading: 'Boiler Efficiency' },
  { field: 'waterCost', heading: 'Cost of Makeup Water' },
  { field: 'treatCost', heading: 'Cost of Makeup Water Treatment' },
];

describe('WaterHeatingHelpComponent', () => {
  let component: WaterHeatingHelpComponent;
  let fixture: ComponentFixture<WaterHeatingHelpComponent>;
  let serviceStub: Partial<WaterHeatingService>;

  function fieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2'))
      .filter((el: HTMLElement) => el.querySelector('h6')) as Array<HTMLElement>;
  }

  function headingText(section: HTMLElement): string {
    const h6 = section.querySelector('h6').cloneNode(true) as HTMLElement;
    h6.querySelector('small')?.remove();
    return h6.textContent.replace(/\s+/g, ' ').trim();
  }

  function divider(): HTMLElement | null {
    return fixture.nativeElement.querySelector(':scope > div > hr');
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(WaterHeatingHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', IMPERIAL);
    fixture.detectChanges();
  }

  function setField(field: string): void {
    serviceStub.currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { currentField: new BehaviorSubject<string>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [WaterHeatingHelpComponent],
      providers: [{ provide: WaterHeatingService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('tracks the current field from the service', () => {
      createComponent();
      setField('fuelCost');
      expect(component.currentField).toBe('fuelCost');
    });

    it('shows only the general help, docs link and diagram when no field is focused', () => {
      createComponent();
      expect(fieldSections().length).toBe(0);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Vent Steam to Heat Water Help');
      expect(fixture.nativeElement.querySelector('a.pl-1').getAttribute('href'))
        .toContain('group__water__heating__using__steam__calculator');
      expect(fixture.nativeElement.querySelector('img.help-img')).not.toBeNull();
    });

    it('hides the divider when no field is focused', () => {
      createComponent();
      expect(divider()).toBeNull();
    });

    it('shows the divider but no field help for an unknown field', () => {
      createComponent();
      setField('unknownField');
      expect(fieldSections().length).toBe(0);
      expect(divider()).not.toBeNull();
    });
  });

  describe('field help visibility', () => {
    FIELD_CASES.forEach(({ field, heading }) => {
      it(`shows only the ${field} help and the divider when ${field} is focused`, () => {
        createComponent();
        setField(field);
        const sections = fieldSections();
        expect(sections.length).toBe(1);
        expect(headingText(sections[0])).toBe(heading);
        expect(divider()).not.toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after destroy', () => {
      createComponent();
      setField('fuelCost');
      fixture.destroy();
      serviceStub.currentField.next('effBoiler');
      expect(component.currentField).toBe('fuelCost');
    });
  });
});
