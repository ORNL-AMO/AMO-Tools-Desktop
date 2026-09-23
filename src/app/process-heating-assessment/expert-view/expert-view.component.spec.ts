import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ProcessHeatingModification } from '../models/modification';
import { HEAT_BALANCE_VIEW_LINKS, LossView, ProcessHeatingView, ViewLink } from '../models/views';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ExpertViewComponent } from './expert-view.component';

const EXPERT_VIEW_TABS: ViewLink[] = HEAT_BALANCE_VIEW_LINKS.filter(link =>
  link.view === LossView.CHARGE_MATERIAL || link.view === LossView.WALL_LOSSES || link.view === LossView.EXTENDED_SURFACE
);

class FakeModificationService {
  readonly selectedModification: WritableSignal<ProcessHeatingModification | undefined> =
    signal<ProcessHeatingModification | undefined>({ id: 'mod-1', scenarioOverrides: { name: 'Scenario 1' } });
  readonly modifications = signal<ProcessHeatingModification[]>([]);
}

class FakeProcessHeatingUiService {
  readonly visibleExpertViewTabs = signal<ViewLink[]>(EXPERT_VIEW_TABS);
  readonly selectedExpertViewTab: WritableSignal<ProcessHeatingView | undefined> = signal<ProcessHeatingView | undefined>(LossView.CHARGE_MATERIAL);

  selectExpertViewTab(view: ProcessHeatingView): void {
    this.selectedExpertViewTab.set(view);
  }
}

describe('ExpertViewComponent', () => {
  let fixture: ComponentFixture<ExpertViewComponent>;
  let modificationService: FakeModificationService;

  function query(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpertViewComponent],
      providers: [
        { provide: ModificationService, useClass: FakeModificationService },
        { provide: ProcessHeatingUiService, useClass: FakeProcessHeatingUiService },
        { provide: ModalDialogService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    modificationService = TestBed.inject(ModificationService) as unknown as FakeModificationService;
    fixture = TestBed.createComponent(ExpertViewComponent);
    fixture.detectChanges();
  });

  it('renders one tab per built loss type', () => {
    expect(query('.tabs li').map(tab => tab.textContent.trim())).toEqual(['Charge Material', 'Wall Losses', 'Extended Surface']);
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

  it('shows no tabs when there is no modification', () => {
    modificationService.selectedModification.set(undefined);
    fixture.detectChanges();

    expect(query('.tabs').length).toBe(0);
  });
});
