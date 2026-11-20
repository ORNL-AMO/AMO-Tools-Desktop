import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FsatBasicsHelpComponent } from './fsat-basics-help.component';
import { FanAnalysisService } from '../../../fan-analysis.service';

const FIELD_HELP: Array<{ field: string, heading: string }> = [
  { field: 'fanSpeed', heading: 'Fan Speed' },
  { field: 'motorSpeed', heading: 'Motor Speed' },
  { field: 'globalBarometricPressure', heading: 'Barometric Pressure' },
  { field: 'fanSpeedCorrected', heading: 'Corrected Fan Speed' },
  { field: 'densityCorrected', heading: 'Corrected Density' },
  { field: 'pressureBarometricCorrected', heading: 'Corrected Barometric Pressure' },
  { field: 'includesEvase', heading: 'Rated Fan Performance Includes Evase' },
  { field: 'traversePlanes', heading: 'Number of Traverse Planes' },
];

describe('FsatBasicsHelpComponent', () => {
  let component: FsatBasicsHelpComponent;
  let fixture: ComponentFixture<FsatBasicsHelpComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;

  function fieldHeadings(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2 h6') as NodeListOf<HTMLElement>)
      .map(h6 => h6.textContent.trim());
  }

  beforeEach(async () => {
    fanAnalysisService = { currentField: new BehaviorSubject<string>('default') };

    await TestBed.configureTestingModule({
      declarations: [FsatBasicsHelpComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatBasicsHelpComponent);
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
      fanAnalysisService.currentField.next('fanSpeed');
      expect(component.currentField).toBe('default');
    });
  });
});
