import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { PsatService } from '../psat.service';
import { CompareService } from '../compare.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';

const MOCK_SETTINGS: any = { unitsOfMeasure: 'Imperial' };

const mockPsatResults = {
  baselineResults: { pump_efficiency: 80, annual_energy: 1000, annual_cost: 5000, co2EmissionsOutput: 100 },
  modificationResults: { pump_efficiency: 85, annual_energy: 900, annual_cost: 4500, co2EmissionsOutput: 90 },
  annualSavings: 500,
  percentSavings: 10,
  co2EmissionsSavings: 10,
};

function makePsat(withModification = true, whatIfScenario = true): any {
  const mods = withModification
    ? [
        {
          psat: {
            name: 'Mod 1',
            inputs: { whatIfScenario },
            valid: { isValid: true },
          },
          exploreOpportunities: true,
          notes: {},
        },
      ]
    : [];

  return {
    inputs: { flow_rate: 100, head: 200 },
    modifications: mods,
    valid: { isValid: true },
  };
}

describe('ExploreOpportunitiesComponent', () => {
  let component: ExploreOpportunitiesComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesComponent>;

  beforeEach(async () => {
    const psatServiceSpy = jasmine.createSpyObj('PsatService', [
      'getPsatResults',
      'isPsatValid',
    ]);
    psatServiceSpy.getPsatResults.and.returnValue(mockPsatResults);
    psatServiceSpy.isPsatValid.and.returnValue({ isValid: true });

    const compareServiceSpy = jasmine.createSpyObj('CompareService', [], {
      openNewModal: new BehaviorSubject<boolean>(false),
    });

    const settingsDbServiceSpy = { globalSettings: null };

    const snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['setSnackbarMessage']);

    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesComponent);
    component = fixture.componentInstance;
    component.assessment = { id: 1, psat: makePsat() } as any;
    component.settings = MOCK_SETTINGS;
    component.psat = makePsat();
    component.modificationIndex = 0;
    component.modificationExists = true;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('modificationExists conditional', () => {
    it('shows explore-opportunities-form when modificationExists is true', () => {
      component.modificationExists = true;
      fixture.detectChanges();
      const formPanel = fixture.nativeElement.querySelector('app-explore-opportunities-form');
      expect(formPanel).not.toBeNull();
    });

    it('shows no-modification message when modificationExists is false', () => {
      component.modificationExists = false;
      fixture.detectChanges();
      const noData = fixture.nativeElement.querySelector('.no-data');
      expect(noData).not.toBeNull();
    });

    it('hides no-modification message when modificationExists is true', () => {
      component.modificationExists = true;
      fixture.detectChanges();
      const noData = fixture.nativeElement.querySelector('.no-data');
      expect(noData).toBeNull();
    });
  });

  describe('whatIfScenario conditional rendering', () => {
    it('shows explore-opportunities-form for whatIfScenario true', () => {
      component.modificationExists = true;
      component.psat.modifications[0].psat.inputs.whatIfScenario = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).not.toBeNull();
    });
  });

  describe('tabSelect conditionals', () => {
    it('shows results panel when tabSelect is "results" and modificationExists', () => {
      component.tabSelect = 'results';
      component.modificationExists = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).not.toBeNull();
    });

    it('shows help panel when tabSelect is "help"', () => {
      component.tabSelect = 'help';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.help-panel')).not.toBeNull();
    });

    it('hides results when modificationExists is false', () => {
      component.tabSelect = 'results';
      component.modificationExists = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).toBeNull();
    });
  });
});
