import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help.component';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';
import { HelpPanelService } from '../../help-panel/help-panel.service';

const HELP_SELECTORS = [
  'app-system-basics-help',
  'app-fan-field-data-help',
  'app-fan-motor-help',
  'app-fan-setup-help',
  'app-fsat-fluid-help',
];

describe('ExploreOpportunitiesHelpComponent', () => {
  let component: ExploreOpportunitiesHelpComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesHelpComponent>;
  let modifyConditionsTab: BehaviorSubject<string>;
  let currentField: BehaviorSubject<string>;

  function getRenderedHelp(): Array<string> {
    return HELP_SELECTORS.filter(selector => fixture.nativeElement.querySelector(selector) !== null);
  }

  function showTab(tab: string): void {
    modifyConditionsTab.next(tab);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    modifyConditionsTab = new BehaviorSubject<string>('fan-field-data');
    currentField = new BehaviorSubject<string>('default');

    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesHelpComponent],
      providers: [
        { provide: ModifyConditionsService, useValue: jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab }) },
        { provide: HelpPanelService, useValue: jasmine.createSpyObj('HelpPanelService', [], { currentField }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('assigns stepTab and currentField from the services', () => {
      expect(component.stepTab).toBe('fan-field-data');
      expect(component.currentField).toBe('default');
    });
  });

  describe('observers', () => {
    it('updates currentField when the help panel service emits', () => {
      currentField.next('flowRate');
      expect(component.currentField).toBe('flowRate');
    });

    it('updates stepTab when the modify conditions tab changes', () => {
      modifyConditionsTab.next('fan-motor');
      expect(component.stepTab).toBe('fan-motor');
    });
  });

  describe('template visibility', () => {
    it('shows only the field data help on the fan-field-data tab', () => {
      showTab('fan-field-data');
      expect(getRenderedHelp()).toEqual(['app-fan-field-data-help']);
    });

    it('shows only the system basics help on the baseline tab', () => {
      showTab('baseline');
      expect(getRenderedHelp()).toEqual(['app-system-basics-help']);
    });

    it('shows only the motor help on the fan-motor tab', () => {
      showTab('fan-motor');
      expect(getRenderedHelp()).toEqual(['app-fan-motor-help']);
    });

    it('shows both the fan setup help and the fluid help on the fan-setup tab', () => {
      showTab('fan-setup');
      expect(getRenderedHelp()).toEqual(['app-fan-setup-help', 'app-fsat-fluid-help']);
    });

    it('shows no help component on an unrecognized tab', () => {
      showTab('some-other-tab');
      expect(getRenderedHelp()).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('stops updating stepTab and currentField after the component is destroyed', () => {
      fixture.destroy();
      modifyConditionsTab.next('fan-motor');
      currentField.next('lineFrequency');
      expect(component.stepTab).toBe('fan-field-data');
      expect(component.currentField).toBe('default');
    });
  });
});
