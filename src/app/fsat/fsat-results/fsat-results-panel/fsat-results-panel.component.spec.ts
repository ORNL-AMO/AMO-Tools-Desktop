import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FsatResultsPanelComponent } from './fsat-results-panel.component';
import { FsatService } from '../../fsat.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FSAT, FsatOutput, FsatValid } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

const VALID: FsatValid = {
  isValid: true,
  fluidValid: true,
  fanValid: true,
  motorValid: true,
  fieldDataValid: true,
  fsatOperationsValid: true,
};

const INVALID_ALL: FsatValid = {
  isValid: false,
  fluidValid: false,
  fanValid: false,
  motorValid: false,
  fieldDataValid: false,
  fsatOperationsValid: true,
};

function makeOutputs(overrides: Partial<FsatOutput> = {}): FsatOutput {
  return {
    fanEfficiency: 60,
    motorRatedPower: 100,
    motorShaftPower: 80,
    fanShaftPower: 70,
    motorEfficiency: 90,
    motorPowerFactor: 85,
    motorCurrent: 50,
    motorPower: 75,
    loadFactor: 0.5,
    driveEfficiency: 95,
    annualEnergy: 500,
    annualCost: 4000,
    fanEnergyIndex: 1.2,
    co2EmissionsOutput: 20,
    emissionsSavings: 0,
    ...overrides,
  };
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { fanPowerMeasurement: 'hp', currency: '$', emissionsUnit: 'Imperial', ...overrides } as Settings;
}

