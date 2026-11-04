import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ResultsSummaryComponent } from './results-summary.component';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { CompareService } from '../../compare.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';
import { FsatCompare } from '../../../report-rollup/report-rollup-models';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { Assessment } from '../../../shared/models/assessment';
import { FSAT, FsatOutput, FsatValid, Modification, Notes } from '../../../shared/models/fans';
import { SavingsOpportunity } from '../../../shared/models/explore-opps';
import { Settings } from '../../../shared/models/settings';

const EM_DASH = '—';

const VALID: FsatValid = {
  isValid: true,
  fluidValid: true,
  fanValid: true,
  motorValid: true,
  fieldDataValid: true,
  fsatOperationsValid: true,
};

const NO_OPPORTUNITY: SavingsOpportunity = { hasOpportunity: false, display: '' };

function opportunity(display: string): SavingsOpportunity {
  return { hasOpportunity: true, display };
}

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

function makeModification(name: string, fsatOverrides: Partial<FSAT> = {}, modOverrides: Partial<Modification> = {}): Modification {
  return {
    id: name,
    exploreOppsShowVfd: NO_OPPORTUNITY,
    exploreOppsShowDrive: NO_OPPORTUNITY,
    exploreOppsShowFanType: NO_OPPORTUNITY,
    exploreOppsShowMotor: NO_OPPORTUNITY,
    exploreOppsShowFlowRate: NO_OPPORTUNITY,
    exploreOppsShowReducePressure: NO_OPPORTUNITY,
    exploreOppsShowOpData: NO_OPPORTUNITY,
    fsat: {
      name,
      whatIfScenario: true,
      valid: VALID,
      implementationCosts: 1000,
      fanSetup: { fanType: 1 },
      outputs: makeOutputs({
        annualEnergy: 400, annualCost: 3000, percentSavings: 25, energySavings: 100,
        annualSavings: 1000, paybackPeriod: 12, co2EmissionsOutput: 15,
      }),
      ...fsatOverrides,
    } as FSAT,
    ...modOverrides,
  } as Modification;
}

