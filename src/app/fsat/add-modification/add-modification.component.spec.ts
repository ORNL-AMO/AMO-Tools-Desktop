import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AddModificationComponent } from './add-modification.component';
import { FsatService } from '../fsat.service';
import { FSAT, Modification } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_FSAT = { name: 'Baseline' } as FSAT;

function makeModification(): Modification {
  return { id: 'mod-1', fsat: { name: 'Copy' } as FSAT };
}

describe('AddModificationComponent', () => {
  let component: AddModificationComponent;
  let fixture: ComponentFixture<AddModificationComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let assessmentTab: BehaviorSubject<string>;

  beforeEach(async () => {
    assessmentTab = new BehaviorSubject<string>('modify-conditions');
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getNewMod'], { assessmentTab });
    fsatServiceSpy.getNewMod.and.callFake(() => makeModification());

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [AddModificationComponent],
      providers: [{ provide: FsatService, useValue: fsatServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(options: { modifications?: Modification[]; modificationExists?: boolean } = {}): void {
    fixture = TestBed.createComponent(AddModificationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fsat', MOCK_FSAT);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('modificationExists', options.modificationExists ?? false);
    if (options.modifications) {
      fixture.componentRef.setInput('modifications', options.modifications);
    }
    fixture.detectChanges();
  }

  const text = (): string => fixture.nativeElement.textContent;
  const radios = (): NodeListOf<HTMLInputElement> => fixture.nativeElement.querySelectorAll('input[type="radio"]');

  function setTab(tab: string): void {
    assessmentTab.next(tab);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('names the first scenario when no modifications are provided', () => {
      createComponent();
      expect(component).toBeTruthy();
      expect(component.newModificationName).toBe('Scenario 1');
    });

    it('names the scenario after the existing modification count', () => {
      createComponent({ modifications: [makeModification(), makeModification()] });
      expect(component.newModificationName).toBe('Scenario 3');
    });

    it('tracks the current assessment tab', () => {
      createComponent();
      expect(component.assessmentTab).toBe('modify-conditions');
      assessmentTab.next('explore-opportunities');
      expect(component.assessmentTab).toBe('explore-opportunities');
    });
  });

  describe('template visibility', () => {
    describe('modify conditions description', () => {
      it('is shown on the modify-conditions tab when no modification exists', () => {
        createComponent({ modificationExists: false });
        expect(text()).toContain('The Modify All Conditions section is an expert view');
        expect(text()).not.toContain('The Explore Opportunities section is a novice view');
      });

      it('is hidden on the modify-conditions tab when a modification exists', () => {
        createComponent({ modificationExists: true });
        expect(text()).not.toContain('The Modify All Conditions section is an expert view');
      });
    });

    describe('explore opportunities description', () => {
      it('is shown on the explore-opportunities tab when no modification exists', () => {
        createComponent({ modificationExists: false });
        setTab('explore-opportunities');
        expect(text()).toContain('The Explore Opportunities section is a novice view');
        expect(text()).not.toContain('The Modify All Conditions section is an expert view');
      });

      it('is hidden on the explore-opportunities tab when a modification exists', () => {
        createComponent({ modificationExists: true });
        setTab('explore-opportunities');
        expect(text()).not.toContain('The Explore Opportunities section is a novice view');
      });

      it('shows no description on any other tab', () => {
        createComponent({ modificationExists: false });
        setTab('report');
        expect(text()).not.toContain('The Modify All Conditions section is an expert view');
        expect(text()).not.toContain('The Explore Opportunities section is a novice view');
      });
    });

    describe('scenario type selection', () => {
      it('is shown on the modify-conditions tab', () => {
        createComponent();
        expect(radios().length).toBe(2);
        expect(text()).toContain('Compare two existing fans or what-if scenario?');
      });

      it('is hidden on the explore-opportunities tab', () => {
        createComponent();
        setTab('explore-opportunities');
        expect(radios().length).toBe(0);
        expect(text()).not.toContain('Compare two existing fans or what-if scenario?');
      });

      it('is shown again when leaving the explore-opportunities tab', () => {
        createComponent();
        setTab('explore-opportunities');
        setTab('modify-conditions');
        expect(radios().length).toBe(2);
      });
    });
  });

  describe('addModification', () => {
    it('emits a new modification using the entered name and scenario type', () => {
      createComponent();
      const emitted: Modification[] = [];
      component.save.subscribe((m: Modification) => emitted.push(m));
      component.newModificationName = 'My Scenario';
      component.isWhatIfScenario = false;

      component.addModification();

      expect(fsatServiceSpy.getNewMod).toHaveBeenCalledWith(MOCK_FSAT, MOCK_SETTINGS);
      expect(emitted.length).toBe(1);
      expect(emitted[0].fsat.name).toBe('My Scenario');
      expect(emitted[0].fsat.whatIfScenario).toBeFalse();
      expect(emitted[0].exploreOpportunities).toBeFalse();
    });

    it('flags the modification as exploring opportunities on that tab', () => {
      createComponent();
      assessmentTab.next('explore-opportunities');
      const emitted: Modification[] = [];
      component.save.subscribe((m: Modification) => emitted.push(m));

      component.addModification();

      expect(emitted[0].exploreOpportunities).toBeTrue();
    });
  });

  describe('saveScenarioChange', () => {
    it('stores the selected scenario type', () => {
      createComponent();
      component.saveScenarioChange(false);
      expect(component.isWhatIfScenario).toBeFalse();
    });
  });

  describe('destroy', () => {
    it('stops tracking the assessment tab after destroy', () => {
      createComponent();
      fixture.destroy();
      assessmentTab.next('explore-opportunities');
      expect(component.assessmentTab).toBe('modify-conditions');
    });
  });
});
