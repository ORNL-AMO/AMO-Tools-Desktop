import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ModificationListComponent } from './modification-list.component';
import { CompareService } from '../compare.service';
import { PsatService } from '../psat.service';
import { PsatTabService } from '../psat-tab.service';

const makeModification = (name: string): any => ({
  psat: {
    name,
    inputs: { whatIfScenario: true },
  },
  id: name,
  notes: {},
  exploreOpportunities: false,
});

describe('ModificationListComponent', () => {
  let component: ModificationListComponent;
  let fixture: ComponentFixture<ModificationListComponent>;

  const mockPsat: any = {
    inputs: {},
    modifications: [makeModification('Mod A'), makeModification('Mod B')],
  };

  const mockSettings: any = { unitsOfMeasure: 'Imperial' };

  beforeEach(async () => {
    const compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'setCompareVals',
      'getBadges',
      'openModificationModal',
    ]);
    compareServiceSpy.getBadges.and.returnValue([]);
    compareServiceSpy.openModificationModal = new BehaviorSubject<boolean>(false);

    const psatServiceSpy = jasmine.createSpyObj('PsatService', ['resultsExisting'], {
      getResults: new BehaviorSubject<boolean>(false),
    });
    psatServiceSpy.resultsExisting.and.returnValue({ pump_efficiency: 85 });

    const psatTabServiceSpy = jasmine.createSpyObj('PsatTabService', ['modifyConditionsTab'], {
      secondaryTab: new BehaviorSubject<string>('explore-opportunities'),
      modifyConditionsTab: new BehaviorSubject<string>('pump-fluid'),
    });

    await TestBed.configureTestingModule({
      imports: [FormsModule],
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
    component.psat = JSON.parse(JSON.stringify(mockPsat));
    component.modificationIndex = 0;
    component.settings = mockSettings;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('*ngFor modifications list', () => {
    it('renders a list item for each modification', () => {
      const items = fixture.nativeElement.querySelectorAll('li.list-group-item.modification-item');
      expect(items.length).toBe(2);
    });

    it('renders modification names in the list', () => {
      const items = fixture.nativeElement.querySelectorAll('li.list-group-item.modification-item');
      expect(items[0].textContent).toContain('Mod A');
      expect(items[1].textContent).toContain('Mod B');
    });

    it('renders no modification items when list is empty', () => {
      component.psat.modifications = [];
      component.initDropdown();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('li.list-group-item.modification-item');
      expect(items.length).toBe(0);
    });

    it('renders a single item when one modification exists', () => {
      component.psat.modifications = [makeModification('Only One')];
      component.initDropdown();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('li.list-group-item.modification-item');
      expect(items.length).toBe(1);
    });
  });

  describe('rename and delete conditionals', () => {
    it('shows modification name link when not renaming or deleting', () => {
      component.rename[0] = false;
      component.deleteArr[0] = false;
      fixture.detectChanges();
      const link = fixture.nativeElement.querySelector('a.click-link.small');
      expect(link).not.toBeNull();
    });

    it('shows rename input when rename[index] is true', () => {
      component.rename[0] = true;
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input.form-control');
      expect(input).not.toBeNull();
    });

    it('shows delete confirmation when deleteArr[index] is true', () => {
      component.deleteArr[0] = true;
      fixture.detectChanges();
      const deleteBtn = fixture.nativeElement.querySelector('button.btn.btn-danger');
      expect(deleteBtn).not.toBeNull();
    });
  });
});
