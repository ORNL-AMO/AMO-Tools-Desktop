import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GasDensityHelpComponent } from './gas-density-help.component';
import { FanAnalysisService } from '../../../fan-analysis.service';

const FIELD_HELP: Array<{ field: string, heading: string }> = [
  { field: 'gasType', heading: 'Gas Type' },
  { field: 'inputType', heading: 'Method to Establish Gas Density' },
  { field: 'dryBulbTemp', heading: 'Dry Bulb Temp' },
  { field: 'staticPressure', heading: 'Static Pressure' },
  { field: 'barometricPressure', heading: 'Barometric Pressure' },
  { field: 'specificGravity', heading: 'Gas Relative Density' },
  { field: 'relativeHumidity', heading: 'Relative Humidity' },
  { field: 'wetBulbTemp', heading: 'Wet Bulb Temp' },
  { field: 'specificHeatGas', heading: 'Specific Heat Gas' },
  { field: 'dewPoint', heading: 'Gas Dew Point' },
  { field: 'gasDensity', heading: 'Gas Density' },
];

describe('GasDensityHelpComponent', () => {
  let component: GasDensityHelpComponent;
  let fixture: ComponentFixture<GasDensityHelpComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;

  function fieldHeadings(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2 h6') as NodeListOf<HTMLElement>)
      .map(h6 => h6.textContent.trim());
  }

  beforeEach(async () => {
    fanAnalysisService = { currentField: new BehaviorSubject<string>('default') };

    await TestBed.configureTestingModule({
      declarations: [GasDensityHelpComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GasDensityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes currentField from the fan analysis service', () => {
      expect(component.currentField).toBe('default');
    });
  });

  describe('template visibility', () => {
    it('shows no field help when currentField matches no field', () => {
      expect(fieldHeadings()).toEqual([]);
    });

    FIELD_HELP.forEach(({ field, heading }) => {
      it(`shows only the ${heading} help when currentField is ${field}`, () => {
        fanAnalysisService.currentField.next(field);
        fixture.detectChanges();
        const headings = fieldHeadings();
        expect(headings.length).toBe(1);
        expect(headings[0].startsWith(heading)).toBeTrue();
      });
    });
  });

  describe('destroy', () => {
    it('stops updating currentField after destroy', () => {
      fixture.destroy();
      fanAnalysisService.currentField.next('gasType');
      expect(component.currentField).toBe('default');
    });
  });
});
