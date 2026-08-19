import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { PsatService } from '../psat.service';
import { CompareService } from '../compare.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';
import { PSAT, PsatOutputs, PsatValid, ExploreOpportunitiesResults } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_ASSESSMENT = { id: 1 } as Assessment;

function makeOutputs(annualCost: number, co2: number): PsatOutputs {
  return {
    pump_efficiency: 80, motor_rated_power: 50, motor_shaft_power: 45, mover_shaft_power: 45,
    motor_efficiency: 90, motor_power_factor: 0.9, motor_current: 10, motor_power: 40,
    load_factor: 0.8, drive_efficiency: 100, annual_energy: 1000, annual_cost: annualCost,
    annual_savings_potential: 0, optimization_rating: 1, percent_annual_savings: 0, co2EmissionsOutput: co2,
  };
}

const MOCK_RESULTS: ExploreOpportunitiesResults = {
  baselineResults: makeOutputs(1000, 500),
  modificationResults: makeOutputs(800, 400),
  annualSavings: 200,
  co2EmissionsSavings: 100,
  percentSavings: 20,
};

const MOCK_VALID: PsatValid = { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true };

function makePsat(whatIfScenario: boolean): PSAT {
  return {
    inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60 },
    modifications: [
      {
        id: 'mod-1',
        exploreOpportunities: true,
        psat: {
          inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60, whatIfScenario },
          name: 'Modification 1',
        },
      },
    ],
  };
}

