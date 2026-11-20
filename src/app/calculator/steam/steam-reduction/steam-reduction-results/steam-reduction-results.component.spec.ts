import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SteamReductionResultsComponent } from './steam-reduction-results.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { SteamReductionResults } from '../../../../shared/models/standalone';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeResults(withModification: boolean = true, baselineEnergyUse: number = 5000, modificationEnergyUse: number = 4000): SteamReductionResults {
  return {
    baselineResults: { steamUse: 1200, energyUse: baselineEnergyUse, energyCost: 30000 },
    modificationResults: withModification ? { steamUse: 900, energyUse: modificationEnergyUse, energyCost: 21000 } : undefined,
    annualSteamSavings: 300,
    annualEnergySavings: 1000,
    annualCostSavings: 9000
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('SteamReductionResultsComponent', () => {
  let component: SteamReductionResultsComponent;
  let fixture: ComponentFixture<SteamReductionResultsComponent>;

  function render(settings: Settings, results: SteamReductionResults, modificationExists: boolean = true): void {
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  function getRowCells(label: string): Array<string> {
    const rows: Array<HTMLTableRowElement> = Array.from(fixture.nativeElement.querySelectorAll('table tr'));
    const row = rows.find(tr => normalize(tr.cells[0].textContent) === label);
    return Array.from(row.cells).slice(1).map(cell => normalize(cell.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SteamReductionResultsComponent],
      providers: [ConvertUnitsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SteamReductionResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component with the default energy unit', () => {
      render(IMPERIAL_SETTINGS, makeResults());
      expect(component).toBeTruthy();
      expect(component.energyResultUnit).toBe('MMBtu');
    });
  });

  describe('result rendering', () => {
    it('renders imperial units for baseline and modification', () => {
      render(IMPERIAL_SETTINGS, makeResults());
      expect(getRowCells('Steam Use')).toEqual(['1,200 klb/yr', '900 klb/yr']);
      expect(getRowCells('Energy Use')).toEqual(['5,000 MMBtu/yr', '4,000 MMBtu/yr']);
      expect(getRowCells('Energy Cost')).toEqual(['$30,000/yr', '$21,000/yr']);
      expect(getRowCells('Steam Savings')).toEqual(['300 klb/yr']);
      expect(getRowCells('Energy Savings')).toEqual(['1,000 MMBtu/yr']);
      expect(getRowCells('Cost Savings')).toEqual(['$9,000/yr']);
    });

    it('renders metric units for baseline and modification', () => {
      render(METRIC_SETTINGS, makeResults());
      expect(component.energyResultUnit).toBe('GJ');
      expect(getRowCells('Steam Use')).toEqual(['1,200 tonnes/yr', '900 tonnes/yr']);
      expect(getRowCells('Energy Use')).toEqual(['5,000 GJ/yr', '4,000 GJ/yr']);
      expect(getRowCells('Steam Savings')).toEqual(['300 tonnes/yr']);
      expect(getRowCells('Energy Savings')).toEqual(['1,000 GJ/yr']);
    });

    it('renders no unit text when units of measure are neither imperial nor metric', () => {
      render({ unitsOfMeasure: 'Other' } as Settings, makeResults());
      expect(getRowCells('Steam Use')).toEqual(['1,200', '900']);
      expect(getRowCells('Energy Use')).toEqual(['5,000', '4,000']);
    });

    it('renders dashes in the modification and savings cells when there are no modification results', () => {
      render(IMPERIAL_SETTINGS, makeResults(false), false);
      expect(getRowCells('Steam Use')).toEqual(['1,200 klb/yr', '—']);
      expect(getRowCells('Energy Use')).toEqual(['5,000 MMBtu/yr', '—']);
      expect(getRowCells('Energy Cost')).toEqual(['$30,000/yr', '—']);
      expect(getRowCells('Steam Savings')).toEqual(['—']);
      expect(getRowCells('Energy Savings')).toEqual(['—']);
      expect(getRowCells('Cost Savings')).toEqual(['—']);
    });

    it('updates the rendered values when the results input changes', () => {
      render(IMPERIAL_SETTINGS, makeResults());
      const updated = makeResults();
      updated.baselineResults.steamUse = 2500;
      fixture.componentRef.setInput('results', updated);
      fixture.detectChanges();
      expect(getRowCells('Steam Use')).toEqual(['2,500 klb/yr', '900 klb/yr']);
    });
  });

  describe('metric small energy conversion', () => {
    it('switches to MJ and scales baseline and modification energy use when a modification exists', () => {
      const results = makeResults(true, 0.0005, 0.0004);
      render(METRIC_SETTINGS, results, true);
      expect(component.energyResultUnit).toBe('MJ');
      expect(results.baselineResults.energyUse).toBeCloseTo(0.5, 6);
      expect(results.modificationResults.energyUse).toBeCloseTo(0.4, 6);
      expect(getRowCells('Energy Use')).toEqual(['1 MJ/yr', '0 MJ/yr']);
    });

    it('scales only the baseline energy use when no modification exists', () => {
      const results = makeResults(true, 0.0005, 0.0004);
      render(METRIC_SETTINGS, results, false);
      expect(results.baselineResults.energyUse).toBeCloseTo(0.5, 6);
      expect(results.modificationResults.energyUse).toBeCloseTo(0.0004, 6);
    });

    it('keeps imperial energy use unchanged for small values', () => {
      const results = makeResults(true, 0.0005, 0.0004);
      render(IMPERIAL_SETTINGS, results);
      expect(component.energyResultUnit).toBe('MMBtu');
      expect(results.baselineResults.energyUse).toBe(0.0005);
    });
  });

  describe('user actions', () => {
    it('copies the table text into table0String', () => {
      render(IMPERIAL_SETTINGS, makeResults());
      component.updateTable0String();
      expect(component.table0String).toBe(component.copyTable0.nativeElement.innerText);
      expect(component.table0String).toContain('Steam Use');
    });
  });
});
