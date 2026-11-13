import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LossView } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ResultsPanelComponent } from './results-panel.component';

describe('ResultsPanelComponent tabs', () => {
  let fixture: ComponentFixture<ResultsPanelComponent>;
  let childView: WritableSignal<string>;
  let selectedExpertViewTab: WritableSignal<string | undefined>;
  let isEnergyValidationView: WritableSignal<boolean>;
  let isAuxiliaryEquipmentView: WritableSignal<boolean>;

  const tab = (label: string): HTMLElement =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.panel-tab-item a')).find(link => link.textContent.trim() === label);
  const keydown = (element: HTMLElement, key: string): void => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    childView = signal('explore-opportunities');
    selectedExpertViewTab = signal(undefined);
    isEnergyValidationView = signal(false);
    isAuxiliaryEquipmentView = signal(false);
    TestBed.configureTestingModule({
      declarations: [ResultsPanelComponent],
      providers: [{
        provide: ProcessHeatingUiService,
        useValue: {
          mainView: signal('assessment'),
          childView,
          selectedExpertViewTab,
          exploreNotesKey: signal(undefined),
          isEnergyValidationView,
          isAuxiliaryEquipmentView,
        },
      }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ResultsPanelComponent);
    fixture.componentRef.setInput('scenario', 'mod1');
    fixture.detectChanges();
  });

  it('puts every tab in the tab order as a button', () => {
    ['Results', 'Help', 'Notes'].forEach(label => {
      expect(tab(label).getAttribute('role')).toBe('button');
      expect(tab(label).tabIndex).toBe(0);
    });
  });

  it('opens a tab with Enter or Space and reports it as pressed', () => {
    keydown(tab('Notes'), 'Enter');
    expect(tab('Notes').getAttribute('aria-pressed')).toBe('true');
    expect(tab('Results').getAttribute('aria-pressed')).toBe('false');

    keydown(tab('Help'), ' ');
    expect(tab('Help').getAttribute('aria-pressed')).toBe('true');
    expect(tab('Notes').getAttribute('aria-pressed')).toBe('false');
  });

  it('edits Operations notes when Operations is selected in Expert View', () => {
    childView.set('expert-view');
    selectedExpertViewTab.set(LossView.OPERATIONS);

    expect(fixture.componentInstance.notesKey()).toBe('operationsNotes');
  });

  describe('results tables', () => {
    const shown = (selector: string): boolean => fixture.nativeElement.querySelector(selector) !== null;

    it('adds the energy validation table below the heat balance results on Heat Balance', () => {
      childView.set('heat-balance');
      fixture.detectChanges();

      expect(shown('app-process-heating-assessment-results')).toBeTrue();
      expect(shown('app-process-heating-assessment-results + div app-energy-validation-results')).toBeTrue();
    });

    it('shows only the energy validation table on Energy Validation', () => {
      childView.set('metered-energy');
      isEnergyValidationView.set(true);
      fixture.detectChanges();

      expect(shown('app-energy-validation-results')).toBeTrue();
      expect(shown('app-process-heating-assessment-results')).toBeFalse();
    });

    it('shows only the auxiliary equipment results, for the panel scenario, on Auxiliary Equipment', () => {
      isAuxiliaryEquipmentView.set(true);
      fixture.detectChanges();

      expect(shown('app-auxiliary-equipment-results')).toBeTrue();
      expect(shown('app-process-heating-assessment-results')).toBeFalse();
      expect(shown('app-energy-validation-results')).toBeFalse();
    });

    it('edits Auxiliary Equipment notes when Auxiliary Equipment is selected in Expert View', () => {
      childView.set('expert-view');
      selectedExpertViewTab.set('auxiliary-equipment');

      expect(fixture.componentInstance.notesKey()).toBe('auxiliaryEquipmentNotes');
    });

    it('shows only the heat balance results elsewhere', () => {
      fixture.detectChanges();

      expect(shown('app-process-heating-assessment-results')).toBeTrue();
      expect(shown('app-energy-validation-results')).toBeFalse();
    });
  });

  describe('assessment settings', () => {
    it('hides the Results tab and shows Help instead', () => {
      childView.set('assessment-settings');
      fixture.detectChanges();

      expect(tab('Results')).toBeUndefined();
      expect(tab('Help').getAttribute('aria-pressed')).toBe('true');
      expect(fixture.nativeElement.querySelector('app-process-heating-help-panel')).not.toBeNull();
    });

    it('returns to Results on leaving Assessment Settings', () => {
      childView.set('assessment-settings');
      fixture.detectChanges();
      childView.set('auxiliary-equipment');
      fixture.detectChanges();

      expect(tab('Results').getAttribute('aria-pressed')).toBe('true');
    });
  });
});
