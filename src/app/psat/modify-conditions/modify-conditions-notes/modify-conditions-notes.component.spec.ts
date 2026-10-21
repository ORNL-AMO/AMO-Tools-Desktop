import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModifyConditionsNotesComponent } from './modify-conditions-notes.component';
import { PsatTabService } from '../../psat-tab.service';
import { Notes } from '../../../shared/models/psat';

function makeNotes(): Notes {
  return {
    systemBasicsNotes: 'baseline note',
    pumpFluidNotes: 'pump fluid note',
    motorNotes: 'motor note',
    fieldDataNotes: 'field data note',
  };
}

describe('ModifyConditionsNotesComponent', () => {
  let component: ModifyConditionsNotesComponent;
  let fixture: ComponentFixture<ModifyConditionsNotesComponent>;
  let modifyConditionsTab: BehaviorSubject<string>;

  function findByPlaceholder(placeholder: string): Element | null {
    return fixture.nativeElement.querySelector(`textarea[placeholder="${placeholder}"]`);
  }

  beforeEach(async () => {
    modifyConditionsTab = new BehaviorSubject<string>('baseline');
    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', [], { modifyConditionsTab });

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ModifyConditionsNotesComponent],
      providers: [
        { provide: PsatTabService, useValue: psatTabServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyConditionsNotesComponent);
    component = fixture.componentInstance;
    component.notes = makeNotes();
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets currentTab from the modifyConditionsTab subscription initial value', () => {
      expect(component.currentTab).toBe('baseline');
    });
  });

  describe('observeModifyConditionsTabChange', () => {
    it('updates currentTab when the service emits a new tab', () => {
      modifyConditionsTab.next('motor');
      expect(component.currentTab).toBe('motor');
    });
  });

  describe('save', () => {
    it('emits emitSave with true when save is invoked', () => {
      const emitted: boolean[] = [];
      component.emitSave.subscribe((value: boolean) => emitted.push(value));

      component.save();

      expect(emitted).toEqual([true]);
    });
  });

  describe('template visibility', () => {
    it('shows the baseline note and hides the others when currentTab is baseline', () => {
      modifyConditionsTab.next('baseline');
      fixture.detectChanges();

      expect(findByPlaceholder('Add note for baseline')).not.toBeNull();
      expect(findByPlaceholder('Add notes for modification pump & fluid')).toBeNull();
      expect(findByPlaceholder('Add notes for modification motor')).toBeNull();
      expect(findByPlaceholder('Add notes for modification field data')).toBeNull();
    });

    it('shows the pump & fluid note and hides the others when currentTab is pump-fluid', () => {
      modifyConditionsTab.next('pump-fluid');
      fixture.detectChanges();

      expect(findByPlaceholder('Add notes for modification pump & fluid')).not.toBeNull();
      expect(findByPlaceholder('Add note for baseline')).toBeNull();
      expect(findByPlaceholder('Add notes for modification motor')).toBeNull();
      expect(findByPlaceholder('Add notes for modification field data')).toBeNull();
    });

    it('shows the motor note and hides the others when currentTab is motor', () => {
      modifyConditionsTab.next('motor');
      fixture.detectChanges();

      expect(findByPlaceholder('Add notes for modification motor')).not.toBeNull();
      expect(findByPlaceholder('Add note for baseline')).toBeNull();
      expect(findByPlaceholder('Add notes for modification pump & fluid')).toBeNull();
      expect(findByPlaceholder('Add notes for modification field data')).toBeNull();
    });

    it('shows the field data note and hides the others when currentTab is field-data', () => {
      modifyConditionsTab.next('field-data');
      fixture.detectChanges();

      expect(findByPlaceholder('Add notes for modification field data')).not.toBeNull();
      expect(findByPlaceholder('Add note for baseline')).toBeNull();
      expect(findByPlaceholder('Add notes for modification pump & fluid')).toBeNull();
      expect(findByPlaceholder('Add notes for modification motor')).toBeNull();
    });

    it('hides every note when currentTab matches none of the known tabs', () => {
      modifyConditionsTab.next('details');
      fixture.detectChanges();

      expect(findByPlaceholder('Add note for baseline')).toBeNull();
      expect(findByPlaceholder('Add notes for modification pump & fluid')).toBeNull();
      expect(findByPlaceholder('Add notes for modification motor')).toBeNull();
      expect(findByPlaceholder('Add notes for modification field data')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops updating currentTab after the component is destroyed', () => {
      fixture.destroy();

      modifyConditionsTab.next('motor');

      expect(component.currentTab).not.toBe('motor');
    });
  });
});
