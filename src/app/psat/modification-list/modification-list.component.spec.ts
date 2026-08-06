import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModificationListComponent } from './modification-list.component';
import { CompareService } from '../compare.service';
import { PsatService } from '../psat.service';
import { PsatTabService } from '../psat-tab.service';
import { Modification, PSAT, PsatOutputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeModification(id: string, name: string, whatIfScenario: boolean = true): Modification {
  return {
    id,
    psat: {
      name,
      inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60, whatIfScenario },
    },
  };
}

function makePsat(modifications: Modification[]): PSAT {
  return {
    inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60 },
    modifications,
  };
}

function makeOutputs(pumpEfficiency: number): PsatOutputs {
  return {
    pump_efficiency: pumpEfficiency, motor_rated_power: 50, motor_shaft_power: 45, mover_shaft_power: 45,
    motor_efficiency: 90, motor_power_factor: 0.9, motor_current: 10, motor_power: 40,
    load_factor: 0.8, drive_efficiency: 100, annual_energy: 1000, annual_cost: 500,
    annual_savings_potential: 0, optimization_rating: 1, percent_annual_savings: 0, co2EmissionsOutput: 0,
  };
}

describe('ModificationListComponent', () => {
  let component: ModificationListComponent;
  let fixture: ComponentFixture<ModificationListComponent>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let secondaryTab: BehaviorSubject<string>;
  let getResultsSpy: jasmine.SpyObj<{ next: (v: boolean) => void }>;
  let modifyConditionsTabSpy: jasmine.SpyObj<{ next: (v: string) => void }>;

  function initWithPsat(psat: PSAT, modificationIndex: number = 0) {
    component.psat = psat;
    component.modificationIndex = modificationIndex;
    component.settings = MOCK_SETTINGS;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    secondaryTab = new BehaviorSubject<string>('modify-conditions');
    getResultsSpy = jasmine.createSpyObj('BehaviorSubject', ['next']);
    modifyConditionsTabSpy = jasmine.createSpyObj('BehaviorSubject', ['next']);

    compareServiceSpy = jasmine.createSpyObj('CompareService', ['setCompareVals', 'getBadges']);
    compareServiceSpy.getBadges.and.returnValue([]);

    psatServiceSpy = jasmine.createSpyObj('PsatService', ['resultsExisting'], { getResults: getResultsSpy });
    psatServiceSpy.resultsExisting.and.returnValue(makeOutputs(80));

    psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], { secondaryTab, modifyConditionsTab: modifyConditionsTabSpy });

    await TestBed.configureTestingModule({
      declarations: [ModificationListComponent],
      providers: [
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificationListComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      initWithPsat(makePsat([]));
      expect(component).toBeTruthy();
    });

    it('sizes dropdown, rename, and deleteArr to the number of modifications', () => {
      const mods = [makeModification('mod-0', 'Scenario 1'), makeModification('mod-1', 'Scenario 2')];
      initWithPsat(makePsat(mods));

      expect(component.dropdown.length).toBe(2);
      expect(component.rename.length).toBe(2);
      expect(component.deleteArr.length).toBe(2);
    });

    it('sets asssessmentTab from the current value of secondaryTab', () => {
      initWithPsat(makePsat([]));
      expect(component.asssessmentTab).toBe('modify-conditions');
    });
  });

  describe('observeSecondaryTabChange', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('updates asssessmentTab when secondaryTab emits a new value', () => {
      secondaryTab.next('explore-opportunities');
      expect(component.asssessmentTab).toBe('explore-opportunities');
    });

    it('causes a subsequently added modification to be flagged exploreOpportunities', () => {
      secondaryTab.next('explore-opportunities');
      component.newModificationName = 'Copy';

      component.addNewModification();

      expect(component.psat.modifications[1].exploreOpportunities).toBeTrue();
    });
  });

  describe('showDropdown', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('opens the dropdown for the given index when closed', () => {
      component.showDropdown(0);
      expect(component.dropdown[0]).toBeTrue();
    });

    it('closes the dropdown for the given index when already open', () => {
      component.showDropdown(0);
      component.showDropdown(0);
      expect(component.dropdown[0]).toBeFalse();
    });
  });

  describe('renameMod', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('closes the dropdown and opens rename for the given index', () => {
      component.dropdown[0] = true;
      component.renameMod(0);
      expect(component.dropdown[0]).toBeFalse();
      expect(component.rename[0]).toBeTrue();
    });

    it('closes rename when called again', () => {
      component.renameMod(0);
      component.renameMod(0);
      expect(component.rename[0]).toBeFalse();
    });
  });

  describe('deleteMod', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('closes the dropdown and opens the delete confirmation for the given index', () => {
      component.dropdown[0] = true;
      component.deleteMod(0);
      expect(component.dropdown[0]).toBeFalse();
      expect(component.deleteArr[0]).toBeTrue();
    });

    it('closes the delete confirmation when called again', () => {
      component.deleteMod(0);
      component.deleteMod(0);
      expect(component.deleteArr[0]).toBeFalse();
    });
  });

  describe('saveScenarioChange', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1', false)]), 0);
    });

    it('sets whatIfScenario on the target modification, saves, and selects it with close', () => {
      const savedEmitted: boolean[] = [];
      const closedEmitted: boolean[] = [];
      component.save.subscribe(v => savedEmitted.push(v));
      component.close.subscribe(v => closedEmitted.push(v));

      component.saveScenarioChange(true, 0);

      expect(component.psat.modifications[0].psat.inputs.whatIfScenario).toBeTrue();
      expect(savedEmitted).toEqual([true]);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 0);
      expect(closedEmitted).toEqual([true]);
    });
  });

  describe('selectModification', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('sets compare values and refreshes results without closing when close is not passed', () => {
      const closedEmitted: boolean[] = [];
      component.close.subscribe(v => closedEmitted.push(v));

      component.selectModification(0);

      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 0);
      expect(getResultsSpy.next).toHaveBeenCalledWith(true);
      expect(closedEmitted).toEqual([]);
    });

    it('emits close when close is passed as true', () => {
      const closedEmitted: boolean[] = [];
      component.close.subscribe(v => closedEmitted.push(v));

      component.selectModification(0, true);

      expect(closedEmitted).toEqual([true]);
    });
  });

  describe('goToModification', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('sets modifyConditionsTab and selects the modification with close', () => {
      const closedEmitted: boolean[] = [];
      component.close.subscribe(v => closedEmitted.push(v));

      component.goToModification(0, 'motor');

      expect(modifyConditionsTabSpy.next).toHaveBeenCalledWith('motor');
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 0);
      expect(closedEmitted).toEqual([true]);
    });
  });

  describe('selectModificationBadge', () => {
    let mod0: Modification;

    beforeEach(() => {
      mod0 = makeModification('mod-0', 'Scenario 1');
      initWithPsat(makePsat([mod0]));
    });

    it('navigates directly to the single differing component when exactly one badge exists', () => {
      compareServiceSpy.getBadges.and.returnValue([{ badge: 'Motor', componentStr: 'motor' }]);

      component.selectModificationBadge(mod0.psat, 0);

      expect(modifyConditionsTabSpy.next).toHaveBeenCalledWith('motor');
    });

    it('navigates to field-data when there are no differing badges', () => {
      compareServiceSpy.getBadges.and.returnValue([]);

      component.selectModificationBadge(mod0.psat, 0);

      expect(modifyConditionsTabSpy.next).toHaveBeenCalledWith('field-data');
    });

    it('navigates to field-data when there is more than one differing badge', () => {
      compareServiceSpy.getBadges.and.returnValue([
        { badge: 'Motor', componentStr: 'motor' },
        { badge: 'Pump Fluid', componentStr: 'pump-fluid' },
      ]);

      component.selectModificationBadge(mod0.psat, 0);

      expect(modifyConditionsTabSpy.next).toHaveBeenCalledWith('field-data');
    });
  });

  describe('getBadges', () => {
    let mod0: Modification;

    beforeEach(() => {
      mod0 = makeModification('mod-0', 'Scenario 1');
      initWithPsat(makePsat([mod0]));
    });

    it('returns an empty array when the modification is falsy', () => {
      expect(component.getBadges(undefined)).toEqual([]);
    });

    it('delegates to compareService.getBadges with the current psat and settings when the modification is truthy', () => {
      const badges = [{ badge: 'Motor', componentStr: 'motor' }];
      compareServiceSpy.getBadges.and.returnValue(badges);

      const result = component.getBadges(mod0.psat);

      expect(compareServiceSpy.getBadges).toHaveBeenCalledWith(component.psat, mod0.psat, MOCK_SETTINGS);
      expect(result).toBe(badges);
    });
  });

  describe('deleteModification', () => {
    it('sets compare values to index 0 and emits close and save when the last modification is removed', () => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]), 0);
      const savedEmitted: boolean[] = [];
      const closedEmitted: boolean[] = [];
      component.save.subscribe(v => savedEmitted.push(v));
      component.close.subscribe(v => closedEmitted.push(v));

      component.deleteModification(0);

      expect(component.psat.modifications.length).toBe(0);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 0);
      expect(closedEmitted).toEqual([true]);
      expect(savedEmitted).toEqual([true]);
    });

    it('selects index 0 without closing when the deleted index equals modificationIndex and modifications remain', () => {
      const mods = [makeModification('mod-0', 'Scenario 1'), makeModification('mod-1', 'Scenario 2')];
      initWithPsat(makePsat(mods), 0);
      const closedEmitted: boolean[] = [];
      component.close.subscribe(v => closedEmitted.push(v));

      component.deleteModification(0);

      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 0);
      expect(closedEmitted).toEqual([]);
      expect(component.dropdown.length).toBe(1);
    });

    it('selects modificationIndex - 1 when the deleted index is before modificationIndex', () => {
      const mods = [
        makeModification('mod-0', 'Scenario 1'),
        makeModification('mod-1', 'Scenario 2'),
        makeModification('mod-2', 'Scenario 3'),
      ];
      initWithPsat(makePsat(mods), 2);

      component.deleteModification(0);

      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 1);
    });

    it('does not reselect when the deleted index is after modificationIndex', () => {
      const mods = [
        makeModification('mod-0', 'Scenario 1'),
        makeModification('mod-1', 'Scenario 2'),
        makeModification('mod-2', 'Scenario 3'),
      ];
      initWithPsat(makePsat(mods), 0);
      compareServiceSpy.setCompareVals.calls.reset();

      component.deleteModification(2);

      expect(compareServiceSpy.setCompareVals).not.toHaveBeenCalled();
    });
  });

  describe('saveUpdates', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('emits save and turns off rename mode for the given index', () => {
      component.rename[0] = true;
      const savedEmitted: boolean[] = [];
      component.save.subscribe(v => savedEmitted.push(v));

      component.saveUpdates(0);

      expect(savedEmitted).toEqual([true]);
      expect(component.rename[0]).toBeFalse();
    });
  });

  describe('addNewModification', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('calls resultsExisting with the baseline psat inputs and current settings', () => {
      component.newModificationName = 'Copy';
      component.addNewModification();

      expect(psatServiceSpy.resultsExisting).toHaveBeenCalledWith(component.psat.inputs, MOCK_SETTINGS);
    });

    it('appends a new modification using newModificationName when no source psat is given', () => {
      component.newModificationName = 'My Copy';
      const savedEmitted: boolean[] = [];
      component.save.subscribe(v => savedEmitted.push(v));

      component.addNewModification();

      expect(component.psat.modifications.length).toBe(2);
      const added = component.psat.modifications[1];
      expect(added.psat.name).toBe('My Copy');
      expect(added.psat.inputs.whatIfScenario).toBeTrue();
      expect(added.psat.inputs.pump_specified).toBe(80);
      expect(savedEmitted).toEqual([true]);
      expect(component.newModificationName).toBeUndefined();
    });

    it('clones inputs from this.psat (the baseline) when no source psat is given', () => {
      component.psat.inputs.fluidTemperature = 60;
      component.newModificationName = 'My Copy';

      component.addNewModification();

      expect(component.psat.modifications[1].psat.inputs.fluidTemperature).toBe(60);
    });

    it('clones inputs from the given source psat and derives the name from it, suffixed with the match count', () => {
      const sourceMod = component.psat.modifications[0];
      sourceMod.psat.inputs.fluidTemperature = 111;

      component.addNewModification(sourceMod.psat);

      // Scenario 1's name matches itself once among existing modifications, so the
      // component's (buggy) always-suffix logic appends "(1)" even for a first copy.
      expect(component.psat.modifications[1].psat.name).toBe('Scenario 1(1)');
      expect(component.psat.modifications[1].psat.inputs.fluidTemperature).toBe(111);
    });

    it('flags the new modification exploreOpportunities when asssessmentTab is explore-opportunities', () => {
      component.asssessmentTab = 'explore-opportunities';
      component.newModificationName = 'Copy';

      component.addNewModification();

      expect(component.psat.modifications[1].exploreOpportunities).toBeTrue();
    });

    it('does not flag exploreOpportunities when asssessmentTab is not explore-opportunities', () => {
      component.asssessmentTab = 'modify-conditions';
      component.newModificationName = 'Copy';

      component.addNewModification();

      expect(component.psat.modifications[1].exploreOpportunities).toBeUndefined();
    });

    it('mirrors userEnteredBaselineEmissions into userEnteredModificationEmissions when co2SavingsData is present', () => {
      component.psat.inputs.co2SavingsData = { userEnteredBaselineEmissions: true } as any;
      component.newModificationName = 'Copy';

      component.addNewModification();

      expect(component.psat.modifications[1].psat.inputs.co2SavingsData.userEnteredModificationEmissions).toBeTrue();
    });

    it('selects the newly added modification without closing', () => {
      component.newModificationName = 'Copy';
      const closedEmitted: boolean[] = [];
      component.close.subscribe(v => closedEmitted.push(v));

      component.addNewModification();

      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.psat, 1);
      expect(closedEmitted).toEqual([]);
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));
    });

    it('shows the name link and hides rename/delete controls by default', () => {
      expect(fixture.nativeElement.querySelector('.click-link')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.input-group')).toBeNull();
      expect(fixture.nativeElement.querySelector('.btn-danger')).toBeNull();
    });

    it('shows the rename input and hides the name link and delete controls when rename is active', () => {
      component.rename[0] = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.click-link')).toBeNull();
      expect(fixture.nativeElement.querySelector('.input-group')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.btn-danger')).toBeNull();
    });

    it('shows the delete confirmation and hides the name link and rename input when delete is active', () => {
      component.deleteArr[0] = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.click-link')).toBeNull();
      expect(fixture.nativeElement.querySelector('.input-group')).toBeNull();
      expect(fixture.nativeElement.querySelector('.btn-danger')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating asssessmentTab after the component is destroyed', () => {
      initWithPsat(makePsat([makeModification('mod-0', 'Scenario 1')]));

      fixture.destroy();
      secondaryTab.next('explore-opportunities');

      expect(component.asssessmentTab).toBe('modify-conditions');
    });
  });
});
