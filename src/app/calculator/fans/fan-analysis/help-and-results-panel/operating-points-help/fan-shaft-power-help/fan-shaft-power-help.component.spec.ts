import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanShaftPowerHelpComponent } from './fan-shaft-power-help.component';
import { FanAnalysisService } from '../../../fan-analysis.service';

const FIELD_HELP: Array<{ field: string, heading: string }> = [
  { field: 'fanSpeed', heading: 'Fan Speed' },
  { field: 'isMethodOne', heading: 'Method for Establishing Motor Input Power' },
  { field: 'driveType', heading: 'Drive Type' },
  { field: 'ratedHP', heading: 'Rated Motor Power' },
  { field: 'synchronousSpeed', heading: 'Synchronous Speed' },
  { field: 'lineFrequency', heading: 'Line Frequency' },
  { field: 'efficiencyClass', heading: 'Efficiency Class' },
  { field: 'npv', heading: 'Nameplate Voltage' },
  { field: 'fla', heading: 'Full Load Amps' },
  { field: 'powerFactorAtLoad', heading: 'Power Factor at Load' },
  { field: 'efficiencyMotor', heading: 'Motor Efficiency at Load' },
  { field: 'isVFD', heading: 'Fan Equipped with a VFD' },
  { field: 'efficiencyBelt', heading: 'Belt Efficiency' },
  { field: 'motorShaftPower', heading: 'Motor Input Power' },
  { field: 'efficiencyVFD', heading: 'VFD Efficiency' },
];

describe('FanShaftPowerHelpComponent', () => {
  let component: FanShaftPowerHelpComponent;
  let fixture: ComponentFixture<FanShaftPowerHelpComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;

  function fieldHeadings(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2 h6') as NodeListOf<HTMLElement>)
      .map(h6 => h6.textContent.trim());
  }

  beforeEach(async () => {
    fanAnalysisService = { currentField: new BehaviorSubject<string>('default') };

    await TestBed.configureTestingModule({
      declarations: [FanShaftPowerHelpComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanShaftPowerHelpComponent);
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
