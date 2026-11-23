import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FeedwaterEconomizerResultsComponent } from './feedwater-economizer-results.component';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';
import { Settings } from '../../../../shared/models/settings';
import { FeedwaterEconomizerOutput } from '../../../../shared/models/steam/feedwaterEconomizer';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
const DASHES = '— —';

function makeOutput(overrides: Partial<FeedwaterEconomizerOutput> = {}): FeedwaterEconomizerOutput {
  return {
    effBoiler: 80,
    tempSteamSat: 467,
    enthalpySteam: 1200,
    enthalpyFW: 193,
    flowSteam: 45000,
    flowFW: 46875,
    flowFlueGas: 52000,
    heatCapacityFG: 0.26,
    specHeatFG: 0.25,
    heatCapacityFW: 1,
    specHeatFW: 1,
    ratingHeatRecFW: 3,
    tempFlueGasOut: 380,
    tempFWOut: 290,
    energySavingsBoiler: 25000,
    costSavingsBoiler: 125000,
    energySavedTotal: 25000,
    ...overrides,
  };
}

const ALL_EMPTY: Partial<FeedwaterEconomizerOutput> = {
  flowFlueGas: 0, flowSteam: 0, flowFW: 0, enthalpySteam: 0, enthalpyFW: 0,
  tempFlueGasOut: 0, tempFWOut: 0, energySavingsBoiler: 0, costSavingsBoiler: 0,
};

describe('FeedwaterEconomizerResultsComponent', () => {
  let component: FeedwaterEconomizerResultsComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerResultsComponent>;
  let serviceStub: Partial<FeedwaterEconomizerService>;

  function tables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function rows(table: HTMLTableElement): Array<Array<string>> {
    return Array.from(table.querySelectorAll('tr')).map((tr: HTMLElement) =>
      Array.from(tr.querySelectorAll('td')).map((td: HTMLElement) => td.textContent.replace(/\s+/g, ' ').trim()));
  }

  function createComponent(settings: Settings, output: FeedwaterEconomizerOutput): void {
    serviceStub.feedwaterEconomizerOutput.next(output);
    fixture = TestBed.createComponent(FeedwaterEconomizerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { feedwaterEconomizerOutput: new BehaviorSubject<FeedwaterEconomizerOutput>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [FeedwaterEconomizerResultsComponent],
      providers: [{ provide: FeedwaterEconomizerService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('assigns the output from the service', () => {
      createComponent(IMPERIAL, makeOutput());
      expect(component.output).toEqual(makeOutput());
    });
  });

  describe('template visibility', () => {
    it('hides the tables and export when there is no output', () => {
      createComponent(IMPERIAL, undefined);
      expect(tables().length).toBe(0);
      expect(fixture.nativeElement.querySelector('app-exportable-results-table')).toBeNull();
      const labels = Array.from(fixture.nativeElement.querySelectorAll('label.group-label')).map((l: HTMLElement) => l.textContent.trim());
      expect(labels).toEqual(['Results', 'Annual Results']);
    });

    it('shows both tables and the export when there is output', () => {
      createComponent(IMPERIAL, makeOutput());
      expect(tables().length).toBe(2);
      expect(fixture.nativeElement.querySelectorAll('app-exportable-results-table').length).toBe(1);
    });

    it('renders imperial results', () => {
      createComponent(IMPERIAL, makeOutput());
      expect(rows(tables()[0])).toEqual([
        ['Flow Rate of Flue Gases', '52,000 MMBtu/yr'],
        ['Flow Rate of Steam', '45,000 MMBtu/yr'],
        ['Flow Rate of Feedwater', '46,875 MMBtu/yr'],
        ['Enthalpy of Steam', '1,200 MMBtu/yr'],
        ['Enthalpy of Feedwater', '193 MMBtu/yr'],
        ['Flue Gas Outlet Temperature', '380 ℉'],
        ['Feedwater Outlet Temperature', '290 ℉'],
      ]);
      expect(rows(tables()[1])).toEqual([
        ['Energy Savings', '25,000 MMBtu'],
        ['Cost Savings', '$125,000'],
      ]);
    });

    it('renders metric results', () => {
      createComponent(METRIC, makeOutput());
      expect(rows(tables()[0])).toEqual([
        ['Flow Rate of Flue Gases', '52,000 GJ/yr'],
        ['Flow Rate of Steam', '45,000 GJ/yr'],
        ['Flow Rate of Feedwater', '46,875 GJ/yr'],
        ['Enthalpy of Steam', '1,200 GJ/yr'],
        ['Enthalpy of Feedwater', '193 GJ/yr'],
        ['Flue Gas Outlet Temperature', '380 ℃'],
        ['Feedwater Outlet Temperature', '290 ℃'],
      ]);
      expect(rows(tables()[1])).toEqual([
        ['Energy Savings', '25,000 GJ'],
        ['Cost Savings', '$125,000'],
      ]);
    });

    it('renders values without units for an unknown unit system', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings, makeOutput());
      expect(rows(tables()[0])[0]).toEqual(['Flow Rate of Flue Gases', '52,000']);
      expect(rows(tables()[1])[0]).toEqual(['Energy Savings', '25,000']);
    });

    it('renders dashes for empty results', () => {
      createComponent(IMPERIAL, makeOutput(ALL_EMPTY));
      rows(tables()[0]).concat(rows(tables()[1])).forEach(row => {
        expect(row.length).withContext(row[0]).toBe(2);
        expect(row[1]).withContext(row[0]).toBe(DASHES);
      });
    });

    it('updates when the output changes', () => {
      createComponent(IMPERIAL, makeOutput());
      serviceStub.feedwaterEconomizerOutput.next(makeOutput({ costSavingsBoiler: 999 }));
      fixture.detectChanges();
      expect(rows(tables()[1])[1]).toEqual(['Cost Savings', '$999']);
    });
  });

  describe('destroy', () => {
    it('stops tracking the output after destroy', () => {
      createComponent(IMPERIAL, makeOutput());
      fixture.destroy();
      serviceStub.feedwaterEconomizerOutput.next(makeOutput({ costSavingsBoiler: 999 }));
      expect(component.output.costSavingsBoiler).toBe(125000);
    });
  });
});
