import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlowdownRateHelpComponent } from './blowdown-rate-help.component';
import { BoilerBlowdownRateRanges, BoilerBlowdownRateService } from '../boiler-blowdown-rate.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return (value ?? '') + (suffix || '');
  }
}

const MOCK_SETTINGS = { steamMassFlowMeasurement: 'klb', steamTemperatureMeasurement: 'F' } as Settings;
const MOCK_RANGES: BoilerBlowdownRateRanges = { steamFlowMax: 100000, steamTempMax: 1472, steamTempMin: 32, makeupWaterMin: 40, makeupWaterMax: 160 };

const SECTIONS: Array<{ field: string, heading: string, cells: Array<string> }> = [
  { field: 'steamFlow', heading: 'Steam Flow', cells: ['0 klb', '100000 klb'] },
  { field: 'steamTemperature', heading: 'Steam Temperature', cells: ['32 F', '1472 F'] },
  { field: 'feedwaterConductivity', heading: 'Feedwater Conductivity', cells: ['0 μS/cm', '9000 μS/cm'] },
  { field: 'blowdownConductivity', heading: 'Blowdown Conductivity', cells: ['0 μS/cm', '9000 μS/cm'] },
  { field: 'makeupWaterTemperature', heading: 'Makeup Water Temperature', cells: ['40 F', '160 F'] },
  { field: 'fuelCost', heading: 'Fuel Cost', cells: [] },
  { field: 'waterCost', heading: 'Water Cost', cells: [] },
  { field: 'operatingHours', heading: 'Operating Hours', cells: ['0 hrs/yr', '8760 hrs/yr'] },
  { field: 'boilerEfficiency', heading: 'Boiler Efficiency', cells: ['50 %', '100 %'] },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('BlowdownRateHelpComponent', () => {
  let component: BlowdownRateHelpComponent;
  let fixture: ComponentFixture<BlowdownRateHelpComponent>;
  let serviceMock: { currentField: BehaviorSubject<string>, getRanges: jasmine.Spy };

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function fieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'))
      .filter((section: HTMLElement) => normalize(section.querySelector('h6').childNodes[0].textContent) !== '') as Array<HTMLElement>;
  }

  beforeEach(async () => {
    serviceMock = {
      currentField: new BehaviorSubject<string>('default'),
      getRanges: jasmine.createSpy('getRanges').and.returnValue(MOCK_RANGES),
    };

    await TestBed.configureTestingModule({
      declarations: [BlowdownRateHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: BoilerBlowdownRateService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BlowdownRateHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('gets the ranges and current field', () => {
      expect(serviceMock.getRanges).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(component.ranges).toBe(MOCK_RANGES);
      expect(component.currentField).toBe('default');
    });
  });

  describe('general suggestions', () => {
    it('is collapsed by default with the right chevron', () => {
      expect(query('.fa-chevron-right')).not.toBeNull();
      expect(query('.fa-chevron-down')).toBeNull();
      expect(normalize(fixture.nativeElement.textContent)).not.toContain('Continuous blowdown removes');
    });

    it('expands with the down chevron when toggled', () => {
      component.toggleSuggestions();
      fixture.detectChanges();
      expect(query('.fa-chevron-down')).not.toBeNull();
      expect(query('.fa-chevron-right')).toBeNull();
      expect(normalize(fixture.nativeElement.textContent)).toContain('Continuous blowdown removes');
    });
  });

  describe('field sections', () => {
    it('renders no field section for the default field', () => {
      expect(fieldSections().length).toBe(0);
    });

    SECTIONS.forEach(s => {
      it(`renders only the ${s.heading} section for ${s.field}`, () => {
        serviceMock.currentField.next(s.field);
        fixture.detectChanges();
        const sections = fieldSections();
        expect(sections.length).toBe(1);
        expect(normalize(sections[0].querySelector('h6').childNodes[0].textContent)).toBe(s.heading);
        const cells = Array.from(sections[0].querySelectorAll('td')).map((c: HTMLElement) => normalize(c.textContent));
        expect(cells).toEqual(s.cells);
      });
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after destroy', () => {
      fixture.destroy();
      serviceMock.currentField.next('steamFlow');
      expect(component.currentField).toBe('default');
    });
  });
});
