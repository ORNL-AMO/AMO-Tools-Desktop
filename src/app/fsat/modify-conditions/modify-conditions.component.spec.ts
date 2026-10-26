import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ModifyConditionsComponent } from './modify-conditions.component';
import { ModifyConditionsService } from './modify-conditions.service';
import { FsatService } from '../fsat.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { BaseGasDensity, FanMotor, FanSetup, FieldData, FSAT, FsatOperations, Modification } from '../../shared/models/fans';

const FORM_TAGS = ['app-operations', 'app-fsat-fluid', 'app-fan-setup', 'app-fan-motor', 'app-fan-field-data'];

const TAB_FORMS: Array<{ tab: string; tags: string[] }> = [
  { tab: 'fan-operations', tags: ['app-operations'] },
  { tab: 'fan-setup', tags: ['app-fsat-fluid', 'app-fan-setup'] },
  { tab: 'fan-motor', tags: ['app-fan-motor'] },
  { tab: 'fan-field-data', tags: ['app-fan-field-data'] },
];

function makeModification(name: string, whatIfScenario: boolean): Modification {
  return {
    id: name,
    exploreOpportunities: true,
    fsat: { name, whatIfScenario } as FSAT,
  };
}

function makeAssessment(modifications: Modification[] = []): Assessment {
  return { fsat: { name: 'Baseline', modifications } as FSAT } as Assessment;
}

