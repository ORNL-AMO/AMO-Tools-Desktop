import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModifyConditionsComponent } from './modify-conditions.component';
import { AssessmentService } from '../../dashboard/assessment.service';
import { CompareService } from '../compare.service';
import { PsatTabService } from '../psat-tab.service';
import { PsatService } from '../psat.service';
import { PSAT, PsatInputs, Modification } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'hp' } as Settings;

const MOCK_ASSESSMENT = { type: 'PSAT', name: 'Test Assessment' } as Assessment;

function makeModification(): Modification {
  return {
    id: 'mod-1',
    exploreOpportunities: true,
    psat: {
      name: 'Modification 1',
      inputs: {
        operating_hours: 8760,
        fluidType: 'Water',
        fluidTemperature: 60,
        whatIfScenario: false,
      } as PsatInputs,
    } as PSAT,
  };
}

function makePsat(): PSAT {
  return {
    inputs: {
      operating_hours: 8760,
      fluidType: 'Water',
      fluidTemperature: 60,
    } as PsatInputs,
    modifications: [makeModification()],
  };
}

describe('ModifyConditionsComponent', () => {
  let component: ModifyConditionsComponent;
  let fixture: ComponentFixture<ModifyConditionsComponent>;

  let assessmentServiceSpy: jasmine.SpyObj<AssessmentService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let psatTabServiceSpy: jasmine.SpyObj<PsatTabService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;

  let modifyConditionsTab: BehaviorSubject<string>;
  let modalOpen: BehaviorSubject<boolean>;
  let openNewModal: BehaviorSubject<boolean>;

  function setDefaultInputs() {
    component.psat = makePsat();
    component.settings = MOCK_SETTINGS;
    component.assessment = MOCK_ASSESSMENT;
    component.modificationIndex = 0;
    component.modificationExists = true;
    component.containerHeight = 500;
  }

  beforeEach(async () => {
    modifyConditionsTab = new BehaviorSubject<string>('operations');
    modalOpen = new BehaviorSubject<boolean>(false);
    openNewModal = new BehaviorSubject<boolean>(undefined);

    assessmentServiceSpy = jasmine.createSpyObj('AssessmentService', ['getSubTab']);
    assessmentServiceSpy.getSubTab.and.returnValue(undefined);

    compareServiceSpy = jasmine.createSpyObj('CompareService', [], { openNewModal });

    psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], { modifyConditionsTab });

    psatServiceSpy = jasmine.createSpyObj('PsatService', [], { modalOpen });

    await TestBed.configureTestingModule({
      declarations: [ModifyConditionsComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: PsatTabService, useValue: psatTabServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyConditionsComponent);
    component = fixture.componentInstance;
    setDefaultInputs();
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('does not push onto modifyConditionsTab when getSubTab returns nothing', () => {
      expect(modifyConditionsTab.value).toBe('operations');
    });

    it('sets modifyTab from the modifyConditionsTab subscription', () => {
      expect(component.modifyTab).toBe('operations');
    });

    it('sets isModalOpen from the modalOpen subscription initial value', () => {
      expect(component.isModalOpen).toBeFalse();
    });

    it('pushes the sub tab returned by getSubTab onto modifyConditionsTab', () => {
      assessmentServiceSpy.getSubTab.and.returnValue('motor');

      component.ngOnInit();

      expect(modifyConditionsTab.value).toBe('motor');
      expect(component.modifyTab).toBe('motor');
    });
  });

  describe('observeModifyConditionsTabChange', () => {
    it('updates modifyTab when the service emits a new tab', () => {
      modifyConditionsTab.next('pump-fluid');
      expect(component.modifyTab).toBe('pump-fluid');
    });
  });

  describe('observeModalOpenChange', () => {
    it('updates isModalOpen when the service emits a new value', () => {
      modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });
  });

  describe('ngOnChanges', () => {
    it('reduces containerHeight by the small tab select offset height when containerHeight changes after the first change', () => {
      Object.defineProperty(component.smallTabSelect.nativeElement, 'offsetHeight', { value: 40, configurable: true });

      component.ngOnChanges({
        containerHeight: { previousValue: 400, currentValue: 500, firstChange: false, isFirstChange: () => false },
      });

      expect(component.containerHeight).toBe(460);
    });

    it('does not recompute containerHeight on the first change', () => {
      component.ngOnChanges({
        containerHeight: { previousValue: undefined, currentValue: 500, firstChange: true, isFirstChange: () => true },
      });

      expect(component.containerHeight).toBe(500);
    });
  });

  describe('save', () => {
    it('clears exploreOpportunities on the active modification and emits saved when a modification exists', () => {
      const emitted: boolean[] = [];
      component.saved.subscribe((value: boolean) => emitted.push(value));

      component.save();

      expect(component.psat.modifications[0].exploreOpportunities).toBeFalse();
      expect(emitted).toEqual([true]);
    });

    it('emits saved without touching modifications when modificationExists is false', () => {
      component.modificationExists = false;
      const emitted: boolean[] = [];
      component.saved.subscribe((value: boolean) => emitted.push(value));

      component.save();

      expect(component.psat.modifications[0].exploreOpportunities).toBeTrue();
      expect(emitted).toEqual([true]);
    });
  });

  describe('togglePanel', () => {
    it('selects the baseline panel and deselects the modification panel', () => {
      component.baselineSelected = false;
      component.modifiedSelected = true;

      component.togglePanel(false);

      expect(component.baselineSelected).toBeTrue();
      expect(component.modifiedSelected).toBeFalse();
    });

    it('selects the modification panel and deselects the baseline panel', () => {
      component.baselineSelected = true;
      component.modifiedSelected = false;

      component.togglePanel(false);

      expect(component.modifiedSelected).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
    });
  });

  describe('addModification', () => {
    it('pushes true onto openNewModal', () => {
      component.addModification();
      expect(openNewModal.value).toBeTrue();
    });
  });

  describe('setSmallScreenTab', () => {
    it('selects the baseline panel when switching to the baseline tab', () => {
      component.setSmallScreenTab('baseline');

      expect(component.smallScreenTab).toBe('baseline');
      expect(component.baselineSelected).toBeTrue();
      expect(component.modifiedSelected).toBeFalse();
    });

    it('selects the modification panel when switching to the modification tab', () => {
      component.setSmallScreenTab('modification');

      expect(component.smallScreenTab).toBe('modification');
      expect(component.modifiedSelected).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
    });

    it('only updates smallScreenTab when switching to the details tab', () => {
      component.baselineSelected = false;
      component.modifiedSelected = true;

      component.setSmallScreenTab('details');

      expect(component.smallScreenTab).toBe('details');
      expect(component.baselineSelected).toBeFalse();
      expect(component.modifiedSelected).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('hides the assessment container when settings is not set', () => {
      component.settings = undefined;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.modify-conditions')).toBeNull();
    });

    it('shows the assessment container when settings is set', () => {
      expect(fixture.nativeElement.querySelector('.modify-conditions')).not.toBeNull();
    });

    it('shows baseline and modification app-pump-operations and hides the other tab forms when modifyTab is operations', () => {
      modifyConditionsTab.next('operations');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-pump-operations').length).toBe(2);
      expect(fixture.nativeElement.querySelector('app-pump-fluid')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-motor')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-field-data')).toBeNull();
    });

    it('shows baseline and modification app-pump-fluid and hides the other tab forms when modifyTab is pump-fluid', () => {
      modifyConditionsTab.next('pump-fluid');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-pump-fluid').length).toBe(2);
      expect(fixture.nativeElement.querySelector('app-pump-operations')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-motor')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-field-data')).toBeNull();
    });

    it('shows baseline and modification app-motor and hides the other tab forms when modifyTab is motor', () => {
      modifyConditionsTab.next('motor');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-motor').length).toBe(2);
      expect(fixture.nativeElement.querySelector('app-pump-operations')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-fluid')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-field-data')).toBeNull();
    });

    it('shows baseline and modification app-field-data and hides the other tab forms when modifyTab is field-data', () => {
      modifyConditionsTab.next('field-data');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('app-field-data').length).toBe(2);
      expect(fixture.nativeElement.querySelector('app-pump-operations')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-pump-fluid')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-motor')).toBeNull();
    });

    it('shows the modification name header when a modification exists at modificationIndex', () => {
      // Direct-child selector: `.panel-column` also contains a second, always-different
      // "Modification" placeholder header nested inside the `!modificationExists` branch, so a
      // descendant selector would match the wrong h3 once that branch is showing.
      expect(fixture.nativeElement.querySelector('.panel-column > .header > h3').textContent).toContain('Modification 1');
    });

    it('hides the modification name header when there is no modification at modificationIndex', () => {
      // modificationExists tracks whether psat.modifications[modificationIndex] exists; the two
      // are always kept in sync by the parent, so exercise the "no modification yet" state by
      // clearing both together rather than only unsetting the index (which the template assumes
      // never happens while modificationExists is true).
      component.psat.modifications = [];
      component.modificationExists = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.panel-column > .header > h3')).toBeNull();
    });

    it('shows the modification forms and help panel, and hides the add-modification prompt, when modificationExists is true', () => {
      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-help-panel')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Use a form similar to Baseline');
    });

    it('hides the modification forms and help panel, and shows the add-modification prompt, when modificationExists is false', () => {
      component.modificationExists = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-help-panel')).toBeNull();
      const noData = fixture.nativeElement.querySelector('.no-data');
      expect(noData).not.toBeNull();
      expect(noData.textContent).toContain('Add Modified Condition');
      expect(fixture.nativeElement.textContent).toContain('Use a form similar to Baseline');
    });
  });

  describe('destroy', () => {
    it('stops updating modifyTab after the component is destroyed', () => {
      fixture.destroy();

      modifyConditionsTab.next('field-data');

      expect(component.modifyTab).not.toBe('field-data');
    });

    it('stops updating isModalOpen after the component is destroyed', () => {
      fixture.destroy();

      modalOpen.next(true);

      expect(component.isModalOpen).not.toBeTrue();
    });
  });
});
