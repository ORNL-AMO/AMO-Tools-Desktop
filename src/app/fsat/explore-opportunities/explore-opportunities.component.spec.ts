import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { FsatService } from '../fsat.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';
import { FSAT } from '../../shared/models/fans';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = {} as Settings;
const WHAT_IF_HEADING = 'Select Potential Energy Efficiency Measures';
const COMPARE_TWO_FANS_HEADING = '"COMPARE TWO FANS"';
const NO_MODIFICATION_PLACEHOLDER = 'Explore Opportunities to view results';

type SankeyElement = HTMLElement & { isBaseline?: boolean };

function makeFsat(whatIfScenario: boolean | undefined, exploreOpportunities: boolean = true): FSAT {
  return {
    name: 'Baseline',
    modifications: [
      { id: 'mod-1', exploreOpportunities, fsat: { name: 'Mod 1', whatIfScenario } as FSAT },
      { id: 'mod-2', exploreOpportunities: false, fsat: { name: 'Mod 2', whatIfScenario: true } as FSAT },
    ],
  } as FSAT;
}

describe('ExploreOpportunitiesComponent', () => {
  let component: ExploreOpportunitiesComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesComponent>;
  let fsat: FSAT;
  let openNewModal: BehaviorSubject<boolean>;
  let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;

  interface ComponentSetup {
    modificationExists?: boolean,
    whatIfScenario?: boolean | undefined,
    exploreOpportunities?: boolean,
    containerHeight?: number
  }

  function createComponent(setup: ComponentSetup = {}): void {
    const { modificationExists = true, containerHeight = 800, exploreOpportunities = true } = setup;
    fsat = makeFsat('whatIfScenario' in setup ? setup.whatIfScenario : true, exploreOpportunities);
    fixture = TestBed.createComponent(ExploreOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('assessment', { fsat } as Assessment);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('containerHeight', containerHeight);
    fixture.componentRef.setInput('modificationIndex', 0);
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.detectChanges();
  }

  function selectTab(tabText: 'Results' | 'Sankey' | 'Help'): void {
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'));
    tabs.find(tab => tab.textContent.trim() === tabText).click();
    fixture.detectChanges();
  }

  function getSankeys(): SankeyElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('app-fsat-sankey'));
  }

  function clickSankeyToggle(buttonText: 'Baseline' | 'Modification'): void {
    const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.btn-group button'));
    buttons.find(button => button.textContent.trim() === buttonText).click();
    fixture.detectChanges();
  }

  function hasText(selector: string, text: string): boolean {
    const elements: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll(selector));
    return elements.some(element => element.textContent.includes(text));
  }

  beforeEach(async () => {
    openNewModal = new BehaviorSubject<boolean>(false);
    snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['setSnackbarMessage']);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ExploreOpportunitiesComponent],
      providers: [
        { provide: FsatService, useValue: jasmine.createSpyObj('FsatService', [], { openNewModal }) },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component with the results tab and form screen tab selected', () => {
      createComponent();
      expect(component).toBeTruthy();
      expect(component.tabSelect).toBe('results');
      expect(component.smallScreenTab).toBe('form');
    });

    it('uses the baseline fsat for the baseline sankey and the selected modification for the modification sankey', () => {
      createComponent();
      expect(component.baselineSankey).toBe(fsat);
      expect(component.modificationSankey).toBe(fsat.modifications[0].fsat);
    });

    it('leaves the modification sankey unset when no modification exists', () => {
      createComponent({ modificationExists: false });
      expect(component.baselineSankey).toBe(fsat);
      expect(component.modificationSankey).toBeUndefined();
    });

    it('sizes the help panel from the container height after the first resize pass', fakeAsync(() => {
      createComponent({ containerHeight: 800 });
      const smallTabHeight: number = component.smallTabSelect.nativeElement.offsetHeight;
      const resultTabsHeight: number = component.resultTabs.nativeElement.clientHeight;

      tick(100);

      expect(component.containerHeight).toBe(800 - smallTabHeight);
      expect(component.helpHeight).toBe(800 - smallTabHeight - resultTabsHeight - smallTabHeight);
    }));
  });

  describe('ngOnChanges', () => {
    beforeEach(() => createComponent());

    it('recomputes the help height when the container height changes after the first change', () => {
      fixture.componentRef.setInput('containerHeight', 900);
      fixture.detectChanges();

      expect(component.helpHeight).toBe(900 - component.resultTabs.nativeElement.clientHeight - component.smallTabSelect.nativeElement.offsetHeight);
    });

    it('points the modification sankey at the newly selected modification', () => {
      fixture.componentRef.setInput('modificationIndex', 1);
      fixture.detectChanges();

      expect(component.modificationSankey).toBe(fsat.modifications[1].fsat);
    });

    it('notifies the expert view when the newly selected modification has not explored opportunities', () => {
      snackbarServiceSpy.setSnackbarMessage.calls.reset();

      fixture.componentRef.setInput('modificationIndex', 1);
      fixture.detectChanges();

      expect(snackbarServiceSpy.setSnackbarMessage).toHaveBeenCalledWith('exploreOpportunities', 'info', 'long');
    });

    it('does not notify the expert view when the newly selected modification has explored opportunities', () => {
      fsat.modifications[1].exploreOpportunities = true;
      snackbarServiceSpy.setSnackbarMessage.calls.reset();

      fixture.componentRef.setInput('modificationIndex', 1);
      fixture.detectChanges();

      expect(snackbarServiceSpy.setSnackbarMessage).not.toHaveBeenCalled();
    });

    it('does not notify the expert view when no modification exists', () => {
      createComponent({ modificationExists: false, exploreOpportunities: false });
      expect(snackbarServiceSpy.setSnackbarMessage).not.toHaveBeenCalled();
    });

    it('refreshes the sankey data when the fsat input changes', () => {
      const updatedFsat: FSAT = makeFsat(true);

      fixture.componentRef.setInput('fsat', updatedFsat);
      fixture.detectChanges();

      expect(component.baselineSankey).toBe(updatedFsat);
      expect(component.modificationSankey).toBe(updatedFsat.modifications[0].fsat);
    });
  });

  describe('template visibility: modification form panel', () => {
    it('shows the what-if form and hides the compare-two-fans alert and the no-data panel when the scenario is what-if', () => {
      createComponent({ modificationExists: true, whatIfScenario: true });
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).not.toBeNull();
      expect(hasText('h3', WHAT_IF_HEADING)).toBeTrue();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
    });

    it('shows the compare-two-fans alert and hides the form when the scenario is not what-if', () => {
      createComponent({ modificationExists: true, whatIfScenario: false });
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
      expect(hasText('.alert-warning h3', COMPARE_TWO_FANS_HEADING)).toBeTrue();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).toBeNull();
      expect(hasText('h3', WHAT_IF_HEADING)).toBeFalse();
      expect(fixture.nativeElement.querySelector('.no-data')).toBeNull();
    });

    it('shows neither the form nor the alert when the scenario type is not set', () => {
      createComponent({ modificationExists: true, whatIfScenario: undefined });
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });

    it('shows only the no-data panel with the explore button when no modification exists', () => {
      createComponent({ modificationExists: false });
      expect(fixture.nativeElement.querySelector('.no-data')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.no-data button').textContent).toContain('Explore Opportunities');
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();
    });
  });

  describe('template visibility: results panel and placeholder', () => {
    it('shows the results panel and hides the other tab content when a modification exists on the results tab', () => {
      createComponent({ modificationExists: true });
      expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-fsat-sankey')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).toBeNull();
      expect(hasText('p', NO_MODIFICATION_PLACEHOLDER)).toBeFalse();
    });

    it('hides the results panel and shows the placeholder when no modification exists on the results tab', () => {
      createComponent({ modificationExists: false });
      expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
      expect(hasText('p', NO_MODIFICATION_PLACEHOLDER)).toBeTrue();
    });

    it('hides the results panel when the results tab is left', () => {
      createComponent({ modificationExists: true });
      selectTab('Help');
      expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
    });
  });

  describe('template visibility: help tab', () => {
    it('shows the help panel and hides the results panel when the help tab is selected', () => {
      createComponent({ modificationExists: true });
      selectTab('Help');
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
    });

    it('shows the help panel and hides the placeholder when the help tab is selected without a modification', () => {
      createComponent({ modificationExists: false });
      selectTab('Help');
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).not.toBeNull();
      expect(hasText('p', NO_MODIFICATION_PLACEHOLDER)).toBeFalse();
    });

    it('shows the placeholder again when leaving the help tab without a modification', () => {
      createComponent({ modificationExists: false });
      selectTab('Help');
      selectTab('Results');
      expect(fixture.nativeElement.querySelector('app-explore-opportunities-help')).toBeNull();
      expect(hasText('p', NO_MODIFICATION_PLACEHOLDER)).toBeTrue();
    });
  });

  describe('template visibility: sankey tab', () => {
    it('shows only the baseline sankey by default when a modification exists', () => {
      createComponent({ modificationExists: true });
      selectTab('Sankey');
      expect(getSankeys().length).toBe(1);
      expect(getSankeys()[0].isBaseline).toBeTrue();
      expect(fixture.nativeElement.querySelector('app-fsat-results-panel')).toBeNull();
    });

    it('shows only the modification sankey after the Modification toggle is clicked', () => {
      createComponent({ modificationExists: true });
      selectTab('Sankey');
      clickSankeyToggle('Modification');
      expect(getSankeys().length).toBe(1);
      expect(getSankeys()[0].isBaseline).toBeFalse();
    });

    it('shows only the baseline sankey again after the Baseline toggle is clicked', () => {
      createComponent({ modificationExists: true });
      selectTab('Sankey');
      clickSankeyToggle('Modification');
      clickSankeyToggle('Baseline');
      expect(getSankeys().length).toBe(1);
      expect(getSankeys()[0].isBaseline).toBeTrue();
    });

    it('hides the sankey view and shows the placeholder when no modification exists', () => {
      createComponent({ modificationExists: false });
      selectTab('Sankey');
      expect(getSankeys().length).toBe(0);
      expect(fixture.nativeElement.querySelector('.btn-group')).toBeNull();
      expect(hasText('p', NO_MODIFICATION_PLACEHOLDER)).toBeTrue();
    });
  });

  describe('user actions', () => {
    it('selects the clicked result tab', () => {
      createComponent();
      selectTab('Sankey');
      expect(component.tabSelect).toBe('sankey');
      selectTab('Help');
      expect(component.tabSelect).toBe('help');
      selectTab('Results');
      expect(component.tabSelect).toBe('results');
    });

    it('selects the clicked small screen tab', () => {
      createComponent();
      const navItems: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.small-tab-select .nav-item'));

      navItems.find(item => item.textContent.trim() === 'Details').click();
      expect(component.smallScreenTab).toBe('details');

      navItems.find(item => item.textContent.trim() === 'Select Projects').click();
      expect(component.smallScreenTab).toBe('form');
    });

    it('opens the new modification modal when the Explore Opportunities button is clicked', () => {
      createComponent({ modificationExists: false });
      expect(openNewModal.value).toBeFalse();

      fixture.nativeElement.querySelector('.no-data button').click();

      expect(openNewModal.value).toBeTrue();
    });

    it('emits the assessment fsat when save is triggered', () => {
      createComponent();
      const emitted: FSAT[] = [];
      component.emitSave.subscribe((value: FSAT) => emitted.push(value));

      component.save();

      expect(emitted).toEqual([fsat]);
    });

    it('emits emitAddNewMod when a new modification is requested', () => {
      createComponent();
      const emitted: boolean[] = [];
      component.emitAddNewMod.subscribe((value: boolean) => emitted.push(value));

      component.addNewMod();

      expect(emitted).toEqual([true]);
    });
  });
});