describe('ModifyConditionsComponent', () => {
  let component: ModifyConditionsComponent;
  let fixture: ComponentFixture<ModifyConditionsComponent>;
  let host: HTMLElement;
  let tabSubject: BehaviorSubject<string>;
  let modalOpenSubject: BehaviorSubject<boolean>;
  let openNewModalSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    tabSubject = new BehaviorSubject<string>('fan-operations');
    modalOpenSubject = new BehaviorSubject<boolean>(false);
    openNewModalSubject = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ModifyConditionsComponent],
      providers: [
        { provide: ModifyConditionsService, useValue: jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab: tabSubject }) },
        { provide: FsatService, useValue: jasmine.createSpyObj('FsatService', [], { modalOpen: modalOpenSubject, openNewModal: openNewModalSubject }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function setup(options: {
    assessment?: Assessment;
    modificationExists?: boolean;
    modificationIndex?: number;
    settings?: Settings | undefined;
    tab?: string;
  } = {}): void {
    if (options.tab) {
      tabSubject.next(options.tab);
    }
    fixture = TestBed.createComponent(ModifyConditionsComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    component.assessment = options.assessment ?? makeAssessment();
    component.settings = 'settings' in options ? options.settings : ({ unitsOfMeasure: 'Imperial' } as Settings);
    component.modificationExists = options.modificationExists ?? false;
    component.modificationIndex = options.modificationIndex ?? 0;
    component.containerHeight = 600;
    fixture.detectChanges();
  }

  function baselinePanel(): HTMLElement {
    return host.querySelector('.assessment-content-panel.baseline');
  }

  function modificationPanel(): HTMLElement {
    return host.querySelector('.assessment-content-panel.panel-column');
  }

  function helpPanel(): HTMLElement {
    return host.querySelector('.help-panel');
  }

  function presentTags(panel: HTMLElement, tags: string[]): string[] {
    return tags.filter(tag => panel.querySelector(tag) !== null);
  }

  describe('initialization', () => {
    it('creates the component', () => {
      setup();
      expect(component).toBeTruthy();
    });

    it('reads the current modify conditions tab from the service', () => {
      setup({ tab: 'fan-motor' });
      expect(component.modifyConditionsTab).toBe('fan-motor');
    });

    it('reads the modal open state from the service', () => {
      modalOpenSubject.next(true);
      setup();
      expect(component.isModalOpen).toBeTrue();
    });

    it('starts with the modification panel selected', () => {
      setup();
      expect(component.baselineSelected).toBeFalse();
      expect(component.modifiedSelected).toBeTrue();
      expect(component.smallScreenTab).toBe('baseline');
    });
  });

  describe('observers', () => {
    it('shows the forms for a new tab when the service emits it', () => {
      setup({ tab: 'fan-operations' });
      expect(baselinePanel().querySelector('app-fan-motor')).toBeNull();

      tabSubject.next('fan-motor');
      fixture.detectChanges();

      expect(baselinePanel().querySelector('app-fan-motor')).not.toBeNull();
      expect(baselinePanel().querySelector('app-operations')).toBeNull();
    });

    it('marks both panels as modal-open when the modal opens and clears it when it closes', () => {
      setup();
      expect(baselinePanel().classList).not.toContain('modal-open');

      modalOpenSubject.next(true);
      fixture.detectChanges();
      expect(baselinePanel().classList).toContain('modal-open');
      expect(modificationPanel().classList).toContain('modal-open');

      modalOpenSubject.next(false);
      fixture.detectChanges();
      expect(baselinePanel().classList).not.toContain('modal-open');
      expect(modificationPanel().classList).not.toContain('modal-open');
    });
  });

  describe('template visibility', () => {
    describe('settings', () => {
      it('renders nothing when settings are not available', () => {
        setup({ settings: undefined });
        expect(host.querySelector('.modify-conditions')).toBeNull();
        expect(baselinePanel()).toBeNull();
      });

      it('renders the panels when settings are available', () => {
        setup();
        expect(host.querySelector('.modify-conditions')).not.toBeNull();
        expect(baselinePanel()).not.toBeNull();
        expect(modificationPanel()).not.toBeNull();
        expect(helpPanel()).not.toBeNull();
      });
    });

    describe('baseline forms by tab', () => {
      TAB_FORMS.forEach(({ tab, tags }) => {
        it(`shows only ${tags.join(' and ')} in the baseline panel when the tab is ${tab}`, () => {
          setup({ tab });
          expect(presentTags(baselinePanel(), FORM_TAGS)).toEqual(FORM_TAGS.filter(t => tags.includes(t)));
        });
      });

      it('shows no baseline form when the tab is not one of the form tabs', () => {
        setup({ tab: 'some-other-tab' });
        expect(presentTags(baselinePanel(), FORM_TAGS)).toEqual([]);
      });

      it('shows the baseline forms even when no modification exists', () => {
        setup({ tab: 'fan-setup', modificationExists: false });
        expect(presentTags(baselinePanel(), FORM_TAGS).length).toBe(2);
      });
    });

    describe('when a modification does not exist', () => {
      it('shows the add modification prompt in the modification panel', () => {
        setup({ modificationExists: false });
        const prompt = modificationPanel().querySelector('.no-data');
        expect(prompt).not.toBeNull();
        expect(prompt.querySelector('button').textContent).toContain('Add Modified Condition');
        expect(modificationPanel().querySelector('h3').textContent.trim()).toBe('Modification');
      });

      it('shows no modification forms for any tab', () => {
        TAB_FORMS.forEach(({ tab }) => {
          setup({ modificationExists: false, tab });
          expect(presentTags(modificationPanel(), FORM_TAGS)).toEqual([]);
          expect(modificationPanel().querySelector('app-modify-field-data-form')).toBeNull();
        });
      });

      it('shows the placeholder help text instead of the help panel', () => {
        setup({ modificationExists: false });
        expect(helpPanel().querySelector('app-help-panel')).toBeNull();
        expect(helpPanel().textContent).toContain('Add Modification to view results and get additional help.');
      });
    });

    describe('when a modification exists', () => {
      const assessmentWithMod = (whatIfScenario: boolean = false) => makeAssessment([makeModification('Scenario 1', whatIfScenario)]);

      it('hides the add modification prompt', () => {
        setup({ assessment: assessmentWithMod(), modificationExists: true });
        expect(modificationPanel().querySelector('.no-data')).toBeNull();
      });

      it('shows the modification name as the panel header', () => {
        setup({ assessment: assessmentWithMod(), modificationExists: true });
        expect(modificationPanel().querySelector('.header h3').textContent.trim()).toBe('Scenario 1');
      });

      it('uses the selected modification by index', () => {
        const assessment = makeAssessment([makeModification('First', false), makeModification('Second', false)]);
        setup({ assessment, modificationExists: true, modificationIndex: 1 });
        expect(modificationPanel().querySelector('.header h3').textContent.trim()).toBe('Second');
      });

      TAB_FORMS.forEach(({ tab, tags }) => {
        it(`shows only ${tags.join(' and ')} in the modification panel when the tab is ${tab}`, () => {
          setup({ assessment: assessmentWithMod(false), modificationExists: true, tab });
          expect(presentTags(modificationPanel(), FORM_TAGS)).toEqual(FORM_TAGS.filter(t => tags.includes(t)));
        });
      });

      it('shows no modification form when the tab is not one of the form tabs', () => {
        setup({ assessment: assessmentWithMod(true), modificationExists: true, tab: 'some-other-tab' });
        expect(presentTags(modificationPanel(), FORM_TAGS)).toEqual([]);
        expect(modificationPanel().querySelector('app-modify-field-data-form')).toBeNull();
      });

      it('shows the modify field data form on the field data tab for a what-if scenario', () => {
        setup({ assessment: assessmentWithMod(true), modificationExists: true, tab: 'fan-field-data' });
        expect(modificationPanel().querySelector('app-modify-field-data-form')).not.toBeNull();
        expect(modificationPanel().querySelector('app-fan-field-data')).not.toBeNull();
      });

      it('hides the modify field data form on the field data tab when the modification is not a what-if scenario', () => {
        setup({ assessment: assessmentWithMod(false), modificationExists: true, tab: 'fan-field-data' });
        expect(modificationPanel().querySelector('app-fan-field-data')).not.toBeNull();
        expect(modificationPanel().querySelector('app-modify-field-data-form')).toBeNull();
      });

      it('hides the modify field data form on other tabs even for a what-if scenario', () => {
        setup({ assessment: assessmentWithMod(true), modificationExists: true, tab: 'fan-motor' });
        expect(modificationPanel().querySelector('app-modify-field-data-form')).toBeNull();
      });

      it('shows the help panel instead of the placeholder text', () => {
        setup({ assessment: assessmentWithMod(), modificationExists: true });
        expect(helpPanel().querySelector('app-help-panel')).not.toBeNull();
        expect(helpPanel().textContent).not.toContain('Add Modification to view results and get additional help.');
      });
    });
  });

  describe('user actions', () => {
    describe('togglePanel', () => {
      it('selects the baseline panel when the unselected baseline panel is clicked', () => {
        setup();
        baselinePanel().click();
        fixture.detectChanges();

        expect(component.baselineSelected).toBeTrue();
        expect(component.modifiedSelected).toBeFalse();
        expect(modificationPanel().classList).toContain('disabled');
        expect(baselinePanel().classList).not.toContain('disabled');
      });

      it('selects the modification panel when the unselected modification panel is clicked', () => {
        setup();
        baselinePanel().click();
        modificationPanel().click();
        fixture.detectChanges();

        expect(component.modifiedSelected).toBeTrue();
        expect(component.baselineSelected).toBeFalse();
        expect(baselinePanel().classList).toContain('disabled');
        expect(modificationPanel().classList).not.toContain('disabled');
      });

      it('keeps the selection when the already selected panel is clicked', () => {
        setup();
        modificationPanel().click();
        expect(component.modifiedSelected).toBeTrue();
        expect(component.baselineSelected).toBeFalse();

        baselinePanel().click();
        baselinePanel().click();
        expect(component.baselineSelected).toBeTrue();
        expect(component.modifiedSelected).toBeFalse();
      });
    });

    describe('setSmallScreenTab', () => {
      it('selects the baseline panel and marks only the baseline panel as the small screen tab', () => {
        setup();
        component.setSmallScreenTab('baseline');
        fixture.detectChanges();

        expect(component.baselineSelected).toBeTrue();
        expect(component.modifiedSelected).toBeFalse();
        expect(baselinePanel().classList).toContain('assessment-small-screen-tab');
        expect(modificationPanel().classList).not.toContain('assessment-small-screen-tab');
        expect(helpPanel().classList).not.toContain('assessment-small-screen-tab');
      });

      it('selects the modification panel and marks only the modification panel as the small screen tab', () => {
        setup();
        component.setSmallScreenTab('baseline');
        component.setSmallScreenTab('modification');
        fixture.detectChanges();

        expect(component.modifiedSelected).toBeTrue();
        expect(component.baselineSelected).toBeFalse();
        expect(modificationPanel().classList).toContain('assessment-small-screen-tab');
        expect(baselinePanel().classList).not.toContain('assessment-small-screen-tab');
      });

      it('marks only the help panel as the small screen tab for details without changing the selected panel', () => {
        setup();
        component.setSmallScreenTab('details');
        fixture.detectChanges();

        expect(component.baselineSelected).toBeFalse();
        expect(component.modifiedSelected).toBeTrue();
        expect(helpPanel().classList).toContain('assessment-small-screen-tab');
        expect(baselinePanel().classList).not.toContain('assessment-small-screen-tab');
        expect(modificationPanel().classList).not.toContain('assessment-small-screen-tab');
      });

      it('highlights the matching small screen nav item', () => {
        setup();
        component.setSmallScreenTab('details');
        fixture.detectChanges();

        const items = Array.from(host.querySelectorAll('.assessment-small-tab-select .nav-item'));
        expect(items.map(i => i.classList.contains('assessment-small-screen-active'))).toEqual([false, false, true]);
      });
    });

    describe('addModification', () => {
      it('requests the new modification modal', () => {
        setup();
        component.addModification();
        expect(openNewModalSubject.value).toBeTrue();
      });

      it('requests the new modification modal when the add prompt is clicked', () => {
        setup({ modificationExists: false });
        (modificationPanel().querySelector('.no-data').parentElement as HTMLElement).click();
        expect(openNewModalSubject.value).toBeTrue();
      });
    });

    describe('saving', () => {
      let emitted: FSAT[];

      beforeEach(() => {
        emitted = [];
      });

      function setupWithModification(): void {
        setup({ assessment: makeAssessment([makeModification('Scenario 1', true)]), modificationExists: true });
        component.emitSaveAssessment.subscribe((fsat: FSAT) => emitted.push(fsat));
      }

      it('emits the assessment fsat on saveAssessment', () => {
        setup();
        component.emitSaveAssessment.subscribe((fsat: FSAT) => emitted.push(fsat));
        component.saveAssessment();
        expect(emitted).toEqual([component.assessment.fsat]);
      });

      it('turns off explore opportunities for the modification on saveAssessment when a modification exists', () => {
        setupWithModification();
        component.saveAssessment();
        expect(component.assessment.fsat.modifications[0].exploreOpportunities).toBeFalse();
      });

      it('does not touch modifications on saveAssessment when no modification exists', () => {
        setup({ assessment: makeAssessment([makeModification('Scenario 1', true)]), modificationExists: false });
        component.saveAssessment();
        expect(component.assessment.fsat.modifications[0].exploreOpportunities).toBeTrue();
      });

      const baselineSaves: Array<{ method: keyof ModifyConditionsComponent; prop: keyof FSAT; value: unknown }> = [
        { method: 'saveBaselineGasDensity', prop: 'baseGasDensity', value: { gasType: 'AIR' } as BaseGasDensity },
        { method: 'saveBaselineFanSetup', prop: 'fanSetup', value: { fanType: 1 } as FanSetup },
        { method: 'saveBaselineFanOperations', prop: 'fsatOperations', value: { operatingHours: 100 } as FsatOperations },
        { method: 'saveBaselineFanMotor', prop: 'fanMotor', value: { motorRpm: 1780 } as FanMotor },
        { method: 'saveBaselineFieldData', prop: 'fieldData', value: { flowRate: 5 } as FieldData },
      ];
      baselineSaves.forEach(({ method, prop, value }) => {
        it(`${method} stores the baseline data and emits the assessment fsat`, () => {
          setup();
          component.emitSaveAssessment.subscribe((fsat: FSAT) => emitted.push(fsat));
          (component[method] as unknown as (v: unknown) => void).call(component, value);

          expect(component.assessment.fsat[prop]).toBe(value as never);
          expect(emitted).toEqual([component.assessment.fsat]);
        });
      });

      const modificationSaves: Array<{ method: keyof ModifyConditionsComponent; prop: keyof FSAT; value: unknown }> = [
        { method: 'saveModGasDensity', prop: 'baseGasDensity', value: { gasType: 'AIR' } as BaseGasDensity },
        { method: 'saveModFanSetup', prop: 'fanSetup', value: { fanType: 1 } as FanSetup },
        { method: 'saveModFanMotor', prop: 'fanMotor', value: { motorRpm: 1780 } as FanMotor },
        { method: 'saveModFieldData', prop: 'fieldData', value: { flowRate: 5 } as FieldData },
        { method: 'saveModFanOperations', prop: 'fsatOperations', value: { operatingHours: 100 } as FsatOperations },
      ];
      modificationSaves.forEach(({ method, prop, value }) => {
        it(`${method} stores the data on the modification, turns off explore opportunities and emits the assessment fsat`, () => {
          setupWithModification();
          (component[method] as unknown as (v: unknown) => void).call(component, value);

          const modification = component.assessment.fsat.modifications[0];
          expect(modification.fsat[prop]).toBe(value as never);
          expect(modification.exploreOpportunities).toBeFalse();
          expect(emitted).toEqual([component.assessment.fsat]);
        });
      });

      it('saveModExtra replaces the modification fsat and emits the assessment fsat', () => {
        setupWithModification();
        const replacement = { name: 'Replaced' } as FSAT;

        component.saveModExtra(replacement);

        expect(component.assessment.fsat.modifications[0].fsat).toBe(replacement);
        expect(emitted).toEqual([component.assessment.fsat]);
      });
    });
  });

  describe('destroy', () => {
    it('stops reacting to tab changes after the component is destroyed', () => {
      setup({ tab: 'fan-operations' });
      fixture.destroy();
      tabSubject.next('fan-motor');
      expect(component.modifyConditionsTab).toBe('fan-operations');
    });

    it('stops reacting to modal state changes after the component is destroyed', () => {
      setup();
      fixture.destroy();
      modalOpenSubject.next(true);
      expect(component.isModalOpen).toBeFalse();
    });
  });
});
