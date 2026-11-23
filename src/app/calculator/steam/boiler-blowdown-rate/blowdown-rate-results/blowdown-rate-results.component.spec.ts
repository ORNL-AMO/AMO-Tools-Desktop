import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BlowdownRateResultsComponent } from './blowdown-rate-results.component';
import { BoilerBlowdownRateInputs, BoilerBlowdownRateResults, BoilerBlowdownRateService } from '../boiler-blowdown-rate.service';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return (value ?? '') + (suffix || '');
  }
}

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', steamMassFlowMeasurement: 'klb', steamTemperatureMeasurement: 'F' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric', steamMassFlowMeasurement: 'tonne', steamTemperatureMeasurement: 'C' } as Settings;

function makeInputs(overrides: Partial<BoilerBlowdownRateInputs> = {}): BoilerBlowdownRateInputs {
  return {
    steamFlow: 100, steamTemperature: 500, feedwaterConductivity: 400, blowdownConductivity: 4000,
    makeupWaterTemperature: 50, fuelCost: 5, waterCost: 0.003, operatingHours: 8000, boilerEfficiency: 80,
    boilerUtilityType: 'Natural Gas', ...overrides
  };
}

function makeResults(scale: number): BoilerBlowdownRateResults {
  return {
    blowdownRate: 10 * scale, boilerFuelCost: 1000 * scale, makeupWaterCost: 200 * scale, totalCost: 1200 * scale,
    blowdownFlowRate: 5 * scale, feedwaterFlowRate: 50 * scale, boilerFuelUse: 300 * scale, makeupWaterUse: 40 * scale
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('BlowdownRateResultsComponent', () => {
  let component: BlowdownRateResultsComponent;
  let fixture: ComponentFixture<BlowdownRateResultsComponent>;
  let service: BoilerBlowdownRateService;

  function rows(): Array<Array<string>> {
    return Array.from(fixture.nativeElement.querySelectorAll('table tbody tr'))
      .map((row: HTMLElement) => Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent)));
  }

  function rowLabels(): Array<string> {
    return rows().map(row => row[0]);
  }

  function createComponent(options: { settings?: Settings, inTreasureHunt?: boolean, showBoiler?: boolean, showOperations?: boolean, modification?: boolean } = {}): void {
    service.baselineInputs.next(makeInputs());
    service.modificationInputs.next(options.modification ? makeInputs({ blowdownConductivity: 3000 }) : undefined);
    service.showBoiler.next(options.showBoiler ?? false);
    service.showOperations.next(options.showOperations ?? false);
    fixture = TestBed.createComponent(BlowdownRateResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', options.settings ?? IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('inTreasureHunt', options.inTreasureHunt ?? false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlowdownRateResultsComponent, SettingsLabelStubPipe],
      providers: [
        BoilerBlowdownRateService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: jasmine.createSpyObj('SteamService', ['saturatedProperties', 'steamProperties']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    service = TestBed.inject(BoilerBlowdownRateService);
    spyOn(service, 'calculateResults').and.callFake((inputs: BoilerBlowdownRateInputs) => makeResults(inputs.blowdownConductivity === 3000 ? 0.5 : 1));
  });

  describe('calculation', () => {
    it('calculates baseline results with the boiler/operations flags', () => {
      createComponent({ showBoiler: true, showOperations: true });
      expect(service.calculateResults).toHaveBeenCalledWith(makeInputs(), IMPERIAL_SETTINGS, true, true);
      expect(component.baselineResults).toEqual(makeResults(1));
    });

    it('calculates modification results when a modification exists', () => {
      createComponent({ modification: true });
      expect(component.modificationExists).toBe(true);
      expect(component.modificationResults).toEqual(makeResults(0.5));
    });

    it('returns empty results when the conductivity form is invalid', () => {
      createComponent();
      service.baselineInputs.next(makeInputs({ feedwaterConductivity: -1 }));
      expect(component.baselineResults).toEqual(component.getEmptyResults());
    });

    it('recalculates when the baseline changes', () => {
      createComponent({ showBoiler: true });
      service.baselineInputs.next(makeInputs({ steamFlow: 20 }));
      expect(service.calculateResults).toHaveBeenCalledWith(makeInputs({ steamFlow: 20 }), IMPERIAL_SETTINGS, true, false);
    });

    it('forces boiler and operations on in treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(component.showBoiler).toBe(true);
      expect(component.showOperations).toBe(true);
    });
  });

  describe('table visibility', () => {
    it('hides the table when there are no baseline results', () => {
      createComponent();
      component.baselineResults = undefined;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('renders only the blowdown rate row when boiler and operations are hidden', () => {
      createComponent();
      expect(rowLabels()).toEqual([' ', 'Blowdown Rate (%)'].map(normalize));
      expect(rows()[1]).toEqual(['Blowdown Rate (%)', '10 %']);
    });

    it('renders the boiler rows when the boiler is shown', () => {
      createComponent({ showBoiler: true });
      expect(rowLabels()).toEqual(['', 'Blowdown Rate (%)', 'Blowdown Rate (klb/hr)', 'Feedwater Rate (klb/hr)']);
    });

    it('renders the operations rows without savings when there is no modification', () => {
      createComponent({ showBoiler: true, showOperations: true });
      expect(rowLabels()).toEqual(['', 'Blowdown Rate (%)', 'Blowdown Rate (klb/hr)', 'Feedwater Rate (klb/hr)',
        'Fuel Use', 'Makeup Water Use', 'Fuel Cost', 'Makeup Water Cost', 'Total Cost']);
    });

    it('renders only the operations rows when the boiler is hidden', () => {
      createComponent({ showBoiler: false, showOperations: true });
      expect(rowLabels()).toEqual(['', 'Blowdown Rate (%)', 'Fuel Use', 'Makeup Water Use', 'Fuel Cost', 'Makeup Water Cost', 'Total Cost']);
    });
  });

  describe('modification column', () => {
    it('renders only the baseline column without a modification', () => {
      createComponent({ showBoiler: true, showOperations: true });
      expect(rows()[0]).toEqual(['', 'Baseline']);
      expect(rows()[4]).toEqual(['Fuel Use', '300 MMBtu']);
    });

    it('renders the modification column and savings rows with a modification', () => {
      createComponent({ showBoiler: true, showOperations: true, modification: true });
      expect(rows()[0]).toEqual(['', 'Baseline', 'Modification']);
      expect(rows()[1]).toEqual(['Blowdown Rate (%)', '10 %', '5 %']);
      expect(rows()[2]).toEqual(['Blowdown Rate (klb/hr)', '5', '2.5']);
      expect(rows()[4]).toEqual(['Fuel Use', '300 MMBtu', '150 MMBtu']);
      expect(rows()[5]).toEqual(['Makeup Water Use', '40 kgal', '20 kgal']);
      expect(rows()[8]).toEqual(['Total Cost', '$1,200', '$600']);
      expect(rows().slice(9)).toEqual([
        ['Fuel Savings', '$500'],
        ['Makeup Water Savings', '$100'],
        ['Total Savings', '$600'],
      ]);
    });

    it('hides savings rows when operations are hidden even with a modification', () => {
      createComponent({ modification: true });
      expect(rowLabels()).toEqual(['', 'Blowdown Rate (%)']);
      expect(rows()[1]).toEqual(['Blowdown Rate (%)', '10 %', '5 %']);
    });
  });

  describe('unit labels', () => {
    it('renders metric fuel and water units', () => {
      createComponent({ settings: METRIC_SETTINGS, showOperations: true, modification: true });
      const fuelRow = rows().find(r => r[0] === 'Fuel Use');
      const waterRow = rows().find(r => r[0] === 'Makeup Water Use');
      expect(fuelRow).toEqual(['Fuel Use', '300 GJ', '150 GJ']);
      expect(waterRow).toEqual(['Makeup Water Use', '40 m3', '20 m3']);
    });

    it('renders no fuel unit for an unknown unit system', () => {
      createComponent({ settings: { ...IMPERIAL_SETTINGS, unitsOfMeasure: 'Other' } as Settings, showOperations: true });
      expect(rows().find(r => r[0] === 'Fuel Use')).toEqual(['Fuel Use', '300']);
    });
  });

  describe('destroy', () => {
    it('stops recalculating after destroy', () => {
      createComponent();
      fixture.destroy();
      (service.calculateResults as jasmine.Spy).calls.reset();
      service.baselineInputs.next(makeInputs({ steamFlow: 1 }));
      service.showBoiler.next(true);
      expect(service.calculateResults).not.toHaveBeenCalled();
    });
  });

  describe('copy table', () => {
    it('captures the table text', () => {
      createComponent();
      component.updateTableString();
      expect(component.tableString).toContain('Baseline');
    });
  });
});
