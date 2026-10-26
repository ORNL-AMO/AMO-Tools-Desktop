import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ModifyConditionsNotesComponent } from './modify-conditions-notes.component';
import { Notes } from '../../../shared/models/fans';

const TAB_PLACEHOLDERS: Array<{ tab: string; placeholder: string }> = [
  { tab: 'baseline', placeholder: 'Add note for baseline' },
  { tab: 'fsat-fluid', placeholder: 'Add notes for modification fluid' },
  { tab: 'fan-setup', placeholder: 'Add notes for modification fan setup' },
  { tab: 'fan-motor', placeholder: 'Add notes for modification motor' },
  { tab: 'fan-field-data', placeholder: 'Add notes for modification field data' },
];

describe('ModifyConditionsNotesComponent', () => {
  let component: ModifyConditionsNotesComponent;
  let fixture: ComponentFixture<ModifyConditionsNotesComponent>;

  function showTab(tab: string): void {
    component.currentTab = tab;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ModifyConditionsNotesComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyConditionsNotesComponent);
    component = fixture.componentInstance;
    component.notes = {} as Notes;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    it('renders no note form when currentTab is not a known tab', () => {
      showTab('unknown-tab');
      expect(fixture.nativeElement.querySelectorAll('.note-form').length).toBe(0);
      expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    });

    it('renders no note form when currentTab is undefined', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.note-form').length).toBe(0);
    });

    TAB_PLACEHOLDERS.forEach(({ tab, placeholder }) => {
      it(`shows only the ${tab} note textarea when currentTab is ${tab}`, () => {
        showTab(tab);
        expect(fixture.nativeElement.querySelectorAll('.note-form').length).toBe(1);
        const textareas = fixture.nativeElement.querySelectorAll('textarea');
        expect(textareas.length).toBe(1);
        expect(textareas[0].getAttribute('placeholder')).toBe(placeholder);
      });
    });

    it('swaps the note textarea when currentTab changes', () => {
      showTab('baseline');
      showTab('fan-motor');
      const textareas = fixture.nativeElement.querySelectorAll('textarea');
      expect(textareas.length).toBe(1);
      expect(textareas[0].getAttribute('placeholder')).toBe('Add notes for modification motor');
    });
  });

  describe('save', () => {
    it('emits true on emitSave when the textarea receives input', () => {
      const emitted: Array<boolean> = [];
      component.emitSave.subscribe(value => emitted.push(value));
      showTab('baseline');

      fixture.nativeElement.querySelector('textarea').dispatchEvent(new Event('input'));

      expect(emitted).toEqual([true]);
    });
  });
});