function makeAssessment(modifications: Modification[]): Assessment {
  return {
    id: 7,
    name: 'Fan 1',
    fsat: { name: 'Baseline', modifications, outputs: makeOutputs(), valid: VALID, notes: {} as Notes } as FSAT,
  } as Assessment;
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { fanPowerMeasurement: 'hp', currency: '$', emissionsUnit: 'Imperial', ...overrides } as Settings;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('ResultsSummaryComponent', () => {
  let component: ResultsSummaryComponent;
  let fixture: ComponentFixture<ResultsSummaryComponent>;
  let rollupServiceSpy: jasmine.SpyObj<FsatReportRollupService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let selectedFsats: BehaviorSubject<Array<FsatCompare>>;
  let operationalImpactsFlag: WritableSignal<boolean>;

  function getRows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function findRow(label: string): HTMLElement | undefined {
    return getRows().find(row => normalize(row.children[0].textContent) === label);
  }

  function getRow(label: string): HTMLElement {
    const row = findRow(label);
    expect(row).withContext(`row "${label}"`).toBeDefined();
    return row;
  }

  function getCellTexts(label: string): string[] {
    return Array.from(getRow(label).children).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function getHeaderTexts(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th: HTMLElement) => normalize(th.textContent));
  }

  function render(assessment: Assessment, options: { inRollup?: boolean, settings?: Settings } = {}) {
    component.assessment = assessment;
    component.settings = options.settings ?? makeSettings();
    component.inRollup = options.inRollup ?? false;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    selectedFsats = new BehaviorSubject<Array<FsatCompare>>([]);
    operationalImpactsFlag = signal(false);

    rollupServiceSpy = jasmine.createSpyObj('FsatReportRollupService', ['updateSelectedFsats'], { selectedFsats });
    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'checkFanOperationsDifferent', 'checkFluidDifferent', 'checkFanSetupDifferent',
      'checkFanMotorDifferent', 'checkFanFieldDataDifferent',
    ]);
    compareServiceSpy.checkFanOperationsDifferent.and.returnValue(false);
    compareServiceSpy.checkFluidDifferent.and.returnValue(false);
    compareServiceSpy.checkFanSetupDifferent.and.returnValue(false);
    compareServiceSpy.checkFanMotorDifferent.and.returnValue(false);
    compareServiceSpy.checkFanFieldDataDifferent.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [ResultsSummaryComponent],
      providers: [
        { provide: FsatReportRollupService, useValue: rollupServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        {
          provide: FeatureFlagService,
          useValue: jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts: operationalImpactsFlag }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsSummaryComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and takes the fsat from the assessment', () => {
      const assessment = makeAssessment([makeModification('Mod A')]);
      render(assessment);

      expect(component).toBeTruthy();
      expect(component.fsat).toBe(assessment.fsat);
    });

    it('leaves the selected modification unset when not in a rollup', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: 0 } as FsatCompare]);
      render(makeAssessment([makeModification('Mod A')]));

      expect(component.selectedModificationIndex).toBeUndefined();
    });

    it('reads the selected modification for this assessment from the rollup service', () => {
      selectedFsats.next([
        { assessmentId: 3, selectedIndex: 0 } as FsatCompare,
        { assessmentId: 7, selectedIndex: 1 } as FsatCompare,
      ]);
      render(makeAssessment([makeModification('Mod A'), makeModification('Mod B')]), { inRollup: true });

      expect(component.selectedModificationIndex).toBe(1);
    });

    it('builds summary notes from each modification, labeled by section', () => {
      const assessment = makeAssessment([
        makeModification('Mod A', {
          notes: { fluidNotes: 'fluid note', fanSetupNotes: 'setup note', fanMotorNotes: 'motor note', fieldDataNotes: 'field note' },
        }),
      ]);
      render(assessment);

      expect(component.notes).toEqual([
        { modName: 'Mod A', modMade: 'Fluid', modNote: 'fluid note' },
        { modName: 'Mod A', modMade: 'Fan', modNote: 'setup note' },
        { modName: 'Mod A', modMade: 'Motor', modNote: 'motor note' },
        { modName: 'Mod A', modMade: 'Field Data', modNote: 'field note' },
      ]);
    });
  });

  describe('template visibility: modification columns (ngFor)', () => {
    it('renders only the baseline header when there are no modifications', () => {
      render(makeAssessment([]));

      expect(getHeaderTexts()).toEqual(['', 'Baseline']);
      expect(getCellTexts('Fan Energy Index').length).toBe(2);
    });

    it('renders one header and value column per modification', () => {
      render(makeAssessment([makeModification('Mod A'), makeModification('Mod B')]));

      expect(getHeaderTexts()).toEqual(['', 'Baseline', 'Mod A', 'Mod B']);
      expect(getCellTexts('Fan Energy Index')).toEqual(['Fan Energy Index', '1.2', '1.2', '1.2']);
    });

    it('highlights the selected modification header', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: 1 } as FsatCompare]);
      render(makeAssessment([makeModification('Mod A'), makeModification('Mod B')]), { inRollup: true });

      const selected = Array.from(fixture.nativeElement.querySelectorAll('thead th.selected-modification')) as HTMLElement[];
      expect(selected.map(th => normalize(th.textContent))).toEqual(['Mod B']);
    });

    it('highlights the baseline header when the baseline is selected', () => {
      selectedFsats.next([{ assessmentId: 7, selectedIndex: -1 } as FsatCompare]);
      render(makeAssessment([makeModification('Mod A')]), { inRollup: true });

      const selected = Array.from(fixture.nativeElement.querySelectorAll('thead th.selected-modification')) as HTMLElement[];
      expect(selected.map(th => normalize(th.textContent))).toEqual(['Baseline']);
    });
  });

  describe('template visibility: percent savings row', () => {
    function percentCell(): HTMLElement {
      return fixture.nativeElement.querySelector('td.percent-graph');
    }

    it('renders no percent cell when there are no modifications', () => {
      render(makeAssessment([]));
      expect(percentCell()).toBeNull();
    });

    it('shows the percent graph and print value for a valid modification with savings', () => {
      render(makeAssessment([makeModification('Mod A')]));

      const cell = percentCell();
      expect(cell.querySelector('.hide-print app-percent-graph')).not.toBeNull();
      expect(cell.querySelector('.hide-print .alert-danger')).toBeNull();
      expect(normalize(cell.querySelector('.show-print').textContent)).toBe('25 %');
      expect(cell.querySelector('.mx-auto')).toBeNull();
    });

    it('shows the invalid alert listing every failing section instead of the graph', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, fluidValid: false, fieldDataValid: false, fanValid: false, motorValid: false };
      render(makeAssessment([makeModification('Mod A', { valid: invalid })]));

      const cell = percentCell();
      expect(cell.querySelector('app-percent-graph')).toBeNull();
      const text = normalize(cell.querySelector('.alert-danger').textContent);
      expect(text).toContain('Invalid modification');
      expect(text).toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });

    it('lists only the failing sections in the invalid alert', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, motorValid: false };
      render(makeAssessment([makeModification('Mod A', { valid: invalid })]));

      const text = normalize(percentCell().querySelector('.alert-danger').textContent);
      expect(text).not.toContain('Errors found in Fluid');
      expect(text).not.toContain('Errors found in Field Data');
      expect(text).not.toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });

    it('shows an em dash instead of the graph and print value when there are no savings', () => {
      render(makeAssessment([makeModification('Mod A', { outputs: makeOutputs({ percentSavings: 0 }) })]));

      const cell = percentCell();
      expect(cell.querySelector('.hide-print')).toBeNull();
      expect(cell.querySelector('.show-print')).toBeNull();
      expect(normalize(cell.querySelector('.mx-auto').textContent)).toBe(`${EM_DASH} ${EM_DASH}`);
    });
  });

  describe('template visibility: operational impacts (CO2) rows', () => {
    const EMISSIONS = 'Annual CO2 Emissions (ton CO2)';
    const EMISSIONS_SAVINGS = 'Annual CO2 Emissions Savings (ton CO2)';

    it('hides the CO2 rows when the feature flag is off', () => {
      render(makeAssessment([makeModification('Mod A')]));

      expect(findRow(EMISSIONS)).toBeUndefined();
      expect(findRow(EMISSIONS_SAVINGS)).toBeUndefined();
    });

    it('shows the CO2 rows when the feature flag is on', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A')]));

      expect(findRow(EMISSIONS)).toBeDefined();
      expect(findRow(EMISSIONS_SAVINGS)).toBeDefined();
    });

    it('labels the CO2 rows in tonnes for Metric settings', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A')]), { settings: makeSettings({ emissionsUnit: 'Metric' }) });

      expect(findRow('Annual CO2 Emissions (tonne CO2)')).toBeDefined();
      expect(findRow('Annual CO2 Emissions Savings (tonne CO2)')).toBeDefined();
    });

    it('shows no unit in the CO2 labels for other emissions units', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A')]), { settings: makeSettings({ emissionsUnit: undefined }) });

      expect(findRow('Annual CO2 Emissions')).toBeDefined();
      expect(findRow('Annual CO2 Emissions Savings')).toBeDefined();
    });

    it('shows emissions for baseline and modification and the savings for a what-if scenario', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A')]));

      expect(getCellTexts(EMISSIONS).slice(1)).toEqual(['20.0', '15.0']);
      expect(getCellTexts(EMISSIONS_SAVINGS).slice(1)).toEqual([EM_DASH, '5.00']);
    });

    it('shows an em dash for modification emissions when it has none', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A', { outputs: makeOutputs({ co2EmissionsOutput: 0 }) })]));

      expect(getCellTexts(EMISSIONS)[2]).toBe(EM_DASH);
    });

    it('shows no emissions savings value when comparing two fans', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: false })]));

      expect(getCellTexts(EMISSIONS_SAVINGS)[2]).toBe(EM_DASH);
    });

    it('shows no emissions savings value when the scenario type is unset', () => {
      operationalImpactsFlag.set(true);
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: undefined })]));

      expect(getCellTexts(EMISSIONS_SAVINGS)[2]).toBe('');
    });
  });

  describe('template visibility: savings and cost rows', () => {
    it('shows energy savings and annual savings for a what-if scenario', () => {
      render(makeAssessment([makeModification('Mod A')]));

      expect(getCellTexts('Annual Energy Savings (MWh)').slice(1)).toEqual([EM_DASH, '100']);
      expect(getCellTexts('Annual Savings ($)').slice(1)).toEqual([EM_DASH, '1,000']);
    });

    it('shows em dashes for energy savings and annual savings when comparing two fans', () => {
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: false })]));

      expect(getCellTexts('Annual Energy Savings (MWh)')[2]).toBe(EM_DASH);
      expect(getCellTexts('Annual Savings ($)')[2]).toBe(EM_DASH);
    });

    it('shows nothing for energy savings and annual savings when the scenario type is unset', () => {
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: undefined })]));

      expect(getCellTexts('Annual Energy Savings (MWh)')[2]).toBe('');
      expect(getCellTexts('Annual Savings ($)')[2]).toBe('');
    });

    it('shows the implementation cost and the payback period when a cost is set', () => {
      render(makeAssessment([makeModification('Mod A', { implementationCosts: 1000, outputs: makeOutputs({ paybackPeriod: 12 }) })]));

      expect(getCellTexts('Implementation Cost')[2]).toBe('1,000');
      expect(getCellTexts('Payback Period (months)')[2]).toBe('12.000');
    });

    it('shows an em dash for the implementation cost and 0 for the payback when no cost is set', () => {
      render(makeAssessment([makeModification('Mod A', { implementationCosts: 0 })]));

      expect(getCellTexts('Implementation Cost')[2]).toBe(EM_DASH);
      expect(getCellTexts('Payback Period (months)')[2]).toBe('0');
    });
  });

  describe('template visibility: selected energy projects', () => {
    function projectTexts(): string[] {
      const cell = getRow('Selected Energy Projects').children[2];
      return Array.from(cell.querySelectorAll('span.d-block')).map((span: HTMLElement) => normalize(span.textContent));
    }

    it('shows nothing when no opportunity is selected', () => {
      render(makeAssessment([makeModification('Mod A')]));
      expect(projectTexts()).toEqual([]);
    });

    it('shows nothing for a modification with no opportunity data', () => {
      render(makeAssessment([makeModification('Mod A', {}, {
        exploreOppsShowVfd: undefined, exploreOppsShowDrive: undefined, exploreOppsShowFanType: undefined,
        exploreOppsShowMotor: undefined, exploreOppsShowFlowRate: undefined,
        exploreOppsShowReducePressure: undefined, exploreOppsShowOpData: undefined,
      })]));
      expect(projectTexts()).toEqual([]);
    });

    it('shows the VFD opportunity and hides the drive and fan type opportunities when VFD is selected', () => {
      render(makeAssessment([makeModification('Mod A', {}, {
        exploreOppsShowVfd: opportunity('VFD'),
        exploreOppsShowDrive: opportunity('Drive'),
        exploreOppsShowFanType: opportunity('Fan Type'),
      })]));

      expect(projectTexts()).toEqual(['VFD']);
    });

    it('shows the drive and fan type opportunities when VFD is not selected', () => {
      render(makeAssessment([makeModification('Mod A', {}, {
        exploreOppsShowDrive: opportunity('Drive'),
        exploreOppsShowFanType: opportunity('Fan Type'),
      })]));

      expect(projectTexts()).toEqual(['Drive', 'Fan Type']);
    });

    it('shows motor, flow rate, reduce pressure, and operation data opportunities independently', () => {
      render(makeAssessment([makeModification('Mod A', {}, {
        exploreOppsShowVfd: opportunity('VFD'),
        exploreOppsShowMotor: opportunity('Motor'),
        exploreOppsShowFlowRate: opportunity('Flow Rate'),
        exploreOppsShowReducePressure: opportunity('Reduce Pressure'),
        exploreOppsShowOpData: opportunity('Operation Data'),
      })]));

      expect(projectTexts()).toEqual(['VFD', 'Motor', 'Flow Rate', 'Reduce Pressure', 'Operation Data']);
    });

    it('hides motor, flow rate, reduce pressure, and operation data opportunities that are not selected', () => {
      render(makeAssessment([makeModification('Mod A', {}, {
        exploreOppsShowMotor: opportunity('Motor'),
        exploreOppsShowOpData: opportunity('Operation Data'),
      })]));

      expect(projectTexts()).toEqual(['Motor', 'Operation Data']);
    });
  });

  describe('template visibility: modification scenario and modifications made', () => {
    function divTexts(label: string): string[] {
      const cell = getRow(label).children[2];
      return Array.from(cell.querySelectorAll('div')).map((div: HTMLElement) => normalize(div.textContent));
    }

    it('lists "Modify Fan" for a what-if scenario', () => {
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: true })]));
      expect(divTexts('Modification Scenario')).toEqual(['Modify Fan']);
    });

    it('lists "Compare Two Fans" when comparing two fans', () => {
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: false })]));
      expect(divTexts('Modification Scenario')).toEqual(['Compare Two Fans']);
    });

    it('lists no scenario when the scenario type is unset', () => {
      render(makeAssessment([makeModification('Mod A', { whatIfScenario: undefined })]));
      expect(divTexts('Modification Scenario')).toEqual([]);
    });

    it('lists no modifications made when nothing differs from the baseline', () => {
      render(makeAssessment([makeModification('Mod A')]));
      expect(divTexts('Modifications')).toEqual([]);
    });

    it('lists every section that differs from the baseline', () => {
      compareServiceSpy.checkFanOperationsDifferent.and.returnValue(true);
      compareServiceSpy.checkFluidDifferent.and.returnValue(true);
      compareServiceSpy.checkFanSetupDifferent.and.returnValue(true);
      compareServiceSpy.checkFanMotorDifferent.and.returnValue(true);
      compareServiceSpy.checkFanFieldDataDifferent.and.returnValue(true);
      render(makeAssessment([makeModification('Mod A')]));

      expect(divTexts('Modifications')).toEqual(['Operations', 'Fluid', 'Fan', 'Motor', 'Field Data']);
    });

    it('lists only the sections that differ from the baseline', () => {
      compareServiceSpy.checkFluidDifferent.and.returnValue(true);
      compareServiceSpy.checkFanMotorDifferent.and.returnValue(true);
      render(makeAssessment([makeModification('Mod A')]));

      expect(divTexts('Modifications')).toEqual(['Fluid', 'Motor']);
    });

    it('shows the optimized marker only for modifications whose fan type is not 12', () => {
      render(makeAssessment([
        makeModification('Mod A', { fanSetup: { fanType: 1 } as FSAT['fanSetup'] }),
        makeModification('Mod B', { fanSetup: { fanType: 12 } as FSAT['fanSetup'] }),
      ]));

      const cells = Array.from(getRows().find(row => row.querySelector('.text-muted')).children) as HTMLElement[];
      expect(normalize(cells[2].textContent)).toBe('*Optimized');
      expect(cells[3].querySelector('.text-muted')).toBeNull();
    });
  });

  describe('template visibility: rollup selection row', () => {
    it('hides the "Use for Summary" row when not in a rollup', () => {
      render(makeAssessment([makeModification('Mod A')]));

      expect(findRow('Use for Summary')).toBeUndefined();
      expect(fixture.nativeElement.querySelector('input[type="radio"]')).toBeNull();
    });

    it('shows a radio for the baseline and each modification in a rollup', () => {
      render(makeAssessment([makeModification('Mod A'), makeModification('Mod B')]), { inRollup: true });

      expect(findRow('Use for Summary')).toBeDefined();
      expect(getRow('Use for Summary').querySelectorAll('input[type="radio"]').length).toBe(3);
    });

    it('shows only the baseline radio in a rollup without modifications', () => {
      render(makeAssessment([]), { inRollup: true });

      expect(getRow('Use for Summary').querySelectorAll('input[type="radio"]').length).toBe(1);
    });
  });

  describe('template visibility: modification notes', () => {
    it('hides the notes section when no modification has notes', () => {
      render(makeAssessment([makeModification('Mod A')]));

      expect(fixture.nativeElement.querySelector('h5')).toBeNull();
    });

    it('hides the notes section when there are no modifications', () => {
      render(makeAssessment([]));

      expect(fixture.nativeElement.querySelector('h5')).toBeNull();
    });

    it('shows one entry per note with the modification name, section, and text', () => {
      render(makeAssessment([
        makeModification('Mod A', { notes: { fluidNotes: 'fluid note', fanMotorNotes: 'motor note' } }),
        makeModification('Mod B', { notes: { fieldDataNotes: 'field note' } }),
      ]));

      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toBe('Modification Notes');
      const entries = Array.from(fixture.nativeElement.querySelectorAll('small > span')) as HTMLElement[];
      expect(entries.map(entry => normalize(entry.textContent))).toEqual([
        `Mod A ${EM_DASH} Fluid: fluid note`,
        `Mod A ${EM_DASH} Motor: motor note`,
        `Mod B ${EM_DASH} Field Data: field note`,
      ]);
    });

    it('skips notes that have no text', () => {
      render(makeAssessment([makeModification('Mod A', { notes: { fluidNotes: 'fluid note' } })]));
      component.notes = [
        { modName: 'Mod A', modMade: 'Fluid', modNote: 'fluid note' },
        { modName: 'Mod A', modMade: 'Motor', modNote: '' },
      ];
      fixture.detectChanges();

      const entries = Array.from(fixture.nativeElement.querySelectorAll('small > span')) as HTMLElement[];
      expect(entries.length).toBe(2);
      expect(entries[0].querySelector('b')).not.toBeNull();
      expect(entries[1].querySelector('b')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('updates the rollup selection with the assessment, settings, and selected index', () => {
      const assessment = makeAssessment([makeModification('Mod A')]);
      render(assessment, { inRollup: true });
      component.selectedModificationIndex = 0;

      component.useModification();

      expect(rollupServiceSpy.updateSelectedFsats).toHaveBeenCalledWith({ assessment, settings: component.settings }, 0);
    });

    it('copies the results table text for export', () => {
      render(makeAssessment([makeModification('Mod A')]));

      component.updateCopyTableString();

      expect(component.copyTableString).toContain('Fan Energy Index');
      expect(component.copyTableString).toContain('Mod A');
    });
  });
});
