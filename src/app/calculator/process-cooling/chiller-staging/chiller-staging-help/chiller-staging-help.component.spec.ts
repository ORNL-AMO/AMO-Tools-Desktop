import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChillerStagingHelpComponent } from './chiller-staging-help.component';
import { ChillerStagingService } from '../chiller-staging.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

const HELP_SECTIONS: Array<{ field: string, title: string }> = [
  { field: 'chillerType', title: 'Chiller Type' },
  { field: 'condenserCoolingType', title: 'Condenser Cooling Type' },
  { field: 'motorDriveType', title: 'Motor Drive Type' },
  { field: 'compressorConfigType', title: 'Compressor Config Type' },
  { field: 'ariCapacity', title: 'Chiller Capacity @ ARI' },
  { field: 'ariEfficiency', title: 'Full Load Efficiency @ ARI' },
  { field: 'maxCapacityRatio', title: 'Design/Max Capacity Ratio' },
  { field: 'waterSupplyTemp', title: 'Chilled Water Supply Temperature' },
  { field: 'waterEnteringTemp', title: 'Entering Condenser Water Temperature' },
  { field: 'operatingHours', title: 'Annual Operating Hours' },
  { field: 'chillerLoad', title: 'Load Assigned to Chiller' },
  { field: 'electricityCost', title: 'Electricity Cost' },
];

describe('ChillerStagingHelpComponent', () => {
  let component: ChillerStagingHelpComponent;
  let fixture: ComponentFixture<ChillerStagingHelpComponent>;
  let currentField: BehaviorSubject<string>;

  function shownSectionTitles(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 h6'))
      .map((h6: HTMLElement) => h6.firstChild.textContent.trim());
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>(undefined);
    const chillerStagingService: Partial<ChillerStagingService> = { currentField };

    await TestBed.configureTestingModule({
      declarations: [ChillerStagingHelpComponent],
      providers: [{ provide: ChillerStagingService, useValue: chillerStagingService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChillerStagingHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create with the header and no field section when no field is focused', () => {
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Chiller Staging Help');
      expect(shownSectionTitles()).toEqual([]);
    });
  });

  describe('currentField observer', () => {
    it('should assign the focused field from the service', () => {
      currentField.next('ariCapacity');
      expect(component.currentField).toBe('ariCapacity');
    });
  });

  describe('template visibility', () => {
    HELP_SECTIONS.forEach(section => {
      it(`should show only the "${section.title}" section when ${section.field} is focused`, () => {
        currentField.next(section.field);
        fixture.detectChanges();
        expect(shownSectionTitles()).toEqual([section.title]);
      });
    });

    it('should show no section for an unknown field', () => {
      currentField.next('notAField');
      fixture.detectChanges();
      expect(shownSectionTitles()).toEqual([]);
    });

    it('should switch sections when the focused field changes', () => {
      currentField.next('chillerType');
      fixture.detectChanges();
      currentField.next('electricityCost');
      fixture.detectChanges();
      expect(shownSectionTitles()).toEqual(['Electricity Cost']);
    });
  });

  describe('destroy', () => {
    it('should stop following the focused field after destroy', () => {
      currentField.next('chillerType');
      fixture.destroy();
      currentField.next('electricityCost');
      expect(component.currentField).toBe('chillerType');
    });
  });
});
