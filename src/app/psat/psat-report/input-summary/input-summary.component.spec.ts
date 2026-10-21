import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';

import { InputSummaryComponent } from './input-summary.component';
import { PsatService } from '../../psat.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { SettingsLabelPipe } from '../../../shared/shared-pipes/settings-label.pipe';
import { PSAT, PsatInputs, PsatValid, Modification } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS: Settings = {
  powerMeasurement: 'hp',
  flowMeasurement: 'gpm',
  distanceMeasurement: 'ft',
  temperatureMeasurement: 'F',
  currency: 'USD',
  emissionsUnit: 'Imperial',
} as Settings;

function makeValid(overrides: Partial<PsatValid> = {}): PsatValid {
  return { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true, ...overrides };
}

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    pump_style: 0,
    pump_rated_speed: 1780,
    drive: 1,
    kinematic_viscosity: 1.0,
    specific_gravity: 1.0,
    stages: 1,
    line_frequency: 60,
    motor_rated_power: 200,
    motor_rated_speed: 1780,
    efficiency_class: 1,
    efficiency: 95,
    motor_rated_voltage: 460,
    load_estimation_method: 0,
    motor_rated_fla: 225,
    operating_hours: 8760,
    flow_rate: 1000,
    head: 100,
    motor_field_power: 150,
    motor_field_current: 200,
    motor_field_voltage: 460,
    cost_kw_hour: 0.06,
    implementationCosts: 0,
    fluidType: 'Water',
    fluidTemperature: 60,
    whatIfScenario: true,
    co2SavingsData: {
      energyType: 'Electricity',
      totalEmissionOutputRate: 1.5,
      electricityUse: 1000,
      totalEmissionOutput: 1500,
    },
    ...overrides,
  };
}

function makeModification(inputOverrides: Partial<PsatInputs> = {}, validOverrides: Partial<PsatValid> = {}, name = 'Modification 1'): Modification {
  return {
    id: 'mod-1',
    psat: {
      name,
      inputs: makePsatInputs(inputOverrides),
      valid: makeValid(validOverrides),
    },
  } as Modification;
}

function makePsat(inputOverrides: Partial<PsatInputs> = {}, modifications: Modification[] = []): PSAT {
  return {
    name: 'Baseline',
    inputs: makePsatInputs(inputOverrides),
    valid: makeValid(),
    modifications,
  } as PSAT;
}

function findRowByLabel(root: HTMLElement, label: string): HTMLElement {
  const row = Array.from(root.querySelectorAll('tr')).find((tr: HTMLElement) => tr.textContent.includes(label));
  if (!row) {
    throw new Error(`No row found containing label "${label}"`);
  }
  return row as HTMLElement;
}

