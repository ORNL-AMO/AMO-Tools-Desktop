import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ProcessHeatingModification } from '../models/modification';
import { HEAT_BALANCE_VIEW_LINKS, LossView, ProcessHeatingView, ViewLink } from '../models/views';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';
import { LossTabBadgeComponent } from '../heat-balance/loss-tab-badge/loss-tab-badge.component';
import { ExpertViewComponent } from './expert-view.component';

const EXPERT_VIEW_TABS: ViewLink[] = HEAT_BALANCE_VIEW_LINKS.filter(link =>
  link.view === LossView.CHARGE_MATERIAL || link.view === LossView.WALL_LOSSES || link.view === LossView.EXTENDED_SURFACE
    || link.view === LossView.ENERGY_INPUT_EXHAUST_GAS
    || link.view === LossView.ENERGY_INPUT || link.view === LossView.EXHAUST_GAS || link.view === LossView.SLAG
    || link.view === LossView.HEAT_SYSTEM_EFFICIENCY
);

class FakeModificationService {
  readonly selectedModification: WritableSignal<ProcessHeatingModification | undefined> =
    signal<ProcessHeatingModification | undefined>({ id: 'mod-1', scenarioOverrides: { name: 'Scenario 1' } });
  readonly modifications = signal<ProcessHeatingModification[]>([]);
}

class FakeProcessHeatingUiService {
  readonly visibleExpertViewTabs = signal<ViewLink[]>(EXPERT_VIEW_TABS);
  readonly selectedExpertViewTab: WritableSignal<ProcessHeatingView | undefined> = signal<ProcessHeatingView | undefined>(LossView.CHARGE_MATERIAL);

  readonly counts = signal<Record<string, Partial<Record<string, number>>>>({});

  selectExpertViewTab(view: ProcessHeatingView): void {
    this.selectedExpertViewTab.set(view);
  }

  lossCount(view: string, scenario = 'baseline'): number | undefined {
    return this.counts()[scenario]?.[view] ?? 0;
  }
}

class FakeValidityService {
  readonly invalidSteps = signal<Record<string, string[]>>({});

  isStepValid(scenario: string, view: string): boolean {
    return !this.invalidSteps()[scenario]?.includes(view);
  }
}

