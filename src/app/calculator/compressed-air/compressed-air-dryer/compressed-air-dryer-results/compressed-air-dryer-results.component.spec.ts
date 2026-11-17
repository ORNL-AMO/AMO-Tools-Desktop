import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CompressedAirDryerResultsComponent } from './compressed-air-dryer-results.component';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

function makeInput(dryerType: DryerType): DryerOperatingCostInput {
  return { dryerType } as DryerOperatingCostInput;
}

function makeOutput(totalCostPerYear: number, overrides: Partial<DryerOperatingCostOutput> = {}): DryerOperatingCostOutput {
  return {
    waterRemoved: 5, waterRemovedVolume: 0.6, totalCostPerYear,
    heaterPower: 0, heatingHoursPerDay: 0, purgeRate: 15, designDDCPercentage: 16.33,
    purgeFlowRate: 150, motorPower: 0, regenerationCycleLength: 4,
    ...overrides,
  };
}

describe('CompressedAirDryerResultsComponent', () => {
  let component: CompressedAirDryerResultsComponent;
  let fixture: ComponentFixture<CompressedAirDryerResultsComponent>;

  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;

  function setInputs(inputs: Partial<Record<keyof CompressedAirDryerResultsComponent, unknown>>): void {
    Object.entries({ settings: imperial, ...inputs }).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  }

  function rowLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('td.group-label') as NodeListOf<HTMLElement>)
      .map(cell => cell.textContent.trim());
  }

  function rowCells(label: string): Array<string> {
    const row = Array.from(fixture.nativeElement.querySelectorAll('tr') as NodeListOf<HTMLElement>)
      .find(tr => tr.querySelector('td.group-label')?.textContent.trim() === label);
    return Array.from(row.querySelectorAll('td.text-center')).map(cell => cell.textContent.trim());
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompressedAirDryerResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CompressedAirDryerResultsComponent);
    component = fixture.componentInstance;
  });

  describe('template visibility', () => {
    it('renders nothing until there is a baseline result', () => {
      setInputs({ baselineInput: makeInput(DryerType.Heatless) });

      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('shows only the rows that apply to the baseline dryer type', () => {
      setInputs({ baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000) });

      const labels = rowLabels();
      expect(labels).toContain('Purge Flow');
      expect(labels).toContain('Design DDC');
      expect(labels).not.toContain('Heater Load');
      expect(labels).not.toContain('Motor Power');
    });

    it('shows a row that applies only to the modification, with a dash for the baseline', () => {
      setInputs({
        baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000),
        modificationInput: makeInput(DryerType.Refrigerated), modificationOutput: makeOutput(400, { motorPower: 5 }),
        modificationExists: true,
      });

      expect(rowCells('Motor Power')).toEqual(['—', '5.00 hp']);
      expect(rowCells('Purge Flow')).toEqual(['150.00 SCFM', '—']);
    });

    it('does not show modification-only rows when the modification was removed', () => {
      setInputs({
        baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000),
        modificationInput: makeInput(DryerType.Refrigerated), modificationExists: false,
      });

      expect(rowLabels()).not.toContain('Motor Power');
    });

    it('shows dashes for the modification cost and savings without a modification', () => {
      setInputs({ baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000) });

      expect(rowCells('Total Annual Cost')).toEqual(['$1,000.00', '—']);
      expect(rowCells('Annual Cost Savings')).toEqual(['—']);
    });

    it('shows metric units for metric settings', () => {
      setInputs({
        baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000),
        settings: { unitsOfMeasure: 'Metric' } as Settings,
      });

      expect(rowCells('Water Removed')).toEqual(['5.00 kg/hr', '—']);
      expect(rowCells('Purge Flow')).toEqual(['150.00 m3/min', '—']);
    });
  });

  describe('output rendering', () => {
    it('shows the annual cost savings between baseline and modification', () => {
      setInputs({
        baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000),
        modificationInput: makeInput(DryerType.Refrigerated), modificationOutput: makeOutput(400),
        modificationExists: true,
      });

      expect(component.annualCostSavings).toBe(600);
      expect(rowCells('Total Annual Cost')).toEqual(['$1,000.00', '$400.00']);
      expect(rowCells('Annual Cost Savings')).toEqual(['$600.00']);
    });

    it('updates the rendered results when new outputs arrive', () => {
      setInputs({
        baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000),
        modificationInput: makeInput(DryerType.Refrigerated), modificationOutput: makeOutput(400),
        modificationExists: true,
      });

      setInputs({ baselineOutput: makeOutput(2000), modificationOutput: makeOutput(500) });

      expect(rowCells('Total Annual Cost')).toEqual(['$2,000.00', '$500.00']);
      expect(rowCells('Annual Cost Savings')).toEqual(['$1,500.00']);
    });

    it('reports no savings without a modification result', () => {
      setInputs({ baselineInput: makeInput(DryerType.Heatless), baselineOutput: makeOutput(1000), modificationExists: true });

      expect(component.annualCostSavings).toBe(0);
    });
  });
});
