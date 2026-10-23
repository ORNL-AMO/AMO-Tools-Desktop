import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HelpPanelComponent } from './help-panel.component';
import { PsatService } from '../psat.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PsatTabService } from '../psat-tab.service';
import { PSAT, PsatInputs, Modification, ExploreOpportunitiesResults, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_PSAT_INPUTS: PsatInputs = {
  operating_hours: 8760,
  fluidType: 'water',
  fluidTemperature: 60,
};

const MOCK_PSAT: PSAT = { inputs: MOCK_PSAT_INPUTS };

const MOCK_SETTINGS: Settings = { unitsOfMeasure: 'Imperial' } as Settings;

function makeResults(annualSavings: number): ExploreOpportunitiesResults {
  return {
    baselineResults: { pump_efficiency: 80 } as PsatOutputs,
    modificationResults: { pump_efficiency: 85 } as PsatOutputs,
    annualSavings,
    co2EmissionsSavings: 50,
    percentSavings: 10,
  };
}

function makeModification(): Modification {
  return {
    id: 'mod-1',
    psat: { name: 'Modification A', inputs: { ...MOCK_PSAT_INPUTS, whatIfScenario: false } },
  };
}

describe('HelpPanelComponent', () => {
  let component: HelpPanelComponent;
  let fixture: ComponentFixture<HelpPanelComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;

  function configureTestBed(globalSettings: Settings | undefined) {
    // Default to false so ngOnInit's subscribe callback doesn't eagerly call
    // getResults() in every test -- individual calculation-trigger tests set
    // this to true (matching PsatService's real default) explicitly.
    psatServiceSpy = jasmine.createSpyObj(
      'PsatService',
      ['getPsatResults', 'isPsatValid'],
      { getResults: new BehaviorSubject<boolean>(false) }
    );

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings });

    // Matches PsatTabService's real constructor default so the reactive
    // observer test below reflects real initial-emission behavior.
    psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], {
      modifyConditionsTab: new BehaviorSubject<string>('pump-fluid'),
    });

    return TestBed.configureTestingModule({
      declarations: [HelpPanelComponent],
      providers: [
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  beforeEach(async () => {
    await configureTestBed(undefined);

    fixture = TestBed.createComponent(HelpPanelComponent);
    component = fixture.componentInstance;
    // Legacy @Input properties -- ngOnInit's getResults subscription (and
    // getResults() itself) reads psat/settings synchronously, so assign
    // before the first detectChanges() runs ngOnInit.
    component.psat = MOCK_PSAT;
    component.settings = MOCK_SETTINGS;
    component.inSetup = false;
    component.showResults = false;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets currentTab from the initial value of modifyConditionsTab, overriding any bound @Input value', () => {
      expect(component.currentTab).toBe('pump-fluid');
    });

    it('keeps the default results tabSelect when globalSettings has no defaultPanelTab', () => {
      expect(component.tabSelect).toBe('results');
    });

    it('uses globalSettings.defaultPanelTab as the initial tabSelect when present', async () => {
      TestBed.resetTestingModule();
      await configureTestBed({ defaultPanelTab: 'help' } as Settings);

      const otherFixture = TestBed.createComponent(HelpPanelComponent);
      const otherComponent = otherFixture.componentInstance;
      otherComponent.psat = MOCK_PSAT;
      otherComponent.settings = MOCK_SETTINGS;
      otherFixture.detectChanges();

      expect(otherComponent.tabSelect).toBe('help');
    });
  });

  describe('observeGetResultsSignal', () => {
    it('calls getResults when psatService.getResults emits true', () => {
      spyOn(component, 'getResults');
      psatServiceSpy.getResults.next(true);
      expect(component.getResults).toHaveBeenCalled();
    });

    it('does not call getResults when psatService.getResults emits false', () => {
      spyOn(component, 'getResults');
      psatServiceSpy.getResults.next(false);
      expect(component.getResults).not.toHaveBeenCalled();
    });
  });

  describe('observeModifyConditionsTabChange', () => {
    it('updates currentTab when modifyConditionsTab emits a new value', () => {
      psatTabServiceSpy.modifyConditionsTab.next('motor');
      expect(component.currentTab).toBe('motor');
    });
  });

  describe('setTab', () => {
    it('sets tabSelect to the given tab', () => {
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('save', () => {
    it('emits emitSave with true', () => {
      const emitted: boolean[] = [];
      component.emitSave.subscribe(value => emitted.push(value));

      component.save();

      expect(emitted).toEqual([true]);
    });
  });

  describe('getResults', () => {
    it('calls getPsatResults with the baseline inputs and settings and assigns the returned results when there is no modification', () => {
      component.modification = undefined;
      const results = makeResults(100);
      psatServiceSpy.getPsatResults.and.returnValue(results);

      component.getResults();

      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(MOCK_PSAT_INPUTS, MOCK_SETTINGS);
      expect(component.baselineResults).toBe(results.baselineResults);
      expect(component.modificationResults).toBe(results.modificationResults);
      expect(component.annualSavings).toBe(results.annualSavings);
      expect(component.percentSavings).toBe(results.percentSavings);
    });

    it('validates and includes the modification inputs when a modification is present', () => {
      const modification = makeModification();
      component.modification = modification;
      const validity = { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true };
      psatServiceSpy.isPsatValid.and.returnValue(validity);
      const results = makeResults(200);
      psatServiceSpy.getPsatResults.and.returnValue(results);

      component.getResults();

      expect(component.modificationName).toBe('Modification A');
      expect(psatServiceSpy.isPsatValid).toHaveBeenCalledWith(modification.psat.inputs, false);
      expect(modification.psat.valid).toBe(validity);
      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(MOCK_PSAT_INPUTS, MOCK_SETTINGS, modification.psat.inputs);
      expect(component.annualSavings).toBe(200);
    });

    it('renders updated results when getResults is invoked again with different data', () => {
      component.modification = undefined;
      psatServiceSpy.getPsatResults.and.returnValue(makeResults(100));
      component.getResults();

      psatServiceSpy.getPsatResults.and.returnValue(makeResults(300));
      component.getResults();

      expect(component.annualSavings).toBe(300);
    });
  });

  describe('ngOnChanges', () => {
    it('recomputes results when settings changes on a non-first change', () => {
      component.modification = undefined;
      const results = makeResults(150);
      psatServiceSpy.getPsatResults.and.returnValue(results);

      component.ngOnChanges({ settings: new SimpleChange(MOCK_SETTINGS, MOCK_SETTINGS, false) });

      expect(psatServiceSpy.getPsatResults).toHaveBeenCalledWith(MOCK_PSAT_INPUTS, MOCK_SETTINGS);
      expect(component.annualSavings).toBe(150);
    });

    it('does not recompute results when settings changes on the first change', () => {
      psatServiceSpy.getPsatResults.calls.reset();

      component.ngOnChanges({ settings: new SimpleChange(undefined, MOCK_SETTINGS, true) });

      expect(psatServiceSpy.getPsatResults).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('hides the tab bar when inSetup is true and showResults is false', () => {
      component.inSetup = true;
      component.showResults = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.tabs.primary')).toBeNull();
    });

    it('shows the tab bar with all 3 tabs when inSetup is false', () => {
      expect(fixture.nativeElement.querySelector('.tabs.primary')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.panel-tab-item').length).toBe(3);
    });

    it('shows the tab bar but hides the Notes tab when inSetup is true and showResults is true', () => {
      component.inSetup = true;
      component.showResults = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.tabs.primary')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.panel-tab-item').length).toBe(2);
    });

    it('shows the setup header when inSetup is true and showResults is false', () => {
      component.inSetup = true;
      component.showResults = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header')).not.toBeNull();
    });

    it('hides the setup header when inSetup is false', () => {
      expect(fixture.nativeElement.querySelector('.header')).toBeNull();
    });

    it('hides the setup header when inSetup is true and showResults is true', () => {
      component.inSetup = true;
      component.showResults = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header')).toBeNull();
    });

    it('shows the help-panel container when inSetup is true and showResults is false, regardless of tabSelect', () => {
      component.inSetup = true;
      component.showResults = false;
      component.tabSelect = 'results';
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.help-panel')).not.toBeNull();
    });

    it('shows the help-panel container when tabSelect is help, regardless of inSetup/showResults', () => {
      component.setTab('help');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.help-panel')).not.toBeNull();
    });

    it('hides the help-panel container when inSetup is false and tabSelect is not help', () => {
      expect(fixture.nativeElement.querySelector('.help-panel')).toBeNull();
    });

    it('hides every topic-specific help child when the help-panel container itself is hidden', () => {
      component.currentTab = 'operations';
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.help-panel')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-operations-help')).toBeNull();
    });

    it('shows only app-pump-operations-help when help-panel is shown and currentTab is operations', () => {
      component.setTab('help');
      psatTabServiceSpy.modifyConditionsTab.next('operations');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-pump-operations-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-system-basics-help')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-fluid-help')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-motor-help')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-field-data-help')).toBeNull();
    });

    it('shows only app-system-basics-help when help-panel is shown and currentTab is baseline', () => {
      component.setTab('help');
      psatTabServiceSpy.modifyConditionsTab.next('baseline');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-system-basics-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-operations-help')).toBeNull();
    });

    it('shows only app-pump-fluid-help when help-panel is shown and currentTab is pump-fluid', () => {
      component.setTab('help');
      psatTabServiceSpy.modifyConditionsTab.next('pump-fluid');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-pump-fluid-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-motor-help')).toBeNull();
    });

    it('shows only app-motor-help when help-panel is shown and currentTab is motor but hides it when the outer help-panel condition is false', () => {
      psatTabServiceSpy.modifyConditionsTab.next('motor');
      // help-panel itself is not shown yet (inSetup false, tabSelect still 'results')
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-motor-help')).toBeNull();

      component.setTab('help');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-motor-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-field-data-help')).toBeNull();
    });

    it('shows only app-field-data-help when help-panel is shown and currentTab is field-data', () => {
      component.setTab('help');
      psatTabServiceSpy.modifyConditionsTab.next('field-data');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-field-data-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-fluid-help')).toBeNull();
    });

    it('hides both the notes component and the no-modification message when tabSelect is not notes', () => {
      expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
      expect(fixture.nativeElement.querySelector('.col-11.p-4')).toBeNull();
    });

    it('hides both the notes component and the no-modification message when inSetup is true, even if tabSelect is notes', () => {
      component.setTab('notes');
      component.inSetup = true;
      component.modification = makeModification();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
      expect(fixture.nativeElement.querySelector('.col-11.p-4')).toBeNull();
    });

    it('shows the no-modification message when tabSelect is notes, inSetup is false, and there is no modification', () => {
      component.setTab('notes');
      component.modification = undefined;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.col-11.p-4')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).toBeNull();
    });

    it('shows app-modify-conditions-notes when tabSelect is notes, inSetup is false, and a modification is present', () => {
      component.setTab('notes');
      component.modification = makeModification();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-modify-conditions-notes')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.col-11.p-4')).toBeNull();
    });

    it('shows app-explore-opportunities-results when tabSelect is results and inSetup is false', () => {
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).not.toBeNull();
    });

    it('hides app-explore-opportunities-results when tabSelect is not results', () => {
      component.setTab('help');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).toBeNull();
    });

    it('hides app-explore-opportunities-results when tabSelect is results but inSetup is true and showResults is false', () => {
      component.inSetup = true;
      component.showResults = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).toBeNull();
    });

    it('shows app-explore-opportunities-results when tabSelect is results, inSetup is true, and showResults is true', () => {
      component.inSetup = true;
      component.showResults = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-explore-opportunities-results')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops calling getResults after the component is destroyed', () => {
      spyOn(component, 'getResults');
      fixture.destroy();
      psatServiceSpy.getResults.next(true);
      expect(component.getResults).not.toHaveBeenCalled();
    });

    it('stops updating currentTab after the component is destroyed', () => {
      fixture.destroy();
      const before = component.currentTab;
      psatTabServiceSpy.modifyConditionsTab.next('motor');
      expect(component.currentTab).toBe(before);
    });
  });
});