describe('InputSummaryComponent', () => {
  let component: InputSummaryComponent;
  let fixture: ComponentFixture<InputSummaryComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let showOperationalImpactsSignal: WritableSignal<boolean>;

  beforeEach(() => {
    showOperationalImpactsSignal = signal(false);

    psatServiceSpy = jasmine.createSpyObj('PsatService', [
      'getPumpStyleFromEnum', 'getDriveFromEnum', 'getEfficiencyClassFromEnum', 'getFixedSpeedFromEnum', 'getLoadEstimationFromEnum',
    ]);
    psatServiceSpy.getPumpStyleFromEnum.and.callFake((num: number) => num === 11 ? 'Other' : 'Centrifugal');
    psatServiceSpy.getDriveFromEnum.and.returnValue('Direct Drive');
    psatServiceSpy.getEfficiencyClassFromEnum.and.callFake((num: number) => num === 3 ? 'Specified' : 'Standard Efficient');
    psatServiceSpy.getFixedSpeedFromEnum.and.returnValue('Yes');
    psatServiceSpy.getLoadEstimationFromEnum.and.returnValue('Power');

    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsServiceSpy.getUnit.and.returnValue({ unit: { name: { display: 'gpm' } } });

    const featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], {
      showOperationalImpacts: showOperationalImpactsSignal,
    });

    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [InputSummaryComponent, SettingsLabelPipe],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
        { provide: FeatureFlagService, useValue: featureFlagServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(InputSummaryComponent);
    component = fixture.componentInstance;
    component.psat = makePsat();
    component.settings = MOCK_SETTINGS;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('does not mark efficiency as specified when baseline efficiency_class is not 3', () => {
      fixture.detectChanges();
      expect(component.effClassSpecified).toBeFalse();
    });

    it('marks efficiency as specified when baseline efficiency_class is 3', () => {
      component.psat = makePsat({ efficiency_class: 3 });
      fixture.detectChanges();
      expect(component.effClassSpecified).toBeTrue();
    });

    it('marks efficiency as specified when a modification efficiency_class is 3', () => {
      component.psat = makePsat({}, [makeModification({ efficiency_class: 3 })]);
      fixture.detectChanges();
      expect(component.effClassSpecified).toBeTrue();
    });

    it('flags diffs for fields that differ between baseline and a modification', () => {
      component.psat = makePsat({}, [makeModification({ pump_style: 5, drive: 2, operating_hours: 100 })]);
      fixture.detectChanges();
      expect(component.pumpDiff).toBeTrue();
      expect(component.driveDiff).toBeTrue();
      expect(component.opFracDiff).toBeTrue();
    });

    it('does not flag diffs for fields that match between baseline and a modification', () => {
      component.psat = makePsat({}, [makeModification()]);
      fixture.detectChanges();
      expect(component.pumpDiff).toBeFalse();
      expect(component.driveDiff).toBeFalse();
      expect(component.opFracDiff).toBeFalse();
    });

    it('flags the specified-efficiency diff only when both efficiency_class is 3 and efficiency values differ', () => {
      component.psat = makePsat({ efficiency_class: 3, efficiency: 90 }, [makeModification({ efficiency_class: 3, efficiency: 91 })]);
      fixture.detectChanges();
      expect(component.specEffDiff).toBeTrue();
    });
  });

  describe('updateCopyTableString', () => {
    it('sets copyTableString from the copyTable element innerText', () => {
      fixture.detectChanges();
      component.updateCopyTableString();
      expect(component.copyTableString).toBe(component.copyTable.nativeElement.innerText);
    });
  });

  describe('template visibility', () => {
    it('hides the Total Emission Output Rate row when showOperationalImpacts is false', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Total Emission Output Rate');
    });

    it('shows the Total Emission Output Rate row when showOperationalImpacts is true', () => {
      showOperationalImpactsSignal.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Total Emission Output Rate');
    });

    it('hides the Pump Fluid error alert when the modification is valid', () => {
      component.psat = makePsat({}, [makeModification()]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Errors found in Pump Fluid setup');
    });

    it('shows the Pump Fluid error alert when the modification is invalid due to pump/fluid data', () => {
      component.psat = makePsat({}, [makeModification({}, { isValid: false, pumpFluidValid: false })]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Errors found in Pump Fluid setup');
    });

    it('hides the Motor error alert when the modification is valid', () => {
      component.psat = makePsat({}, [makeModification()]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Errors found in Motor setup');
    });

    it('shows the Motor error alert when the modification is invalid due to motor data', () => {
      component.psat = makePsat({}, [makeModification({}, { isValid: false, motorValid: false })]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Errors found in Motor setup');
    });

    it('hides the Field Data error alert when the modification is valid', () => {
      component.psat = makePsat({}, [makeModification()]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Errors found in Field Data setup');
    });

    it('shows the Field Data error alert when the modification is invalid due to field data', () => {
      component.psat = makePsat({}, [makeModification({}, { isValid: false, fieldDataValid: false })]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Errors found in Field Data setup');
    });

    it('shows the em-dash for a modification pump type of 11 ("Not Specified")', () => {
      component.psat = makePsat({}, [makeModification({ pump_style: 11 })]);
      fixture.detectChanges();
      const pumpTypeRow = findRowByLabel(fixture.nativeElement, 'Pump Type');
      const modificationCell = pumpTypeRow.querySelectorAll('td')[2];
      expect(modificationCell.textContent).toContain('—');
      expect(modificationCell.textContent).not.toContain('Centrifugal');
    });

    it('shows the resolved pump type label for a modification pump type other than 11', () => {
      component.psat = makePsat({}, [makeModification({ pump_style: 5 })]);
      fixture.detectChanges();
      const pumpTypeRow = findRowByLabel(fixture.nativeElement, 'Pump Type');
      const modificationCell = pumpTypeRow.querySelectorAll('td')[2];
      expect(modificationCell.textContent).toContain('Centrifugal');
    });

    it('hides the Specified Efficiency row when efficiency_class is not 3', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Specified Efficiency');
    });

    it('shows the Specified Efficiency row when baseline efficiency_class is 3', () => {
      component.psat = makePsat({ efficiency_class: 3, efficiency: 92 });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Specified Efficiency');
      expect(fixture.nativeElement.textContent).toContain('92%');
    });

    it('shows an em-dash in the Specified Efficiency row when efficiency class is not Specified', () => {
      component.psat = makePsat({ efficiency_class: 3 }, [makeModification({ efficiency_class: 1 })]);
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Specified Efficiency');
      const modificationCell = row.querySelectorAll('td')[2];
      expect(modificationCell.textContent).toContain('—');
    });

    it('hides the Motor Current row when load_estimation_method is not 1', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Motor Current');
    });

    it('shows the Motor Current row when load_estimation_method is 1', () => {
      component.psat = makePsat({ load_estimation_method: 1 });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Motor Current');
    });

    it('hides the Motor Power row when load_estimation_method is not 0', () => {
      component.psat = makePsat({ load_estimation_method: 1 });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Motor Power (kW)');
    });

    it('shows the Motor Power row when load_estimation_method is 0', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Motor Power (kW)');
    });

    it('renders no modification columns when there are no modifications', () => {
      fixture.detectChanges();
      const headerRow = fixture.nativeElement.querySelectorAll('thead tr')[0];
      expect(headerRow.querySelectorAll('th.psat-name').length).toBe(1);
    });

    it('renders one modification column per modification', () => {
      component.psat = makePsat({}, [makeModification({}, {}, 'Mod A'), makeModification({}, {}, 'Mod B')]);
      fixture.detectChanges();
      const headerRow = fixture.nativeElement.querySelectorAll('thead tr')[0];
      expect(headerRow.querySelectorAll('th.psat-name').length).toBe(3);
      expect(headerRow.textContent).toContain('Mod A');
      expect(headerRow.textContent).toContain('Mod B');
    });
  });
});
