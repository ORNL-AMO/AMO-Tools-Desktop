import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { OutputSummaryComponent } from './output-summary.component';
import { CompareService } from '../../compare.service';
import { PsatReportRollupService } from '../../../report-rollup/psat-report-rollup.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { SigFigsPipe } from '../../../shared/shared-pipes/sig-figs.pipe';
import { PSAT, PsatOutputs, PsatValid, Modification } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PsatCompare } from '../../../report-rollup/report-rollup-models';

const MOCK_SETTINGS: Settings = {
  powerMeasurement: 'hp',
  currency: 'USD',
  emissionsUnit: 'Imperial',
} as Settings;

function makeValid(overrides: Partial<PsatValid> = {}): PsatValid {
  return { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true, ...overrides };
}

function makeOutputs(overrides: Partial<PsatOutputs> = {}): PsatOutputs {
  return {
    pump_efficiency: 80,
    motor_rated_power: 200,
    motor_shaft_power: 190,
    mover_shaft_power: 185,
    motor_efficiency: 95,
    motor_power_factor: 88,
    motor_current: 200,
    motor_power: 150,
    load_factor: 0.75,
    drive_efficiency: 98,
    annual_energy: 1000,
    annual_cost: 60000,
    percent_annual_savings: 0,
    co2EmissionsOutput: 500,
    ...overrides,
  };
}

function makeModification(overrides: Partial<PSAT> = {}, id = 'mod-1', name = 'Modification 1'): Modification {
  return {
    id,
    notes: {},
    exploreOppsShowVfd: { hasOpportunity: false, display: '' },
    exploreOppsShowMotorDrive: { hasOpportunity: false, display: '' },
    exploreOppsShowPumpType: { hasOpportunity: false, display: '' },
    exploreOppsShowRatedMotorData: { hasOpportunity: false, display: '' },
    exploreOppsShowSystemData: { hasOpportunity: false, display: '' },
    exploreOppsShowFlowRate: { hasOpportunity: false, display: '' },
    exploreOppsShowHead: { hasOpportunity: false, display: '' },
    psat: {
      name,
      inputs: { whatIfScenario: true, implementationCosts: 0, pumpType: 0 } as any,
      outputs: makeOutputs(),
      valid: makeValid(),
      ...overrides,
    },
  } as Modification;
}

function makePsat(outputOverrides: Partial<PsatOutputs> = {}, modifications: Modification[] = []): PSAT {
  return {
    name: 'Baseline',
    inputs: { whatIfScenario: true } as any,
    outputs: makeOutputs(outputOverrides),
    valid: makeValid(),
    modifications,
  } as PSAT;
}

function makeAssessment(psat: PSAT, id = 1): Assessment {
  return { id, name: 'Test Assessment', psat, type: 'PSAT' } as Assessment;
}

