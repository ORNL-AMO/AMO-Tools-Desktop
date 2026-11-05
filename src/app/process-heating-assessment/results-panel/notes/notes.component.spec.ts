import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessHeatingModification } from '../../models/modification';
import { ModificationService } from '../../services/modification.service';
import { NotesComponent } from './notes.component';

describe('NotesComponent', () => {
  let fixture: ComponentFixture<NotesComponent>;
  let modifications: WritableSignal<ProcessHeatingModification[]>;
  let modificationService: jasmine.SpyObj<ModificationService>;

  const textarea = (): HTMLTextAreaElement => fixture.nativeElement.querySelector('textarea');

  beforeEach(() => {
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', notes: { wallNotes: 'existing note' } }]);
    modificationService = jasmine.createSpyObj<ModificationService>('ModificationService', ['setModificationNote']);
    Object.assign(modificationService, { modifications });
    TestBed.configureTestingModule({
      declarations: [NotesComponent],
      providers: [{ provide: ModificationService, useValue: modificationService }],
    });
    fixture = TestBed.createComponent(NotesComponent);
    fixture.componentRef.setInput('modificationId', 'mod1');
  });

  it('shows the select-a-loss placeholder when no notes key is active', () => {
    fixture.detectChanges();
    expect(textarea()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Select a loss type to edit notes.');
  });

  it('shows the saved note and legacy placeholder for the active key', () => {
    fixture.componentRef.setInput('notesKey', 'wallNotes');
    fixture.detectChanges();
    expect(textarea().value).toBe('existing note');
    expect(textarea().placeholder).toBe('Add note for wall losses');
  });

  it('shows an empty note for a key the modification has no value for', () => {
    fixture.componentRef.setInput('notesKey', 'chargeNotes');
    fixture.detectChanges();
    expect(textarea().value).toBe('');
  });

  it('writes typed text to the active key of the modification', () => {
    fixture.componentRef.setInput('notesKey', 'wallNotes');
    fixture.detectChanges();
    textarea().value = 'updated';
    textarea().dispatchEvent(new Event('input'));
    expect(modificationService.setModificationNote).toHaveBeenCalledWith('mod1', 'wallNotes', 'updated');
  });
});
