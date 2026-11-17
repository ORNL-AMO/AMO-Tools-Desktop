import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChillerPerformanceHelpComponent } from './chiller-performance-help.component';
import { ChillerPerformanceService } from '../chiller-performance.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const HELP_CASES: Array<{ field: string, heading: string }> = [
  { field: 'chillerType', heading: 'Chiller Type' },
  { field: 'condenserCoolingType', heading: 'Condenser Cooling Type' },
  { field: 'motorDriveType', heading: 'Motor Drive Type' },
  { field: 'compressorConfigType', heading: 'Compressor Config Type' },
  { field: 'ariCapacity', heading: 'Chiller Capacity @ ARI' },
  { field: 'ariEfficiency', heading: 'Full Load Efficiency @ ARI' },
  { field: 'maxCapacityRatio', heading: 'Design/Max Capacity Ratio' },
  { field: 'operatingHours', heading: 'Annual Operating Hours' },
  { field: 'waterFlowRate', heading: 'Chilled Water Flow Rate' },
  { field: 'waterDeltaT', heading: 'Chilled Water ΔT' },
  { field: 'baselineWaterSupplyTemp', heading: 'Chilled Water Supply Temperature' },
  { field: 'modWaterSupplyTemp', heading: 'Chilled Water Supply Temperature' },
  { field: 'baselineWaterEnteringTemp', heading: 'Entering Condenser Water Temperature' },
  { field: 'modWaterEnteringTemp', heading: 'Entering Condenser Water Temperature' },
  { field: 'electricityCost', heading: 'Electricity Cost' },
];

describe('ChillerPerformanceHelpComponent', () => {
  let component: ChillerPerformanceHelpComponent;
  let fixture: ComponentFixture<ChillerPerformanceHelpComponent>;
  let currentField: BehaviorSubject<string>;

  function getFieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2'));
  }

  function getHeadingText(section: HTMLElement): string {
    return section.querySelector('h6').firstChild.textContent.trim();
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>(undefined);
    const chillerPerformanceService: Partial<ChillerPerformanceService> = { currentField: currentField };

    await TestBed.configureTestingModule({
      declarations: [ChillerPerformanceHelpComponent],
      providers: [{ provide: ChillerPerformanceService, useValue: chillerPerformanceService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChillerPerformanceHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('always shows the general help heading', () => {
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Chiller Performance and Temperature Reset Help');
    });

    it('shows no field help when no field is focused', () => {
      expect(getFieldSections().length).toBe(0);
    });
  });

  describe('field help visibility', () => {
    HELP_CASES.forEach(({ field, heading }) => {
      it(`shows only the ${heading} help when ${field} is focused`, () => {
        currentField.next(field);
        fixture.detectChanges();
        const sections = getFieldSections();
        expect(sections.length).toBe(1);
        expect(getHeadingText(sections[0])).toBe(heading);
      });
    });

    it('shows no field help for an unknown field', () => {
      currentField.next('unknownField');
      fixture.detectChanges();
      expect(getFieldSections().length).toBe(0);
    });

    it('switches help when the focused field changes', () => {
      currentField.next('chillerType');
      fixture.detectChanges();
      currentField.next('electricityCost');
      fixture.detectChanges();
      const sections = getFieldSections();
      expect(sections.length).toBe(1);
      expect(getHeadingText(sections[0])).toBe('Electricity Cost');
    });
  });

  describe('destroy', () => {
    it('stops following the focused field after destroy', () => {
      currentField.next('chillerType');
      fixture.detectChanges();
      fixture.destroy();
      currentField.next('electricityCost');
      expect(component.currentField).toBe('chillerType');
    });
  });
});
