import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { SigFigsPipe } from '../../../shared/shared-pipes/sig-figs.pipe';
import { EnergySummaryComponent } from './energy-summary.component';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary-results.service';

function buildUI(overrides: Partial<EnergySummaryUI> = {}): EnergySummaryUI {
  return {
    sources: [
      { name: 'Natural Gas', energyUsed: 12.5, energyUsedUnit: 'MMBtu/hr', heatingValue: 1000, heatingValueUnit: 'Btu/lb', costPerUnit: 5, costUnit: '/MMBtu' },
      { name: 'Steam', costPerUnit: 4, costUnit: '/MMBtu' },
    ],
    comparison: [{ label: 'Energy Used', unit: 'MMBtu/hr', calculated: 12.5, metered: 9 }],
    energyPerTimeUnit: 'MMBtu/kWh',
    ...overrides,
  };
}

describe('EnergySummaryComponent', () => {
  let fixture: ComponentFixture<EnergySummaryComponent>;
  let ui: WritableSignal<EnergySummaryUI | undefined>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    ui = signal<EnergySummaryUI | undefined>(buildUI());
    TestBed.configureTestingModule({
      declarations: [EnergySummaryComponent, SigFigsPipe],
      imports: [CurrencyPipe],
      providers: [{ provide: EnergySummaryResultsService, useValue: { energySummaryUI: ui } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(EnergySummaryComponent);
    fixture.detectChanges();
  });

  it('renders each energy source with its values and cost', () => {
    expect(text()).toContain('Natural Gas');
    expect(text()).toContain('12.500 MMBtu/hr');
    expect(text()).toContain('$5.00 /MMBtu');
  });

  it('renders a placeholder for sources without energy used', () => {
    const steamRow = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).find(row => row.textContent.includes('Steam'));
    expect(steamRow.textContent).toContain('— —');
  });

  it('renders the calculated vs metered comparison with placeholders for missing designed values', () => {
    const comparisonRow = fixture.nativeElement.querySelectorAll('table')[1].querySelectorAll('tbody tr')[0];
    const cells = Array.from<HTMLElement>(comparisonRow.querySelectorAll('td')).map(cell => cell.textContent.replace(/\s+/g, ' ').trim());
    expect(cells).toEqual(['Energy Used', '12.500 MMBtu/hr', '9.0000 MMBtu/hr', '— —']);
  });

  it('renders equipment notes and operating conditions only when present', () => {
    expect(text()).not.toContain('Equipment Notes');
    ui.set(buildUI({ equipmentNotes: 'Batch furnace', operatingConditions: 'Two shifts' }));
    fixture.detectChanges();
    expect(text()).toContain('Equipment Notes');
    expect(text()).toContain('Batch furnace');
    expect(text()).toContain('Two shifts');
  });

  it('renders nothing when the summary is unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('copies table text for export', () => {
    fixture.componentInstance.updateSourcesTableString();
    fixture.componentInstance.updateComparisonTableString();
    expect(fixture.componentInstance.sourcesTableString).toContain('Energy Name');
    expect(fixture.componentInstance.comparisonTableString).toContain('Calculated By PHA');
  });
});
