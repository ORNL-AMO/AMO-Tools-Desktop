import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerBasinHelpComponent } from './cooling-tower-basin-help.component';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const HELP_CASES: Array<{ field: string, heading: string, text: string }> = [
  { field: 'ratedCapacity', heading: 'Rated Capacity', text: 'capacity can be found on the nameplate' },
  { field: 'ratedTempSetPoint', heading: 'Basin Temperature Setpoint', text: 'calculation of rated pan heat loss' },
  { field: 'ratedTempDryBulb', heading: 'Ambient Dry Bulb Temperature', text: 'Ambient dry bulb temperature for the calucation' },
  { field: 'ratedWindSpeed', heading: 'Windspeed', text: 'Windspeed for the calcuation of rated pan heat loss' },
  { field: 'panLossRatio', heading: 'Pan Loss Ratio', text: 'ratio of the design pan losses' },
  { field: 'operatingWindSpeed', heading: 'Windspeed', text: 'estimated average windspeed' },
  { field: 'operatingHours', heading: 'Annual Operating Hours', text: 'Number of hours per year the chiller' },
  { field: 'operatingTempDryBulb', heading: 'Ambient Dry Bulb Temperature', text: 'Actual ambient dry bulb temperature' },
  { field: 'baselineTempSetPoint', heading: 'Basin Temperature Setpoint', text: 'operating setpoint for Basin Temperature' },
  { field: 'modTempSetPoint', heading: 'Basin Temperature Setpoint', text: 'operating setpoint for Basin Temperature' },
];

describe('CoolingTowerBasinHelpComponent', () => {
  let component: CoolingTowerBasinHelpComponent;
  let fixture: ComponentFixture<CoolingTowerBasinHelpComponent>;
  let currentField: BehaviorSubject<string>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>(undefined);
    const serviceStub: Partial<CoolingTowerBasinService> = { currentField };

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerBasinHelpComponent],
      providers: [{ provide: CoolingTowerBasinService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoolingTowerBasinHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component and always renders the calculator description', () => {
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Cooling Tower Basin Heater Energy Help');
    });

    it('renders no field help without a current field', () => {
      expect(getSections().length).toBe(0);
    });
  });

  describe('field help', () => {
    HELP_CASES.forEach(({ field, heading, text }) => {
      it(`shows only the ${field} help when it is focused`, () => {
        currentField.next(field);
        fixture.detectChanges();
        const sections = getSections();
        expect(sections.length).toBe(1);
        expect(sections[0].querySelector('h6').textContent).toContain(heading);
        expect(sections[0].textContent).toContain(text);
      });
    });

    it('renders no field help for an unknown field', () => {
      currentField.next('electricityCost');
      fixture.detectChanges();
      expect(getSections().length).toBe(0);
    });

    it('switches help when the current field changes', () => {
      currentField.next('ratedCapacity');
      fixture.detectChanges();
      currentField.next('panLossRatio');
      fixture.detectChanges();
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].textContent).toContain('Pan Loss Ratio');
    });
  });

  describe('destroy', () => {
    it('unsubscribes from the current field', () => {
      fixture.destroy();
      expect(currentField.observed).toBeFalse();
    });
  });
});