describe('ExploreOpportunitiesComponent', () => {
  let component: ExploreOpportunitiesComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
  let openNewModalSpy: jasmine.SpyObj<{ next: (v: boolean) => void }>;
  let settingsDbServiceStub: { globalSettings: any };

  function setupComponent(target: ExploreOpportunitiesComponent) {
    target.assessment = MOCK_ASSESSMENT;
    target.settings = MOCK_SETTINGS;
    target.psat = makePsat(true);
    target.modificationIndex = 0;
    target.modificationExists = true;
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['isPsatValid', 'getPsatResults']);
    psatServiceSpy.isPsatValid.and.returnValue(MOCK_VALID);
    psatServiceSpy.getPsatResults.and.returnValue(MOCK_RESULTS);

    openNewModalSpy = jasmine.createSpyObj('BehaviorSubject', ['next']);
    compareServiceSpy = jasmine.createSpyObj('CompareService', [], { openNewModal: openNewModalSpy });

    snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['setSnackbarMessage']);

    settingsDbServiceStub = { globalSettings: undefined };

    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceStub },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('keeps the default results tab when there is no global default panel tab', () => {
      expect(component.tabSelect).toBe('results');
    });

    it('sets tabSelect from globalSettings.defaultPanelTab when present', () => {
      settingsDbServiceStub.globalSettings = { defaultPanelTab: 'sankey' };
      const freshFixture = TestBed.createComponent(ExploreOpportunitiesComponent);
      setupComponent(freshFixture.componentInstance);
      freshFixture.detectChanges();

      expect(freshFixture.componentInstance.tabSelect).toBe('sankey');
    });

    it('calls getResults on init and assigns the returned results to the component', () => {
      expect(component.baselineResults).toEqual(MOCK_RESULTS.baselineResults);
      expect(component.modificationResults).toEqual(MOCK_RESULTS.modificationResults);
      expect(component.annualSavings).toBe(MOCK_RESULTS.annualSavings);
      expect(component.percentSavings).toBe(MOCK_RESULTS.percentSavings);
      expect(component.co2EmissionsSavings).toBe(MOCK_RESULTS.co2EmissionsSavings);
    });
  });

  describe('getResults', () => {
    it('validates against the modification inputs and passes them as the modification scenario when whatIfScenario is true', () => {
      component.psat = makePsat(true);
      psatServiceSpy.isPsatValid.calls.reset();
      psatServiceSpy.getPsatResults.calls.reset();

      component.getResults();

      expect(psatServiceSpy.isPsatValid).toHaveBeenCalledWith(component.psat.modifications[0].psat.inputs, false);
      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(component.psat.inputs, component.settings, component.psat.modifications[0].psat.inputs);
    });

    it('validates as a baseline and mirrors baseline results into modification results when whatIfScenario is false', () => {
      component.psat = makePsat(false);
      psatServiceSpy.isPsatValid.calls.reset();
      psatServiceSpy.getPsatResults.calls.reset();
      psatServiceSpy.getPsatResults.and.returnValue({ ...MOCK_RESULTS, modificationResults: makeOutputs(999, 999) });

      component.getResults();

      expect(psatServiceSpy.isPsatValid).toHaveBeenCalledWith(component.psat.modifications[0].psat.inputs, true);
      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(component.psat.inputs, component.settings);
      expect(component.modificationResults).toEqual(component.baselineResults);
    });

    it('validates the baseline psat and does not pass a modification input when modificationExists is false', () => {
      component.modificationExists = false;
      psatServiceSpy.isPsatValid.calls.reset();
      psatServiceSpy.getPsatResults.calls.reset();

      component.getResults();

      expect(psatServiceSpy.isPsatValid).toHaveBeenCalledWith(component.psat.inputs, true);
      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(component.psat.inputs, component.settings);
      expect(component.psat.valid).toBe(MOCK_VALID);
    });
  });

  describe('ngOnChanges', () => {
    it('does not recalculate results when modificationIndex changes for the first time', () => {
      psatServiceSpy.getPsatResults.calls.reset();

      component.ngOnChanges({ modificationIndex: new SimpleChange(undefined, 0, true) });

      expect(psatServiceSpy.getPsatResults).not.toHaveBeenCalled();
    });

    it('recalculates results and notifies exploreOpportunities when modificationIndex changes after the first change', () => {
      psatServiceSpy.getPsatResults.calls.reset();
      snackbarServiceSpy.setSnackbarMessage.calls.reset();
      component.psat.modifications[0].exploreOpportunities = false;

      component.ngOnChanges({ modificationIndex: new SimpleChange(0, 1, false) });

      expect(psatServiceSpy.getPsatResults).toHaveBeenCalled();
      expect(snackbarServiceSpy.setSnackbarMessage).toHaveBeenCalledWith('exploreOpportunities', 'info', 'long');
    });
  });

  describe('save', () => {
    it('emits saved when save is called', () => {
      const emitted: boolean[] = [];
      component.saved.subscribe(value => emitted.push(value));

      component.save();

      expect(emitted).toEqual([true]);
    });
  });

  describe('addNewMod', () => {
    it('emits emitAddNewMod when addNewMod is called', () => {
      const emitted: boolean[] = [];
      component.emitAddNewMod.subscribe(value => emitted.push(value));

      component.addNewMod();

      expect(emitted).toEqual([true]);
    });
  });

  describe('setTab', () => {
    it('sets tabSelect to the given tab name', () => {
      component.setTab('sankey');
      expect(component.tabSelect).toBe('sankey');
    });
  });

  describe('setSmallScreenTab', () => {
    it('sets smallScreenTab to the given tab name', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('focusField', () => {
    it('sets currentField to the given field name', () => {
      component.focusField('flow_rate');
      expect(component.currentField).toBe('flow_rate');
    });
  });

  describe('addExploreOpp', () => {
    it('opens the new modification modal via the compare service', () => {
      component.addExploreOpp();
      expect(openNewModalSpy.next).toHaveBeenCalledWith(true);
    });
  });

  describe('notifyExploreOpps', () => {
    it('shows the exploreOpportunities snackbar message when the current modification has not opted in', () => {
      component.psat.modifications[0].exploreOpportunities = false;
      snackbarServiceSpy.setSnackbarMessage.calls.reset();

      component.notifyExploreOpps();

      expect(snackbarServiceSpy.setSnackbarMessage).toHaveBeenCalledWith('exploreOpportunities', 'info', 'long');
    });

    it('does not show the snackbar message when the current modification has already opted in', () => {
      component.psat.modifications[0].exploreOpportunities = true;
      snackbarServiceSpy.setSnackbarMessage.calls.reset();

      component.notifyExploreOpps();

      expect(snackbarServiceSpy.setSnackbarMessage).not.toHaveBeenCalled();
    });

    it('does not show the snackbar message when modificationExists is false', () => {
      component.modificationExists = false;
      snackbarServiceSpy.setSnackbarMessage.calls.reset();

      component.notifyExploreOpps();

      expect(snackbarServiceSpy.setSnackbarMessage).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('shows the explore-opportunities-form when modificationExists and whatIfScenario is true', () => {
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).not.toBeNull();
    });

    it('hides the explore-opportunities-form and shows the compare-pumps warning when whatIfScenario is false', () => {
      component.psat = makePsat(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('COMPARE TWO PUMPS');
    });

    it('hides the compare-pumps warning when whatIfScenario is true', () => {
      expect(fixture.nativeElement.textContent).not.toContain('COMPARE TWO PUMPS');
    });

    it('hides the lookup-form panel and shows the no-data panel when modificationExists is false', () => {
      component.modificationExists = false;
      fixture.detectChanges();
      // Note: the "no-data" panel also carries a "lookup-form" class in the template, so
      // ".panel-column" (unique to the modificationExists panel) distinguishes the two.
      expect(fixture.nativeElement.querySelector('.panel-column')).toBeNull();
      expect(fixture.nativeElement.querySelector('.no-data')).not.toBeNull();
    });

    it('hides the no-data panel when modificationExists is true', () => {
      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
    });

    it('hides the help panel when tabSelect is not help', () => {
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).toBeNull();
    });

    it('shows the help panel when tabSelect is help', () => {
      component.tabSelect = 'help';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).not.toBeNull();
    });

    it('hides the sankey section when tabSelect is sankey but modificationExists is false', () => {
      component.tabSelect = 'sankey';
      component.modificationExists = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(0);
    });

    it('hides both sankey variants when sankeyView matches neither Baseline nor Modified', () => {
      component.tabSelect = 'sankey';
      component.sankeyView = 'Other';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(0);
    });

    it('shows exactly one sankey element when sankeyView is Baseline', () => {
      component.tabSelect = 'sankey';
      component.sankeyView = 'Baseline';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(1);
    });

    it('shows exactly one sankey element when sankeyView is Modified', () => {
      component.tabSelect = 'sankey';
      component.sankeyView = 'Modified';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(1);
    });

    it('shows explore-opportunities-results when modificationExists and tabSelect is results', () => {
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).not.toBeNull();
    });

    it('hides explore-opportunities-results when tabSelect is not results', () => {
      component.tabSelect = 'help';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).toBeNull();
    });

    it('hides explore-opportunities-results when modificationExists is false even if tabSelect is results', () => {
      component.modificationExists = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).toBeNull();
    });

    it('shows the "view results" message when modificationExists is false and tabSelect is not help', () => {
      component.modificationExists = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Explore Opportunities to view results');
    });

    it('hides the "view results" message when tabSelect is help even though modificationExists is false', () => {
      component.modificationExists = false;
      component.tabSelect = 'help';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Explore Opportunities to view results');
    });

    it('hides the "view results" message when modificationExists is true', () => {
      expect(fixture.nativeElement.textContent).not.toContain('Explore Opportunities to view results');
    });
  });
});