function makeFsat(modificationCount: number, whatIfScenario = true): FSAT {
  const modifications = [];
  for (let i = 0; i < modificationCount; i++) {
    modifications.push({ id: `mod-${i}`, fsat: { name: `Mod ${i}`, whatIfScenario } as FSAT });
  }
  return { name: 'Baseline Fan', modifications } as FSAT;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FsatResultsPanelComponent', () => {
  let component: FsatResultsPanelComponent;
  let fixture: ComponentFixture<FsatResultsPanelComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let updateData: BehaviorSubject<boolean>;
  let operationalImpactsFlag: WritableSignal<boolean>;
  let baselineOutputs: FsatOutput;
  let modificationOutputs: FsatOutput;
  let modificationValid: FsatValid;
  let savingsPercentage: number;

  /** Rows of the results table, keyed by the label text of the first cell. */
  function getRow(label: string): HTMLElement {
    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.my-table-item'));
    const row = rows.find(r => normalize(r.children[0].textContent) === label);
    expect(row).withContext(`row "${label}"`).toBeDefined();
    return row;
  }

  function getCellTexts(label: string): string[] {
    return Array.from(getRow(label).children).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function hasRow(label: string): boolean {
    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.my-table-item'));
    return rows.some(r => normalize(r.children[0].textContent) === label);
  }

  function render(fsat: FSAT, inSetup = false, settings: Settings = makeSettings()) {
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('modificationIndex', 0);
    fixture.componentRef.setInput('inSetup', inSetup);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    updateData = new BehaviorSubject<boolean>(false);
    operationalImpactsFlag = signal(false);
    baselineOutputs = makeOutputs();
    modificationOutputs = makeOutputs({ annualEnergy: 400, annualCost: 3000, fanEfficiency: 65 });
    modificationValid = VALID;
    savingsPercentage = 25;

    fsatServiceSpy = jasmine.createSpyObj(
      'FsatService',
      ['checkValid', 'getResults', 'getSavingsPercentage', 'getEmptyResults'],
      { updateData }
    );
    fsatServiceSpy.checkValid.and.callFake((_fsat, isBaseline) => (isBaseline ? VALID : modificationValid));
    fsatServiceSpy.getResults.and.callFake((_fsat, isBaseline) => ({ ...(isBaseline ? baselineOutputs : modificationOutputs) }));
    fsatServiceSpy.getSavingsPercentage.and.callFake(() => savingsPercentage);
    fsatServiceSpy.getEmptyResults.and.callFake(() => makeOutputs({
      fanEfficiency: 0, motorRatedPower: 0, motorShaftPower: 0, fanShaftPower: 0, motorEfficiency: 0,
      motorPowerFactor: 0, motorCurrent: 0, motorPower: 0, loadFactor: 0, driveEfficiency: 0,
      annualEnergy: 0, annualCost: 0, fanEnergyIndex: 0, co2EmissionsOutput: 0,
    }));

    const convertUnitsSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsSpy.getUnit.and.callFake((unit: string) => ({ unit: { name: { display: unit } } }));

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [FsatResultsPanelComponent],
      providers: [
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsSpy },
        {
          provide: FeatureFlagService,
          useValue: jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts: operationalImpactsFlag }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatResultsPanelComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and computes baseline results from the service', () => {
      const fsat = makeFsat(0);
      render(fsat);

      expect(component).toBeTruthy();
      expect(fsatServiceSpy.getResults).toHaveBeenCalledWith(fsat, true, component.settings);
      expect(component.baselineResults.annualEnergy).toBe(500);
    });

    it('takes whatIfScenario from the selected modification', () => {
      render(makeFsat(1, false));
      expect(component.isWhatIfScenario).toBeFalse();
    });
  });

  describe('observers and lifecycle', () => {
    it('recomputes results when the fsat service emits updateData', () => {
      render(makeFsat(0));
      fsatServiceSpy.getResults.calls.reset();

      updateData.next(true);

      expect(fsatServiceSpy.getResults).toHaveBeenCalled();
    });

    it('recomputes results when the modification index changes after first render', () => {
      render(makeFsat(2));
      fsatServiceSpy.getResults.calls.reset();

      fixture.componentRef.setInput('modificationIndex', 1);
      fixture.detectChanges();

      expect(fsatServiceSpy.getResults).toHaveBeenCalled();
      expect(component.modificationName).toBe('Mod 1');
    });

    it('stops recomputing results after the component is destroyed', () => {
      render(makeFsat(0));
      fsatServiceSpy.getResults.calls.reset();

      fixture.destroy();
      updateData.next(true);

      expect(fsatServiceSpy.getResults).not.toHaveBeenCalled();
    });
  });

  describe('template visibility: results table (showResults)', () => {
    it('shows the table by default', () => {
      render(makeFsat(0));
      expect(fixture.nativeElement.querySelector('.my-table')).not.toBeNull();
    });

    it('hides the table while resizing and shows it again after the delay', fakeAsync(() => {
      render(makeFsat(0));

      component.hideResults();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.my-table')).toBeNull();

      tick(100);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.my-table')).not.toBeNull();
    }));
  });

  describe('template visibility: modification column (showModification)', () => {
    it('shows only baseline columns when there are no modifications', () => {
      render(makeFsat(0));

      const header = fixture.nativeElement.querySelector('.my-table-bg');
      expect(header.children.length).toBe(2);
      expect(header.querySelector('.col-4')).toBeNull();
      expect(header.querySelectorAll('.col-6').length).toBe(2);
      expect(getCellTexts('Fan Energy Index').length).toBe(2);
    });

    it('shows only baseline columns when in setup even if modifications exist', () => {
      render(makeFsat(1), true);

      expect(normalize(fixture.nativeElement.querySelector('.my-table-bg').textContent)).toBe('Baseline');
      expect(getCellTexts('Fan Energy Index').length).toBe(2);
    });

    it('shows the modification name and a modification value column when a modification is selected', () => {
      render(makeFsat(1));

      expect(normalize(fixture.nativeElement.querySelector('.my-table-bg').textContent)).toBe('Baseline Mod 0');
      expect(getCellTexts('Fan Energy Index')).toEqual(['Fan Energy Index', '1.2', '1.2']);
    });
  });

  describe('template visibility: percent savings (mobile column)', () => {
    function mobileCell(): HTMLElement {
      return fixture.nativeElement.querySelector('.d-lg-none');
    }

    it('shows the savings percentage when the modification is valid and savings are positive', () => {
      savingsPercentage = 25;
      render(makeFsat(1));

      expect(normalize(mobileCell().textContent)).toBe('25%');
      expect(mobileCell().querySelector('.alert-danger')).toBeNull();
    });

    it('shows 0% when the savings are negative', () => {
      savingsPercentage = -10;
      render(makeFsat(1));

      expect(normalize(mobileCell().textContent)).toBe('0%');
    });

    it('shows nothing when the savings are zero', () => {
      savingsPercentage = 0;
      render(makeFsat(1));

      expect(normalize(mobileCell().textContent)).toBe('');
      expect(mobileCell().querySelector('.alert-danger')).toBeNull();
    });

    it('shows the invalid modification alert listing every failing section', () => {
      modificationValid = INVALID_ALL;
      render(makeFsat(1));

      const alert = mobileCell().querySelector('.alert-danger');
      expect(alert).not.toBeNull();
      const text = normalize(alert.textContent);
      expect(text).toContain('Invalid modification');
      expect(text).toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
      expect(normalize(mobileCell().textContent)).not.toContain('%');
    });

    it('lists only the failing sections in the invalid modification alert', () => {
      modificationValid = { ...INVALID_ALL, fluidValid: true, fanValid: true };
      render(makeFsat(1));

      const text = normalize(mobileCell().querySelector('.alert-danger').textContent);
      expect(text).not.toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).not.toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });
  });

  describe('template visibility: percent savings (desktop column)', () => {
    function desktopCell(): HTMLElement {
      return fixture.nativeElement.querySelector('.d-none.d-lg-flex');
    }

    it('shows the percent graph when the modification is valid and has savings', () => {
      savingsPercentage = 25;
      render(makeFsat(1));

      expect(desktopCell().querySelector('app-percent-graph')).not.toBeNull();
      expect(desktopCell().querySelector('.alert-danger')).toBeNull();
    });

    it('hides the percent graph when there are no savings', () => {
      savingsPercentage = 0;
      render(makeFsat(1));

      expect(desktopCell().querySelector('app-percent-graph')).toBeNull();
      expect(desktopCell().querySelector('.alert-danger')).toBeNull();
    });

    it('shows the invalid modification alert instead of the graph when invalid', () => {
      modificationValid = INVALID_ALL;
      render(makeFsat(1));

      expect(desktopCell().querySelector('app-percent-graph')).toBeNull();
      const text = normalize(desktopCell().querySelector('.alert-danger').textContent);
      expect(text).toContain('Invalid modification');
      expect(text).toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });

    it('hides the percent graph and lists only failing sections when partially invalid', () => {
      modificationValid = { ...INVALID_ALL, fieldDataValid: true, motorValid: true };
      render(makeFsat(1));

      const text = normalize(desktopCell().querySelector('.alert-danger').textContent);
      expect(text).toContain('Errors found in Fluid');
      expect(text).not.toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).not.toContain('Errors found in Motor');
    });
  });

  describe('template visibility: modification values or em dash', () => {
    const optionalRows: Array<{ label: string, key: keyof FsatOutput, shown: string }> = [
      { label: 'Motor efficiency (%)', key: 'motorEfficiency', shown: '90' },
      { label: 'Motor power factor (%)', key: 'motorPowerFactor', shown: '85' },
      { label: 'Percent Loaded (%)', key: 'loadFactor', shown: '50' },
      { label: 'Drive efficiency (%)', key: 'driveEfficiency', shown: '95' },
      { label: 'Motor current (A)', key: 'motorCurrent', shown: '50' },
      { label: 'Motor power (kW)', key: 'motorPower', shown: '75' },
    ];

    optionalRows.forEach(({ label, key, shown }) => {
      it(`shows the modification value for "${label}" when it is set`, () => {
        render(makeFsat(1));
        expect(getCellTexts(label)[2]).toBe(shown);
      });

      it(`shows an em dash for "${label}" when the modification value is empty`, () => {
        modificationOutputs = makeOutputs({ [key]: 0 });
        render(makeFsat(1));
        expect(getCellTexts(label)[2]).toBe('—');
      });
    });

    it('shows annual energy and cost for the modification when they are set', () => {
      render(makeFsat(1));

      expect(getCellTexts('Annual Energy (MWh)')[2]).toBe('400');
      expect(getCellTexts('Annual Cost ($)')[2]).toBe('3,000');
    });

    it('shows em dashes for annual energy and cost when the modification values are empty', () => {
      modificationOutputs = makeOutputs({ annualEnergy: 0, annualCost: 0 });
      render(makeFsat(1));

      expect(getCellTexts('Annual Energy (MWh)')[2]).toBe('—');
      expect(getCellTexts('Annual Cost ($)')[2]).toBe('—');
    });

    it('marks modification annual values as positive savings only when savings exceed 10 percent', () => {
      savingsPercentage = 25;
      render(makeFsat(1));
      expect(getRow('Annual Energy (MWh)').children[2].querySelector('.positive-savings')).not.toBeNull();
      expect(getRow('Annual Cost ($)').children[2].querySelector('.positive-savings')).not.toBeNull();

      savingsPercentage = 5;
      component.getResults();
      fixture.detectChanges();
      expect(getRow('Annual Energy (MWh)').children[2].querySelector('.positive-savings')).toBeNull();
      expect(getRow('Annual Cost ($)').children[2].querySelector('.positive-savings')).toBeNull();
    });
  });

  describe('template visibility: savings rows depend on whatIfScenario', () => {
    it('shows energy and cost savings values for a what-if scenario', () => {
      render(makeFsat(1, true));

      expect(getCellTexts('Annual Energy Savings (MWh)')[2]).toBe('100');
      expect(getCellTexts('Annual Savings ($)')[2]).toBe('1,000');
    });

    it('shows em dashes for energy and cost savings when comparing two fans', () => {
      render(makeFsat(1, false));

      expect(getCellTexts('Annual Energy Savings (MWh)')[2]).toBe('—');
      expect(getCellTexts('Annual Savings ($)')[2]).toBe('—');
    });

    it('shows em dashes for savings when the modification costs the same as the baseline', () => {
      modificationOutputs = makeOutputs();
      render(makeFsat(1, true));

      expect(getCellTexts('Annual Energy Savings (MWh)')[2]).toBe('—');
      expect(getCellTexts('Annual Savings ($)')[2]).toBe('—');
    });
  });

  describe('template visibility: operational impacts (CO2) rows', () => {
    const EMISSIONS = 'Annual CO2 Emissions (ton CO2)';
    const EMISSIONS_SAVINGS = 'Annual CO2 Emissions Savings (ton CO2)';

    it('hides the CO2 rows when the feature flag is off', () => {
      render(makeFsat(1));

      expect(hasRow(EMISSIONS)).toBeFalse();
      expect(hasRow(EMISSIONS_SAVINGS)).toBeFalse();
    });

    it('shows the CO2 rows when the feature flag is on', () => {
      operationalImpactsFlag.set(true);
      render(makeFsat(1));

      expect(hasRow(EMISSIONS)).toBeTrue();
      expect(hasRow(EMISSIONS_SAVINGS)).toBeTrue();
    });

    it('labels the CO2 rows in tons for Imperial settings', () => {
      operationalImpactsFlag.set(true);
      render(makeFsat(1), false, makeSettings({ emissionsUnit: 'Imperial' }));

      expect(hasRow('Annual CO2 Emissions (ton CO2)')).toBeTrue();
      expect(hasRow('Annual CO2 Emissions Savings (ton CO2)')).toBeTrue();
    });

    it('labels the CO2 rows in tonnes for Metric settings', () => {
      operationalImpactsFlag.set(true);
      render(makeFsat(1), false, makeSettings({ emissionsUnit: 'Metric' }));

      expect(hasRow('Annual CO2 Emissions (tonne CO2)')).toBeTrue();
      expect(hasRow('Annual CO2 Emissions Savings (tonne CO2)')).toBeTrue();
    });

    it('shows no unit in the CO2 labels for other emissions units', () => {
      operationalImpactsFlag.set(true);
      render(makeFsat(1), false, makeSettings({ emissionsUnit: undefined }));

      expect(hasRow('Annual CO2 Emissions')).toBeTrue();
      expect(hasRow('Annual CO2 Emissions Savings')).toBeTrue();
    });

    it('shows baseline and modification emissions and the savings for a what-if scenario', () => {
      operationalImpactsFlag.set(true);
      modificationOutputs = makeOutputs({ co2EmissionsOutput: 15 });
      render(makeFsat(1, true));

      expect(getCellTexts(EMISSIONS).slice(1)).toEqual(['20.0', '15.0']);
      expect(getCellTexts(EMISSIONS_SAVINGS).slice(1)).toEqual(['—', '5']);
    });

    it('shows an em dash for modification emissions when the modification has none', () => {
      operationalImpactsFlag.set(true);
      modificationOutputs = makeOutputs({ co2EmissionsOutput: 0 });
      render(makeFsat(1, true));

      expect(getCellTexts(EMISSIONS)[2]).toBe('—');
      expect(getCellTexts(EMISSIONS_SAVINGS)[2]).toBe('—');
    });

    it('shows an em dash for emissions savings when comparing two fans', () => {
      operationalImpactsFlag.set(true);
      modificationOutputs = makeOutputs({ co2EmissionsOutput: 15 });
      render(makeFsat(1, false));

      expect(getCellTexts(EMISSIONS)[2]).toBe('15.0');
      expect(getCellTexts(EMISSIONS_SAVINGS)[2]).toBe('—');
    });

    it('omits the modification CO2 columns when in setup', () => {
      operationalImpactsFlag.set(true);
      render(makeFsat(1), true);

      expect(getCellTexts(EMISSIONS)).toEqual([EMISSIONS, '20.0']);
      expect(getCellTexts(EMISSIONS_SAVINGS)).toEqual([EMISSIONS_SAVINGS, '—']);
    });
  });
});
