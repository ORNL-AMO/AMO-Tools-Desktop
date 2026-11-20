import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CondensingEconomizerResultsComponent } from './condensing-economizer-results.component';
import { CondensingEconomizerService } from '../condensing-economizer.service';
import { Settings } from '../../../../shared/models/settings';
import { CondensingEconomizerOutput } from '../../../../shared/models/steam/condensingEconomizer';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
const DASHES = '— —';

function makeOutput(overrides: Partial<CondensingEconomizerOutput> = {}): CondensingEconomizerOutput {
  return {
    excessAir: 15.25,
    flowFlueGas: 52000,
    specHeat: 0.256,
    fracCondensed: 0.45,
    effThermal: 82.4,
    effThermalLH: 90,
    effLH: 5,
    heatRecovery: 2.5,
    sensibleHeatRecovery: 1.234,
    heatRecoveryAnnual: 20000,
    sensibleHeatRecoveryAnnual: 9872,
    annualHeatRecovery: 29872,
    costSavings: 149360,
    totalHeatRecovery: 3.734,
    ...overrides,
  } as CondensingEconomizerOutput;
}

const ALL_EMPTY: Partial<CondensingEconomizerOutput> = {
  excessAir: 0, effThermal: 0, specHeat: 0, flowFlueGas: 0, fracCondensed: 0, sensibleHeatRecovery: 0,
  heatRecovery: 0, totalHeatRecovery: 0, sensibleHeatRecoveryAnnual: 0, heatRecoveryAnnual: 0,
  annualHeatRecovery: 0, costSavings: 0,
} as Partial<CondensingEconomizerOutput>;

describe('CondensingEconomizerResultsComponent', () => {
  let component: CondensingEconomizerResultsComponent;
  let fixture: ComponentFixture<CondensingEconomizerResultsComponent>;
  let serviceStub: Partial<CondensingEconomizerService>;

  function tables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function rows(table: HTMLTableElement): Array<Array<string>> {
    return Array.from(table.querySelectorAll('tr')).map((tr: HTMLElement) =>
      Array.from(tr.querySelectorAll('td')).map((td: HTMLElement) => td.textContent.replace(/\s+/g, ' ').trim()));
  }

  function createComponent(settings: Settings, output: CondensingEconomizerOutput): void {
    serviceStub.condensingEconomizerOutput.next(output);
    fixture = TestBed.createComponent(CondensingEconomizerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { condensingEconomizerOutput: new BehaviorSubject<CondensingEconomizerOutput>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [CondensingEconomizerResultsComponent],
      providers: [{ provide: CondensingEconomizerService, useValue: serviceStub }],
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
        ['Excess Air', '15.3 %'],
        ['Current Available Heat', '82.4 %'],
        ['Specific Heat of Flue Gas', '0.26 Btu/(lb-℉)'],
        ['Flue Gas Flow Rate', '52,000 lb/hr'],
        ['Fraction Condensed', '0.45 %'],
        ['Sensible Heat Recovery', '1.23 MMBtu/hr'],
        ['Latent Heat Recovery', '2.5 MMBtu/hr'],
        ['Total Heat Recovery', '3.73 MMBtu/hr'],
      ]);
      expect(rows(tables()[1])).toEqual([
        ['Sensible Heat Recovery', '9,872 MMBtu'],
        ['Latent Heat Recovery', '20,000 MMBtu'],
        ['Annual Heat Recovery', '29,872 MMBtu'],
        ['Cost Savings', '$149,360'],
      ]);
    });

    it('renders metric results', () => {
      createComponent(METRIC, makeOutput());
      expect(rows(tables()[0])).toEqual([
        ['Excess Air', '15.3 %'],
        ['Current Available Heat', '82.4 %'],
        ['Specific Heat of Flue Gas', '0.26 kJ/(kg-℃)'],
        ['Flue Gas Flow Rate', '52,000 kg/hr'],
        ['Fraction Condensed', '0.45 %'],
        ['Sensible Heat Recovery', '1.23 MJ/hr'],
        ['Latent Heat Recovery', '2.5 MJ/hr'],
        ['Total Heat Recovery', '3.73 MJ/hr'],
      ]);
      expect(rows(tables()[1])).toEqual([
        ['Sensible Heat Recovery', '9,872 MJ'],
        ['Latent Heat Recovery', '20,000 MJ'],
        ['Annual Heat Recovery', '29,872 GJ'],
        ['Cost Savings', '$149,360'],
      ]);
    });

    it('renders values without units for an unknown unit system', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings, makeOutput());
      expect(rows(tables()[0])[2]).toEqual(['Specific Heat of Flue Gas', '0.26']);
      expect(rows(tables()[1])[0]).toEqual(['Sensible Heat Recovery', '9,872']);
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
      serviceStub.condensingEconomizerOutput.next(makeOutput({ costSavings: 999 }));
      fixture.detectChanges();
      expect(rows(tables()[1])[3]).toEqual(['Cost Savings', '$999']);
    });
  });

  describe('destroy', () => {
    it('stops tracking the output after destroy', () => {
      createComponent(IMPERIAL, makeOutput());
      fixture.destroy();
      serviceStub.condensingEconomizerOutput.next(makeOutput({ costSavings: 999 }));
      expect(component.output.costSavings).toBe(149360);
    });
  });
});
