import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LightingReplacementResultsComponent } from './lighting-replacement-results.component';
import { LightingReplacementData, LightingReplacementResults } from '../../../../shared/models/lighting';

function makeFixtureData(name: string, electricityUse: number): LightingReplacementData {
  return {
    name: name,
    hoursPerYear: 8760,
    electricityUse: electricityUse,
    totalLighting: 1000,
  };
}

function makeResults(): LightingReplacementResults {
  return {
    baselineResults: { totalElectricityUse: 3000, totalLighting: 2000, totalOperatingHours: 17520, totalOperatingCosts: 300 },
    modificationResults: { totalElectricityUse: 1000, totalLighting: 1500, totalOperatingHours: 8760, totalOperatingCosts: 100 },
    totalEnergySavings: 2000,
    totalCostSavings: 200,
  };
}

describe('LightingReplacementResultsComponent', () => {
  let component: LightingReplacementResultsComponent;
  let fixture: ComponentFixture<LightingReplacementResultsComponent>;
  let baselineData: Array<LightingReplacementData>;
  let modificationData: Array<LightingReplacementData>;

  function getTables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  // Data rows only: the first row of each summary table is the column header.
  function getFixtureNames(table: HTMLTableElement): Array<string> {
    return Array.from(table.querySelectorAll('tr'))
      .slice(1)
      .map(row => row.querySelector('td').textContent.trim());
  }

  function getGroupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function render(modificationExists: boolean): void {
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    baselineData = [makeFixtureData('Baseline Fixture A', 2000), makeFixtureData('Baseline Fixture B', 1000)];
    modificationData = [makeFixtureData('Modified Fixture A', 1000)];

    await TestBed.configureTestingModule({
      declarations: [LightingReplacementResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LightingReplacementResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lightingReplacementResults', makeResults());
    // The @Input is typed as a single LightingReplacementData, but the parent passes (and the template iterates) an array.
    fixture.componentRef.setInput('baselineData', baselineData as any);
    fixture.componentRef.setInput('modificationData', modificationData as any);
  });

  describe('initialization', () => {
    it('creates the component', () => {
      render(false);
      expect(component).toBeTruthy();
    });
  });

  describe('output rendering', () => {
    it('renders the baseline and modification totals from the results input', () => {
      render(false);
      const totalsRows = Array.from(getTables()[1].querySelectorAll('tr'))
        .slice(1)
        .map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim()));
      expect(totalsRows).toEqual([
        ['Baseline', '17,520', '3,000', '2,000', '$300'],
        ['Modification', '8,760', '1,000', '1,500', '$100'],
      ]);
    });

    it('renders updated totals when the results input changes', () => {
      render(false);
      fixture.componentRef.setInput('lightingReplacementResults', { ...makeResults(), totalEnergySavings: 4321 });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('4,321 kWh/yr');
    });
  });

  describe('template visibility', () => {
    it('renders one baseline summary row per baseline fixture', () => {
      render(false);
      expect(getFixtureNames(getTables()[0])).toEqual(['Baseline Fixture A', 'Baseline Fixture B']);
    });

    it('renders no baseline summary rows when there is no baseline data', () => {
      fixture.componentRef.setInput('baselineData', [] as any);
      render(false);
      expect(getFixtureNames(getTables()[0])).toEqual([]);
    });

    it('hides the modification summary when no modification exists', () => {
      render(false);
      expect(getGroupLabels()).not.toContain('Modification Summary');
      expect(getTables().length).toBe(3);
    });

    it('shows the modification summary when a modification exists', () => {
      render(true);
      expect(getGroupLabels()).toEqual(['Baseline Summary', 'Modification Summary', 'Totals']);
      expect(getTables().length).toBe(4);
    });

    it('renders one modification summary row per modification fixture', () => {
      render(true);
      expect(getFixtureNames(getTables()[1])).toEqual(['Modified Fixture A']);
    });

    it('renders no modification summary rows when there is no modification data', () => {
      fixture.componentRef.setInput('modificationData', [] as any);
      render(true);
      expect(getFixtureNames(getTables()[1])).toEqual([]);
    });
  });

  describe('updateTable0String', () => {
    it('combines the text of all four tables when a modification exists', () => {
      render(true);
      component.updateTable0String();
      expect(component.table0String).toContain('Baseline Fixture A');
      expect(component.table0String).toContain('Modified Fixture A');
      expect(component.table0String).toContain('Electricity Savings');
    });
  });
});
