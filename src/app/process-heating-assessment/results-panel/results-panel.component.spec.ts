import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LossView } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ResultsPanelComponent } from './results-panel.component';

describe('ResultsPanelComponent tabs', () => {
  let fixture: ComponentFixture<ResultsPanelComponent>;
  let childView: WritableSignal<string>;
  let selectedExpertViewTab: WritableSignal<string | undefined>;

  const tab = (label: string): HTMLElement =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.panel-tab-item a')).find(link => link.textContent.trim() === label);
  const keydown = (element: HTMLElement, key: string): void => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    childView = signal('explore-opportunities');
    selectedExpertViewTab = signal(undefined);
    TestBed.configureTestingModule({
      declarations: [ResultsPanelComponent],
      providers: [{
        provide: ProcessHeatingUiService,
        useValue: {
          mainView: signal('assessment'),
          childView,
          selectedExpertViewTab,
          exploreNotesKey: signal(undefined),
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
});