describe('OutputSummaryComponent', () => {
  let component: OutputSummaryComponent;
  let fixture: ComponentFixture<OutputSummaryComponent>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let rollupServiceSpy: jasmine.SpyObj<PsatReportRollupService>;
  let selectedPsatsSubject: BehaviorSubject<PsatCompare[]>;
  let showOperationalImpactsSignal: WritableSignal<boolean>;

  beforeEach(() => {
    showOperationalImpactsSignal = signal(false);
    selectedPsatsSubject = new BehaviorSubject<PsatCompare[]>([]);

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'checkPumpDifferent', 'checkMotorDifferent', 'checkFieldDataDifferent',
    ]);
    compareServiceSpy.checkPumpDifferent.and.returnValue(false);
    compareServiceSpy.checkMotorDifferent.and.returnValue(false);
    compareServiceSpy.checkFieldDataDifferent.and.returnValue(false);

    rollupServiceSpy = jasmine.createSpyObj('PsatReportRollupService', ['updateSelectedPsats'], {
      selectedPsats: selectedPsatsSubject,
    });

    const featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], {
      showOperationalImpacts: showOperationalImpactsSignal,
    });

    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [OutputSummaryComponent, SigFigsPipe],
      providers: [
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatReportRollupService, useValue: rollupServiceSpy },
        { provide: FeatureFlagService, useValue: featureFlagServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(OutputSummaryComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.inRollup = false;
    component.assessment = makeAssessment(makePsat());
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('assigns psat from the assessment input', () => {
      fixture.detectChanges();
      expect(component.psat).toBe(component.assessment.psat);
    });

    it('leaves notes empty when the psat has no modifications', () => {
      fixture.detectChanges();
      expect(component.notes).toEqual([]);
    });

    it('builds summary notes from modification notes when modifications exist', () => {
      const mod = makeModification({}, 'mod-1', 'Mod 1');
      mod.notes = { pumpFluidNotes: 'Pump note', motorNotes: 'Motor note' };
      component.assessment = makeAssessment(makePsat({}, [mod]));
      fixture.detectChanges();
      expect(component.notes).toEqual([
        { modName: 'Mod 1', modMade: 'Pump and Fluid', modNote: 'Pump note' },
        { modName: 'Mod 1', modMade: 'Motor', modNote: 'Motor note' },
      ]);
    });

    it('does not set selectedModificationIndex when inRollup is false', () => {
      fixture.detectChanges();
      expect(component.selectedModificationIndex).toBeUndefined();
    });

    it('sets selectedModificationIndex from the rollup service when inRollup is true and the assessment matches', () => {
      component.inRollup = true;
      component.assessment = makeAssessment(makePsat(), 42);
      selectedPsatsSubject.next([
        { assessmentId: 42, selectedIndex: 1 } as PsatCompare,
      ]);
      fixture.detectChanges();
      expect(component.selectedModificationIndex).toBe(1);
    });

    it('leaves selectedModificationIndex undefined when inRollup is true but no assessment matches', () => {
      component.inRollup = true;
      component.assessment = makeAssessment(makePsat(), 42);
      selectedPsatsSubject.next([
        { assessmentId: 99, selectedIndex: 1 } as PsatCompare,
      ]);
      fixture.detectChanges();
      expect(component.selectedModificationIndex).toBeUndefined();
    });
  });

  describe('useModification', () => {
    it('calls updateSelectedPsats with the assessment, settings, and selected index', () => {
      fixture.detectChanges();
      component.selectedModificationIndex = 0;
      component.useModification();
      expect(rollupServiceSpy.updateSelectedPsats).toHaveBeenCalledWith(
        { assessment: component.assessment, settings: component.settings }, 0
      );
    });
  });

  describe('getModificationsMadeList', () => {
    it('includes each category returned as different by the compare service', () => {
      compareServiceSpy.checkPumpDifferent.and.returnValue(true);
      compareServiceSpy.checkMotorDifferent.and.returnValue(true);
      compareServiceSpy.checkFieldDataDifferent.and.returnValue(true);
      fixture.detectChanges();

      const result = component.getModificationsMadeList(component.psat);

      expect(result).toEqual(['Pump and Fluid', 'Motor', 'Field Data']);
      expect(compareServiceSpy.checkPumpDifferent).toHaveBeenCalledWith(component.settings, component.psat, component.psat);
    });

    it('returns an empty list when nothing is different', () => {
      fixture.detectChanges();
      expect(component.getModificationsMadeList(component.psat)).toEqual([]);
    });
  });

  describe('getPaybackPeriod', () => {
    it('computes months to payback from implementation cost and annual cost savings', () => {
      component.assessment = makeAssessment(makePsat({ annual_cost: 60000 }));
      fixture.detectChanges();
      const modification = { outputs: makeOutputs({ annual_cost: 48000 }), inputs: { implementationCosts: 1200 } } as PSAT;

      expect(component.getPaybackPeriod(modification)).toBe(1200 / 12000 * 12);
    });

    it('returns 0 when annual cost savings is not greater than 1', () => {
      component.assessment = makeAssessment(makePsat({ annual_cost: 60000 }));
      fixture.detectChanges();
      const modification = { outputs: makeOutputs({ annual_cost: 60000 }), inputs: { implementationCosts: 1200 } } as PSAT;

      expect(component.getPaybackPeriod(modification)).toBe(0);
    });
  });

  describe('getModificationScenario', () => {
    it('returns "Modify Pump" when whatIfScenario is true', () => {
      fixture.detectChanges();
      expect(component.getModificationScenario({ inputs: { whatIfScenario: true } } as PSAT)).toEqual(['Modify Pump']);
    });

    it('returns "Compare Two Pumps" when whatIfScenario is false', () => {
      fixture.detectChanges();
      expect(component.getModificationScenario({ inputs: { whatIfScenario: false } } as PSAT)).toEqual(['Compare Two Pumps']);
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
    it('shows the percent-graph and hides the em-dash when the baseline modification is valid with savings', () => {
      component.assessment = makeAssessment(makePsat({}, [makeModification({ outputs: makeOutputs({ percent_annual_savings: 15 }) })]));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-percent-graph')).not.toBeNull();
    });

    it('shows an em-dash instead of the percent-graph when the modification has no percent savings', () => {
      component.assessment = makeAssessment(makePsat({}, [makeModification({ outputs: makeOutputs({ percent_annual_savings: 0 }) })]));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-percent-graph')).toBeNull();
    });

    it('shows the invalid-baseline alert with pump/fluid, motor, and field data errors when the modification is invalid', () => {
      component.assessment = makeAssessment(makePsat({}, [
        makeModification({ valid: makeValid({ isValid: false, pumpFluidValid: false, motorValid: false, fieldDataValid: true }) }),
      ]));
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Invalid Baseline');
      expect(text).toContain('Errors found in Pump Fluid Data');
      expect(text).toContain('Errors found in Motor Data');
      expect(text).not.toContain('Errors found in Field Data');
    });

    it('hides the invalid-baseline alert when the modification is valid', () => {
      component.assessment = makeAssessment(makePsat({}, [makeModification()]));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Invalid Baseline');
    });

    it('shows a dash for motor efficiency when the modification has no motor_efficiency', () => {
      component.assessment = makeAssessment(makePsat({}, [makeModification({ outputs: makeOutputs({ motor_efficiency: undefined }) })]));
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Motor efficiency');
      expect(row.querySelectorAll('td')[2].textContent).toContain('—');
    });

    it('shows the motor efficiency value when present', () => {
      component.assessment = makeAssessment(makePsat({}, [makeModification({ outputs: makeOutputs({ motor_efficiency: 92 }) })]));
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Motor efficiency');
      expect(row.querySelectorAll('td')[2].textContent).toContain('92');
    });

    it('hides the CO2 rows when showOperationalImpacts is false', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Annual CO2 Emissions');
    });

    it('shows the CO2 rows when showOperationalImpacts is true', () => {
      showOperationalImpactsSignal.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Annual CO2 Emissions');
    });

    it('shows the Imperial CO2 unit label when settings.emissionsUnit is Imperial', () => {
      showOperationalImpactsSignal.set(true);
      component.settings = { ...MOCK_SETTINGS, emissionsUnit: 'Imperial' };
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('ton CO');
      expect(fixture.nativeElement.textContent).not.toContain('tonne CO');
    });

    it('shows the Metric CO2 unit label when settings.emissionsUnit is Metric', () => {
      showOperationalImpactsSignal.set(true);
      component.settings = { ...MOCK_SETTINGS, emissionsUnit: 'Metric' };
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('tonne CO');
    });

    it('shows the CO2 savings value only for a whatIfScenario modification with a nonzero diff', () => {
      component.assessment = makeAssessment(makePsat({ co2EmissionsOutput: 500 }, [
        makeModification({ outputs: makeOutputs({ co2EmissionsOutput: 400 }), inputs: { whatIfScenario: true } as any }),
      ]));
      showOperationalImpactsSignal.set(true);
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Annual CO2 Emissions Savings');
      expect(row.querySelectorAll('td')[2].textContent).toContain('100');
    });

    it('shows an em-dash for CO2 savings when the modification is a compare-two-pumps scenario', () => {
      component.assessment = makeAssessment(makePsat({ co2EmissionsOutput: 500 }, [
        makeModification({ outputs: makeOutputs({ co2EmissionsOutput: 400 }), inputs: { whatIfScenario: false } as any }),
      ]));
      showOperationalImpactsSignal.set(true);
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Annual CO2 Emissions Savings');
      expect(row.querySelectorAll('td')[2].textContent).toContain('—');
    });

    it('shows the "Use for Summary" row when inRollup is true', () => {
      component.inRollup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Use for Summary');
    });

    it('hides the "Use for Summary" row when inRollup is false', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Use for Summary');
    });

    it('shows the modification radio in the "Use for Summary" row only when the modification is valid', () => {
      component.inRollup = true;
      component.assessment = makeAssessment(makePsat({}, [makeModification({ valid: makeValid({ isValid: false }) })]));
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Use for Summary');
      expect(row.querySelectorAll('input[type="radio"]').length).toBe(1); // only the baseline radio
    });

    it('hides the modification notes section when there are no notes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Modification Notes');
    });

    it('shows the modification notes section when notes exist', () => {
      const mod = makeModification({}, 'mod-1', 'Mod 1');
      mod.notes = { motorNotes: 'Some motor note' };
      component.assessment = makeAssessment(makePsat({}, [mod]));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Modification Notes');
      expect(fixture.nativeElement.textContent).toContain('Some motor note');
    });

    it('shows the VFD opportunity and suppresses other opportunities when VFD has an opportunity', () => {
      const mod = makeModification();
      mod.exploreOppsShowVfd = { hasOpportunity: true, display: 'VFD Opportunity' };
      mod.exploreOppsShowMotorDrive = { hasOpportunity: true, display: 'Motor Drive Opportunity' };
      component.assessment = makeAssessment(makePsat({}, [mod]));
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Selected Energy Projects');
      expect(row.textContent).toContain('VFD Opportunity');
      expect(row.textContent).not.toContain('Motor Drive Opportunity');
    });

    it('shows the motor drive opportunity when VFD has no opportunity', () => {
      const mod = makeModification();
      mod.exploreOppsShowVfd = { hasOpportunity: false, display: 'VFD Opportunity' };
      mod.exploreOppsShowMotorDrive = { hasOpportunity: true, display: 'Motor Drive Opportunity' };
      component.assessment = makeAssessment(makePsat({}, [mod]));
      fixture.detectChanges();
      const row = findRowByLabel(fixture.nativeElement, 'Selected Energy Projects');
      expect(row.textContent).toContain('Motor Drive Opportunity');
    });

    it('renders one header column per modification', () => {
      component.assessment = makeAssessment(makePsat({}, [
        makeModification({}, 'mod-1', 'Mod A'),
        makeModification({}, 'mod-2', 'Mod B'),
      ]));
      fixture.detectChanges();
      const headerRow = fixture.nativeElement.querySelectorAll('thead tr')[0];
      expect(headerRow.textContent).toContain('Mod A');
      expect(headerRow.textContent).toContain('Mod B');
    });

    it('renders no modification header columns when there are no modifications', () => {
      fixture.detectChanges();
      const headerRow = fixture.nativeElement.querySelectorAll('thead tr')[0];
      expect(headerRow.textContent.trim()).toBe('Baseline');
    });
  });
});

function findRowByLabel(root: HTMLElement, label: string): HTMLElement {
  const row = Array.from(root.querySelectorAll('tr')).find((tr: HTMLElement) => tr.textContent.includes(label));
  if (!row) {
    throw new Error(`No row found containing label "${label}"`);
  }
  return row as HTMLElement;
}
