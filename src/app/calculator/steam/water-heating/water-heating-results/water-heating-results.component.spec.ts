import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WaterHeatingResultsComponent } from './water-heating-results.component';
import { WaterHeatingService } from '../water-heating.service';
import { Settings } from '../../../../shared/models/settings';
import { WaterHeatingOutput } from '../../../../shared/models/steam/waterHeating';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
const DASHES = '— —';

function makeOutput(overrides: Partial<WaterHeatingOutput> = {}): WaterHeatingOutput {
  return {
    enthalpySteamIn: 1160,
    enthalpySteamOut: 180,
    bpTempWaterOut: 300,
    tempWaterOut: 150,
    enthalpyMakeupWater: 23,
    flowByPassSteam: 0,
    heatGainRate: 700,
    energySavedDWH: 4500,
    energySavedBoiler: 3200,
    energySavedTotal: 7700,
    waterSaved: 630000,
    costSavingsTotal: 48000,
    costSavingsBoiler: 19200,
    costSavingsWNT: 2520,
    costSavingsDWH: 27000,
    bpTempWarningFlag: false,
    ...overrides,
  };
}

const ALL_EMPTY: Partial<WaterHeatingOutput> = {
  energySavedDWH: 0, energySavedBoiler: 0, energySavedTotal: 0, waterSaved: 0,
  costSavingsWNT: 0, costSavingsDWH: 0, costSavingsBoiler: 0, costSavingsTotal: 0,
};

describe('WaterHeatingResultsComponent', () => {
  let component: WaterHeatingResultsComponent;
  let fixture: ComponentFixture<WaterHeatingResultsComponent>;
  let serviceStub: Partial<WaterHeatingService>;

  function tables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function rows(table: HTMLTableElement): Array<Array<string>> {
    return Array.from(table.querySelectorAll('tr')).map((tr: HTMLElement) =>
      Array.from(tr.querySelectorAll('td')).map((td: HTMLElement) => td.textContent.replace(/\s+/g, ' ').trim()));
  }

  function createComponent(settings: Settings, output: WaterHeatingOutput): void {
    serviceStub.waterHeatingOutput.next(output);
    fixture = TestBed.createComponent(WaterHeatingResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceStub = { waterHeatingOutput: new BehaviorSubject<WaterHeatingOutput>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [WaterHeatingResultsComponent],
      providers: [{ provide: WaterHeatingService, useValue: serviceStub }],
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
    it('hides the tables but keeps the export components when there is no output', () => {
      createComponent(IMPERIAL, undefined);
      expect(tables().length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('app-exportable-results-table').length).toBe(2);
      const labels = Array.from(fixture.nativeElement.querySelectorAll('label.group-label')).map((l: HTMLElement) => l.textContent.trim());
      expect(labels).toEqual(['Annual Energy Results', 'Annual Cost Results']);
    });

    it('shows both tables when there is output', () => {
      createComponent(IMPERIAL, makeOutput());
      expect(tables().length).toBe(2);
    });

    it('renders imperial results', () => {
      createComponent(IMPERIAL, makeOutput());
      expect(rows(tables()[0])).toEqual([
        ['Energy Savings From Water Heater', '4,500 MMBtu'],
        ['Energy Savings From Boiler', '3,200 MMBtu'],
        ['Baseline Energy', '7,700 MMBtu'],
        ['Energy Savings', '7,700 MMBtu'],
        ['Baseline Water Savings', '630,000 gal'],
        ['Water Savings', '630,000 gal'],
      ]);
      expect(rows(tables()[1])).toEqual([
        ['Cost Savings From Water and Treatment', '$2,520'],
        ['Cost Savings Water Heater Fuel', '$27,000'],
        ['Cost Savings From Boiler', '$19,200'],
        ['Cost Savings Total', '$48,000'],
      ]);
    });

    it('renders metric results', () => {
      createComponent(METRIC, makeOutput());
      expect(rows(tables()[0])).toEqual([
        ['Energy Savings From Water Heater', '4,500 GJ'],
        ['Energy Savings From Boiler', '3,200 GJ'],
        ['Baseline Energy', '7,700 GJ'],
        ['Energy Savings', '7,700 GJ'],
        ['Baseline Water Savings', '630,000 m3'],
        ['Water Savings', '630,000 m3'],
      ]);
    });

    it('renders values without units for an unknown unit system', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings, makeOutput());
      expect(rows(tables()[0])[0]).toEqual(['Energy Savings From Water Heater', '4,500']);
      expect(rows(tables()[0])[4]).toEqual(['Baseline Water Savings', '630,000']);
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
      serviceStub.waterHeatingOutput.next(makeOutput({ costSavingsTotal: 999 }));
      fixture.detectChanges();
      expect(rows(tables()[1])[3]).toEqual(['Cost Savings Total', '$999']);
    });
  });

  describe('destroy', () => {
    it('stops tracking the output after destroy', () => {
      createComponent(IMPERIAL, makeOutput());
      fixture.destroy();
      serviceStub.waterHeatingOutput.next(makeOutput({ costSavingsTotal: 999 }));
      expect(component.output.costSavingsTotal).toBe(48000);
    });
  });
});