describe('ExpertViewComponent', () => {
  let fixture: ComponentFixture<ExpertViewComponent>;
  let modificationService: FakeModificationService;
  let uiService: FakeProcessHeatingUiService;
  let validityService: FakeValidityService;

  const badges = (): { label: string; badge: string; isValid: boolean }[] =>
    query('.tabs li .badge').map(badge => ({
      label: badge.closest('a').firstChild.textContent.trim(),
      badge: badge.textContent.trim(),
      isValid: badge.classList.contains('success'),
    }));

  function query(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpertViewComponent, LossTabBadgeComponent],
      providers: [
        { provide: ModificationService, useClass: FakeModificationService },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
        { provide: ProcessHeatingValidityService, useClass: FakeValidityService },
        { provide: ModalDialogService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService) as unknown as FakeModificationService;
    uiService = TestBed.inject(ProcessHeatingUiService) as unknown as FakeProcessHeatingUiService;
    validityService = TestBed.inject(ProcessHeatingValidityService) as unknown as FakeValidityService;
    fixture = TestBed.createComponent(ExpertViewComponent);
    fixture.detectChanges();
  });

  it('renders one tab per built loss type', () => {
    expect(query('.tabs li').map(tab => tab.textContent.trim())).toEqual(['Charge Material', 'Wall Losses', 'Extended Surface', 'Energy Input Exhaust Gas', 'Energy Input', 'Exhaust Gas', 'Slag', 'Heat System Efficiency']);
  });

  it('shows charge material in both panels by default', () => {
    expect(query('app-charge-material').length).toBe(2);
    expect(query('app-wall-losses').length).toBe(0);
    expect(query('.tabs li.active')[0].textContent.trim()).toBe('Charge Material');
  });

  it('switches both panels to the selected tab, passing baseline and the modification id', () => {
    query('.tabs li')[1].click();
    fixture.detectChanges();

    const panels = query('app-wall-losses') as (HTMLElement & { scenario: string })[];
    expect(query('app-charge-material').length).toBe(0);
    expect(panels.map(panel => panel.scenario)).toEqual(['baseline', 'mod-1']);
    expect(query('.tabs li.active')[0].textContent.trim()).toBe('Wall Losses');
  });

  it('shows Operations in both panels with baseline and the modification id', () => {
    uiService.selectExpertViewTab(LossView.OPERATIONS);
    fixture.detectChanges();

    const panels = query('app-process-heating-operations') as (HTMLElement & { scenario: string })[];
    expect(query('app-charge-material').length).toBe(0);
    expect(panels.map(panel => panel.scenario)).toEqual(['baseline', 'mod-1']);
  });

  it('switches both panels to Energy Input Exhaust Gas with baseline and the modification id', () => {
    query('.tabs li')[3].click();
    fixture.detectChanges();

    const panels = query('app-energy-input-exhaust-gas') as (HTMLElement & { scenario: string })[];
    expect(query('app-charge-material').length).toBe(0);
    expect(panels.map(panel => panel.scenario)).toEqual(['baseline', 'mod-1']);
    expect(query('.tabs li.active')[0].textContent.trim()).toBe('Energy Input Exhaust Gas');
  });

  const eafAndEfficiencyTabs: { index: number; selector: string; label: string }[] = [
    { index: 4, selector: 'app-energy-input', label: 'Energy Input' },
    { index: 5, selector: 'app-exhaust-gas', label: 'Exhaust Gas' },
    { index: 6, selector: 'app-slag', label: 'Slag' },
    { index: 7, selector: 'app-heat-system-efficiency', label: 'Heat System Efficiency' },
  ];

  for (const { index, selector, label } of eafAndEfficiencyTabs) {
    it(`switches both panels to ${label} with baseline and the modification id`, () => {
      query('.tabs li')[index].click();
      fixture.detectChanges();

      const panels = query(selector) as (HTMLElement & { scenario: string })[];
      expect(panels.map(panel => panel.scenario)).toEqual(['baseline', 'mod-1']);
      expect(query('.tabs li.active')[0].textContent.trim()).toBe(label);
    });
  }

  it('shows the modification\'s entry count on each tab, green while both scenarios are valid', () => {
    uiService.counts.set({
      baseline: { [LossView.WALL_LOSSES]: 1 },
      'mod-1': { [LossView.CHARGE_MATERIAL]: 2, [LossView.WALL_LOSSES]: 3 },
    });
    fixture.detectChanges();

    expect(badges()).toEqual([
      { label: 'Charge Material', badge: '2', isValid: true },
      { label: 'Wall Losses', badge: '3', isValid: true },
    ]);
  });

  it('turns a tab red when only the baseline step is invalid', () => {
    uiService.counts.set({ 'mod-1': { [LossView.WALL_LOSSES]: 3 } });
    validityService.invalidSteps.set({ baseline: [LossView.WALL_LOSSES] });
    fixture.detectChanges();

    expect(badges()).toEqual([{ label: 'Wall Losses', badge: '3', isValid: false }]);
  });

  it('turns a tab red when only the modification step is invalid', () => {
    uiService.counts.set({ 'mod-1': { [LossView.SLAG]: 1 } });
    validityService.invalidSteps.set({ 'mod-1': [LossView.SLAG] });
    fixture.detectChanges();

    expect(badges()).toEqual([{ label: 'Slag', badge: '1', isValid: false }]);
  });

  it('gives only the invalid tabs an accessible name and tooltip stating why they are marked', () => {
    validityService.invalidSteps.set({ 'mod-1': [LossView.WALL_LOSSES] });
    fixture.detectChanges();

    const links = query('.tabs li > a');
    expect(links[1].getAttribute('aria-label')).toBe('Wall Losses, has invalid inputs');
    expect(links[1].getAttribute('title')).toBe('Wall Losses, has invalid inputs');
    expect(links[0].hasAttribute('aria-label')).toBeFalse();
  });

  it('shows no tabs when there is no modification', () => {
    modificationService.selectedModification.set(undefined);
    fixture.detectChanges();

    expect(query('.tabs').length).toBe(0);
  });
});
