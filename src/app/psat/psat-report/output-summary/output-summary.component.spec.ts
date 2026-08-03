import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OutputSummaryComponent } from './output-summary.component';
import { CompareService } from '../../compare.service';
import { PsatReportRollupService } from '../../../report-rollup/psat-report-rollup.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

const MOCK_SETTINGS: any = { unitsOfMeasure: 'Imperial', emissionsUnit: 'Imperial' };

function makeModification(name: string, isValid = true): any {
  return {
    psat: {
      name,
      inputs: { whatIfScenario: true, pumpType: 0, implementationCosts: 0 },
      outputs: {
        pump_efficiency: 80,
        annual_energy: 1000,
        annual_cost: 5000,
        co2EmissionsOutput: 100,
        percent_annual_savings: 10,
        motor_efficiency: 0.9,
        motor_power_factor: 0.95,
        load_factor: 0.75,
        drive_efficiency: 0.98,
        motor_current: 50,
        motor_power: 40,
      },
      valid: {
        isValid,
        pumpFluidValid: isValid,
        motorValid: isValid,
        fieldDataValid: isValid,
      },
    },
    exploreOppsShowVfd: { hasOpportunity: false },
    exploreOppsShowMotorDrive: { hasOpportunity: false },
    exploreOppsShowPumpType: { hasOpportunity: false },
    exploreOppsShowRatedMotorData: { hasOpportunity: false },
    exploreOppsShowSystemData: { hasOpportunity: false },
    exploreOppsShowFlowRate: { hasOpportunity: false },
    exploreOppsShowHead: { hasOpportunity: false },
  };
}

function makeAssessment(modifications: any[] = []): any {
  return {
    id: 1,
    name: 'Test PSAT',
    psat: {
      inputs: { pumpType: 0, whatIfScenario: false },
      outputs: {
        pump_efficiency: 80,
        annual_energy: 1000,
        annual_cost: 5000,
        co2EmissionsOutput: 100,
        percent_annual_savings: 0,
      },
      modifications,
    },
  };
}

describe('OutputSummaryComponent', () => {
  let component: OutputSummaryComponent;
  let fixture: ComponentFixture<OutputSummaryComponent>;

  beforeEach(async () => {
    const compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'checkPumpDifferent',
      'getDiff',
      'checkMotorDifferent',
      'checkFieldDataDifferent',
    ]);
    compareServiceSpy.checkPumpDifferent.and.returnValue(false);
    compareServiceSpy.checkMotorDifferent.and.returnValue(false);
    compareServiceSpy.checkFieldDataDifferent.and.returnValue(false);
    compareServiceSpy.getDiff = (a: any, b: any) => a !== b && a != null && b != null ? b - a : null;

    const psatRollupServiceSpy = jasmine.createSpyObj('PsatReportRollupService', [], {
      selectedPsats: new BehaviorSubject<any[]>([]),
    });

    const featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], {
      showOperationalImpacts: signal(false),
    });

    await TestBed.configureTestingModule({
      declarations: [OutputSummaryComponent],
      providers: [
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatReportRollupService, useValue: psatRollupServiceSpy },
        { provide: FeatureFlagService, useValue: featureFlagServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OutputSummaryComponent);
    component = fixture.componentInstance;
    component.assessment = makeAssessment([makeModification('Mod A'), makeModification('Mod B')]);
    component.settings = MOCK_SETTINGS;
    component.inRollup = false;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('*ngFor modification columns', () => {
    it('renders header cells for each modification', () => {
      const headers = fixture.nativeElement.querySelectorAll('thead th');
      // First th is empty label, second is Baseline, rest are modifications
      expect(headers.length).toBe(4); // empty + baseline + 2 modifications
    });

    it('renders a td row for each modification in energy savings row', () => {
      const energyRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(energyRows.length).toBeGreaterThan(0);
    });
  });

  describe('modification validity', () => {
    it('shows alert-danger for invalid modifications', () => {
      component.assessment = makeAssessment([makeModification('Invalid Mod', false)]);
      component.ngOnInit();
      fixture.detectChanges();
      const danger = fixture.nativeElement.querySelector('.alert-danger');
      expect(danger).not.toBeNull();
    });

    it('does not show alert-danger for valid modifications', () => {
      component.assessment = makeAssessment([makeModification('Valid Mod', true)]);
      component.ngOnInit();
      fixture.detectChanges();
      const danger = fixture.nativeElement.querySelector('.alert-danger');
      expect(danger).toBeNull();
    });
  });
});
