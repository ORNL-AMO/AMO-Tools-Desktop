import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { EnergyComparisonRow, EnergySummaryResultsService } from '../../report/energy-summary/energy-summary-results.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { EnergyValidationResultsComponent } from './energy-validation-results.component';

describe('EnergyValidationResultsComponent', () => {
  let fixture: ComponentFixture<EnergyValidationResultsComponent>;
  const comparison = signal<EnergyComparisonRow[]>([]);
  const settings = signal<Partial<Settings>>({ energyResultUnit: 'MMBtu' });

  const cells = (): string[][] =>
    Array.from<HTMLTableRowElement>(fixture.nativeElement.querySelectorAll('tbody tr'))
      .map(row => Array.from(row.cells).map(cell => cell.textContent.trim().replace(/\s+/g, ' ')));

  beforeEach(() => {
    settings.set({ energyResultUnit: 'MMBtu' });
    TestBed.configureTestingModule({
      declarations: [EnergyValidationResultsComponent],
      providers: [
        { provide: EnergySummaryResultsService, useValue: { energyComparison: comparison } },
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: settings } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(EnergyValidationResultsComponent);
  });

  it('shows each row\'s unit beside its label and dashes where a value is missing', () => {
    comparison.set([{ label: 'Energy Used', unit: 'MMBtu/hr', calculated: undefined, metered: 9, designed: 11 }]);
    fixture.detectChanges();

    expect(cells()).toEqual([['Energy Used (MMBtu/hr)', '— —', '9.00', '11.00']]);
  });

  it('rounds to whole numbers for small energy units, like the heat balance results', () => {
    settings.set({ energyResultUnit: 'Btu' });
    comparison.set([{ label: 'Energy Used', unit: 'Btu/hr', calculated: 1234.56, metered: undefined, designed: undefined }]);
    fixture.detectChanges();

    expect(cells()[0][1]).toBe('1,235');
  });
});
