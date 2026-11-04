import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ModificationListComponent } from './modification-list.component';
import { CompareService } from '../compare.service';
import { FsatService } from '../fsat.service';
import { ModifyConditionsService } from '../modify-conditions/modify-conditions.service';
import { FSAT, Modification } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

type Badge = { badge: string, componentStr: string };

const BADGES_BY_NAME: Record<string, Array<Badge>> = {
  'One Badge': [{ badge: 'Operations', componentStr: 'fsat-operations' }],
  'Two Badges': [{ badge: 'Operations', componentStr: 'fsat-operations' }, { badge: 'Motor', componentStr: 'fan-motor' }],
};

function makeModification(name: string, optimize: boolean = false): Modification {
  return {
    id: name,
    fsat: { name, whatIfScenario: true, fanMotor: { optimize } } as unknown as FSAT,
  };
}

function makeFsat(modifications: Array<Modification>): FSAT {
  return { name: 'Baseline', modifications } as FSAT;
}

describe('ModificationListComponent', () => {
  let component: ModificationListComponent;
  let fixture: ComponentFixture<ModificationListComponent>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let modifyConditionsServiceSpy: jasmine.SpyObj<ModifyConditionsService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let assessmentTab: BehaviorSubject<string>;
  let modifyConditionsTab: BehaviorSubject<string>;

  beforeEach(async () => {
    assessmentTab = new BehaviorSubject<string>('modify-conditions');
    modifyConditionsTab = new BehaviorSubject<string>('');

    compareServiceSpy = jasmine.createSpyObj('CompareService', ['setCompareVals', 'getBadges']);
    compareServiceSpy.getBadges.and.callFake((_baseline: FSAT, modification: FSAT) => BADGES_BY_NAME[modification.name] || []);

    modifyConditionsServiceSpy = jasmine.createSpyObj('ModifyConditionsService', [], { modifyConditionsTab });

    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getNewMod'], { assessmentTab });
    fsatServiceSpy.getNewMod.and.callFake(() => makeModification('placeholder'));

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [ModificationListComponent],
      providers: [
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: ModifyConditionsService, useValue: modifyConditionsServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(modifications: Array<Modification>, modificationIndex: number = 0): void {
    fixture = TestBed.createComponent(ModificationListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fsat', makeFsat(modifications));
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('modificationIndex', modificationIndex);
    fixture.detectChanges();
  }

  const items = (): NodeListOf<HTMLElement> => fixture.nativeElement.querySelectorAll('.modification-item');
  const item = (index: number): HTMLElement => items()[index];
  const dropdownItem = (itemIndex: number, label: string): HTMLElement =>
    Array.from<HTMLElement>(item(itemIndex).querySelectorAll('.dropdown-item')).find(el => el.textContent.trim() === label);

  function clickDropdownItem(itemIndex: number, label: string): void {
    dropdownItem(itemIndex, label).click();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('creates the component and sizes the dropdown state arrays to the modifications', () => {
      createComponent([makeModification('A'), makeModification('B')]);
      expect(component).toBeTruthy();
      expect(component.dropdown.length).toBe(2);
      expect(component.rename.length).toBe(2);
      expect(component.deleteArr.length).toBe(2);
    });

    it('tracks the current assessment tab', () => {
      createComponent([]);
      expect(component.assessmentTab).toBe('modify-conditions');
      assessmentTab.next('explore-opportunities');
      expect(component.assessmentTab).toBe('explore-opportunities');
    });
  });

  describe('template visibility', () => {
    describe('modification rows', () => {
      it('renders no rows when there are no modifications', () => {
        createComponent([]);
        expect(items().length).toBe(0);
      });

      it('renders one row per modification', () => {
        createComponent([makeModification('A'), makeModification('B'), makeModification('C')]);
        expect(items().length).toBe(3);
        expect(item(0).textContent).toContain('A');
        expect(item(2).textContent).toContain('C');
      });
    });

    describe('name column states', () => {
      beforeEach(() => createComponent([makeModification('A'), makeModification('B')]));

      it('shows the name link only by default', () => {
        expect(item(0).querySelector('a.click-link').textContent.trim()).toBe('A');
        expect(item(0).querySelector('input.form-control')).toBeNull();
        expect(item(0).textContent).not.toContain('Are you sure you want to delete?');
      });

      it('shows the rename input instead of the name link when renaming', () => {
        clickDropdownItem(0, 'Rename');
        expect(item(0).querySelector('a.click-link')).toBeNull();
        expect(item(0).querySelector('input.form-control')).not.toBeNull();
        expect(item(0).textContent).not.toContain('Are you sure you want to delete?');
      });

      it('shows the delete confirmation instead of the name link when deleting', () => {
        clickDropdownItem(0, 'Delete');
        expect(item(0).querySelector('a.click-link')).toBeNull();
        expect(item(0).querySelector('input.form-control')).toBeNull();
        expect(item(0).textContent).toContain('Are you sure you want to delete?');
        expect(item(0).querySelector('button.btn-danger')).not.toBeNull();
      });

      it('shows both the rename input and delete confirmation when both are active', () => {
        component.rename[0] = true;
        component.deleteArr[0] = true;
        fixture.detectChanges();
        expect(item(0).querySelector('a.click-link')).toBeNull();
        expect(item(0).querySelector('input.form-control')).not.toBeNull();
        expect(item(0).textContent).toContain('Are you sure you want to delete?');
      });

      it('only changes the row that was acted on', () => {
        clickDropdownItem(0, 'Delete');
        expect(item(1).querySelector('a.click-link')).not.toBeNull();
        expect(item(1).textContent).not.toContain('Are you sure you want to delete?');
      });

      it('returns to the name link when the delete is cancelled', () => {
        clickDropdownItem(0, 'Delete');
        const cancel = Array.from<HTMLElement>(item(0).querySelectorAll('button.btn-default')).find(el => el.textContent.trim() === 'Cancel');
        cancel.click();
        fixture.detectChanges();
        expect(item(0).querySelector('a.click-link')).not.toBeNull();
        expect(item(0).textContent).not.toContain('Are you sure you want to delete?');
      });
    });

    describe('badges', () => {
      it('renders no badges when the modification has no differences', () => {
        createComponent([makeModification('No Badges')]);
        expect(item(0).querySelectorAll('.badge-primary').length).toBe(0);
      });

      it('renders one badge per difference', () => {
        createComponent([makeModification('One Badge'), makeModification('Two Badges')]);
        expect(item(0).querySelectorAll('.badge-primary').length).toBe(1);
        expect(item(0).querySelector('.badge-primary').textContent.trim()).toBe('Operations');
        expect(item(1).querySelectorAll('.badge-primary').length).toBe(2);
      });
    });

    describe('optimized badge', () => {
      it('is hidden when the fan motor is not optimized', () => {
        createComponent([makeModification('A', false)]);
        expect(item(0).querySelector('.badge-secondary')).toBeNull();
      });

      it('is shown only for modifications with an optimized fan motor', () => {
        createComponent([makeModification('A', true), makeModification('B', false)]);
        expect(item(0).querySelector('.badge-secondary').textContent.trim()).toBe('Optimized');
        expect(item(1).querySelector('.badge-secondary')).toBeNull();
      });
    });

    it('adds a row when a copy is created', () => {
      createComponent([makeModification('A')]);
      clickDropdownItem(0, 'Create Copy');
      expect(items().length).toBe(2);
    });
  });

  describe('selectModificationBadge', () => {
    it('goes to the badge component when there is exactly one badge', () => {
      createComponent([makeModification('One Badge')]);
      component.selectModificationBadge(component.fsat.modifications[0].fsat, 0);
      expect(modifyConditionsTab.value).toBe('fsat-operations');
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 0);
    });

    it('goes to fan-field-data when there are no badges or several badges', () => {
      createComponent([makeModification('No Badges'), makeModification('Two Badges')]);
      component.selectModificationBadge(component.fsat.modifications[0].fsat, 0);
      expect(modifyConditionsTab.value).toBe('fan-field-data');
      modifyConditionsTab.next('');
      component.selectModificationBadge(component.fsat.modifications[1].fsat, 1);
      expect(modifyConditionsTab.value).toBe('fan-field-data');
    });
  });

  describe('goToModification', () => {
    it('sets the modify conditions tab, selects the modification and emits close', () => {
      createComponent([makeModification('A')]);
      const closed: boolean[] = [];
      component.close.subscribe((v: boolean) => closed.push(v));

      component.goToModification(0, 'fan-motor');

      expect(modifyConditionsTab.value).toBe('fan-motor');
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 0);
      expect(closed).toEqual([true]);
    });
  });

  describe('saveScenarioChange', () => {
    it('stores the scenario type, emits save, selects the modification and emits close', () => {
      createComponent([makeModification('A')]);
      const saved: boolean[] = [];
      const closed: boolean[] = [];
      component.save.subscribe((v: boolean) => saved.push(v));
      component.close.subscribe((v: boolean) => closed.push(v));

      component.saveScenarioChange(false, 0);

      expect(component.fsat.modifications[0].fsat.whatIfScenario).toBeFalse();
      expect(saved).toEqual([true]);
      expect(closed).toEqual([true]);
    });
  });

  describe('dropdown actions', () => {
    beforeEach(() => createComponent([makeModification('A')]));

    it('toggles the dropdown', () => {
      component.showDropdown(0);
      expect(component.dropdown[0]).toBeTrue();
      component.showDropdown(0);
      expect(component.dropdown[0]).toBeFalse();
    });

    it('toggles rename and closes the dropdown', () => {
      component.dropdown[0] = true;
      component.renameMod(0);
      expect(component.rename[0]).toBeTrue();
      expect(component.dropdown[0]).toBeFalse();
      component.renameMod(0);
      expect(component.rename[0]).toBeFalse();
    });

    it('toggles delete confirmation and closes the dropdown', () => {
      component.dropdown[0] = true;
      component.deleteMod(0);
      expect(component.deleteArr[0]).toBeTrue();
      expect(component.dropdown[0]).toBeFalse();
      component.deleteMod(0);
      expect(component.deleteArr[0]).toBeFalse();
    });

    it('saves updates and leaves rename mode', () => {
      const saved: boolean[] = [];
      component.save.subscribe((v: boolean) => saved.push(v));
      component.rename[0] = true;

      component.saveUpdates(0);

      expect(saved).toEqual([true]);
      expect(component.rename[0]).toBeFalse();
    });
  });

  describe('deleteModification', () => {
    it('removes the modification, emits save and removes its row', () => {
      createComponent([makeModification('A'), makeModification('B'), makeModification('C')], 0);
      const saved: boolean[] = [];
      component.save.subscribe((v: boolean) => saved.push(v));

      component.deleteModification(2);
      fixture.detectChanges();

      expect(component.fsat.modifications.map(m => m.fsat.name)).toEqual(['A', 'B']);
      expect(items().length).toBe(2);
      expect(saved).toEqual([true]);
    });

    it('resets the compare values when the last modification is deleted', () => {
      createComponent([makeModification('A')], 0);
      component.deleteModification(0);
      fixture.detectChanges();
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 0);
      expect(items().length).toBe(0);
    });

    it('selects the first modification when the selected one is deleted', () => {
      createComponent([makeModification('A'), makeModification('B'), makeModification('C')], 1);
      component.deleteModification(1);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 0);
    });

    it('keeps the same modification selected when an earlier one is deleted', () => {
      createComponent([makeModification('A'), makeModification('B'), makeModification('C')], 2);
      component.deleteModification(0);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 1);
    });

    it('does not change the selection when a later modification is deleted', () => {
      createComponent([makeModification('A'), makeModification('B'), makeModification('C')], 0);
      component.deleteModification(2);
      expect(compareServiceSpy.setCompareVals).not.toHaveBeenCalled();
    });
  });

  describe('addNewModification', () => {
    it('adds a modification with the entered name, emits save and selects it', () => {
      createComponent([makeModification('A')]);
      const saved: boolean[] = [];
      component.save.subscribe((v: boolean) => saved.push(v));
      component.newModificationName = 'New Scenario';

      component.addNewModification();
      fixture.detectChanges();

      expect(fsatServiceSpy.getNewMod).toHaveBeenCalledWith(component.fsat, MOCK_SETTINGS);
      expect(component.fsat.modifications.length).toBe(2);
      expect(component.fsat.modifications[1].fsat.name).toBe('New Scenario');
      expect(items().length).toBe(2);
      expect(saved).toEqual([true]);
      expect(compareServiceSpy.setCompareVals).toHaveBeenCalledWith(component.fsat, 1);
      expect(component.newModificationName).toBeUndefined();
    });

    it('names a copy after the source with a count of matching names', () => {
      createComponent([makeModification('A')]);
      component.addNewModification(component.fsat.modifications[0].fsat);
      expect(fsatServiceSpy.getNewMod).toHaveBeenCalledWith(component.fsat.modifications[0].fsat, MOCK_SETTINGS);
      expect(component.fsat.modifications[1].fsat.name).toBe('A(1)');
    });
  });

  describe('destroy', () => {
    it('stops tracking the assessment tab after destroy', () => {
      createComponent([]);
      fixture.destroy();
      assessmentTab.next('explore-opportunities');
      expect(component.assessmentTab).toBe('modify-conditions');
    });
  });
});
