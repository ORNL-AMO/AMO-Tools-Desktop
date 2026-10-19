import { TestBed } from '@angular/core/testing';
import { PlotlyService } from 'angular-plotly.js';
import { CagiLookupService, CagiRow, CompressorPlotData } from './cagi-lookup.service';
import { CagiLookupPlotComponent } from './cagi-lookup-plot/cagi-lookup-plot.component';

/** Column headers as they appear in assets/cagi_output.csv */
const FIELDS: Array<string> = [
  'Manufacturer', 'Model Number', 'Rated Capacity at Full Load Operating Pressure (acfm)', 'Full Load Operating Pressure (psig)',
  'Total Package Input Power at Zero Flow (kW)', 'Total Package Input Power at Rated Capacity and Full Load Operating Pressure (kW)',
  'Max Capacity (acfm)', 'Capacity 4 (acfm)', 'Capacity 3 (acfm)', 'Capacity 2 (acfm)', 'Capacity 1 (acfm)', 'Min Capacity (acfm)',
  'Total Package Input Power at Max Capacity (kW)', 'Total Package Input Power at Capacity 4 (kW)', 'Total Package Input Power at Capacity 3 (kW)',
  'Total Package Input Power at Capacity 2 (kW)', 'Total Package Input Power at Capacity 1 (kW)', 'Total Package Input Power at Min Capacity (kW)'
];

function row(values: Array<string>): CagiRow {
  const result: CagiRow = {};
  FIELDS.forEach((field, index) => result[field] = values[index] ?? '');
  return result;
}

/** Chicago Pneumatic CPVSd 21 15kW, 125 psig (VSD, capacity 1 blank) */
const CPVSD_21: CagiRow = row(['Chicago Pneumatic', 'CPVSd 21 15kW', '90', '125', '0', '19.5', '90', '75', '59', '44', '', '28', '19.5', '16.2', '13', '10', '', '7']);
/** Atlas Copco G110-10, 145 psig (fixed speed) */
const G110_10: CagiRow = row(['Atlas Copco', 'G110-10', '606.4', '145', '31.4', '125.5']);
/** Fixed-speed row with no zero-flow power published */
const NO_ZERO_FLOW: CagiRow = row(['Test', 'NoZero', '100', '125', '', '20']);

describe('CagiLookupService', () => {
  let service: CagiLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CagiLookupService] });
    service = TestBed.inject(CagiLookupService);
    service['resolvePlotKeys'](FIELDS);
  });

  it('returns every ladder rung for a VSD unit, sorted and without the blank rung', () => {
    const data: CompressorPlotData = service.extractPoints(CPVSD_21, 'CPVSd 21 15kW (125 psig)');
    expect(data.isVsd).toBeTrue();
    expect(data.points).toEqual([
      { capacity: 28, power: 7 }, { capacity: 44, power: 10 }, { capacity: 59, power: 13 },
      { capacity: 75, power: 16.2 }, { capacity: 90, power: 19.5 }
    ]);
    expect(data.maxCapacity).toBe(90);
    expect(data.maxPower).toBe(19.5);
  });

  it('returns zero-flow and full-load points for a fixed-speed unit', () => {
    const data: CompressorPlotData = service.extractPoints(G110_10, 'G110-10');
    expect(data.isVsd).toBeFalse();
    expect(data.points).toEqual([{ capacity: 0, power: 31.4 }, { capacity: 606.4, power: 125.5 }]);
  });

  it('returns a single point when zero-flow power is missing', () => {
    expect(service.extractPoints(NO_ZERO_FLOW, 'NoZero').points.length).toBe(1);
  });
});

describe('CagiLookupPlotComponent', () => {
  let component: CagiLookupPlotComponent;
  let newPlot: jasmine.Spy;
  let service: CagiLookupService;

  beforeEach(() => {
    newPlot = jasmine.createSpy('newPlot');
    TestBed.configureTestingModule({
      declarations: [CagiLookupPlotComponent],
      providers: [CagiLookupService, { provide: PlotlyService, useValue: { newPlot: newPlot } }]
    });
    service = TestBed.inject(CagiLookupService);
    service['resolvePlotKeys'](FIELDS);
    const fixture = TestBed.createComponent(CagiLookupPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function tracesFor(scaleMode: string): Array<{ x: Array<number>, y: Array<number> }> {
    component.scaleMode = scaleMode;
    component.data = [service.extractPoints(CPVSD_21, 'CPVSd'), service.extractPoints(G110_10, 'G110'), service.extractPoints(NO_ZERO_FLOW, 'NoZero')];
    component.drawChart();
    return newPlot.calls.mostRecent().args[1];
  }

  it('normalizes each unit to its own full load', () => {
    const traces = tracesFor('each');
    expect(traces.length).toBe(2);
    expect(traces[0].x[0]).toBeCloseTo(31.111, 3);
    expect(traces[0].y[0]).toBeCloseTo(35.897, 3);
    expect(traces[0].x[4]).toBeCloseTo(100, 6);
    expect(traces[1].y[0]).toBeCloseTo(25.020, 3);
  });

  it('scales every unit to the highest-capacity unit', () => {
    const traces = tracesFor('largest');
    expect(traces[0].x[4]).toBeCloseTo(14.842, 3);
    expect(traces[0].y[4]).toBeCloseTo(15.538, 3);
    expect(traces[1].x[1]).toBeCloseTo(100, 6);
    expect(traces[1].y[1]).toBeCloseTo(100, 6);
  });
});
