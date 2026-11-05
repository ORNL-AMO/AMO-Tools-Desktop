import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PhastValidService } from '../../phast/phast-valid.service';
import { PHAST as SharedPHAST, PhastValid } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';
import { ProcessHeatingSankeyComponent } from './process-heating-sankey.component';
import { SankeyResultsService, SankeyScenario } from './sankey-results.service';

function buildScenarios(count = 3): SankeyScenario[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i === 0 ? 'baseline' : `mod${i}`,
    name: i === 0 ? 'Baseline' : `Scenario ${i}`,
    phast: { name: `phast${i}` } as SharedPHAST,
  }));
}

describe('ProcessHeatingSankeyComponent', () => {
  let fixture: ComponentFixture<ProcessHeatingSankeyComponent>;
  let component: ProcessHeatingSankeyComponent;
  let scenarios: WritableSignal<SankeyScenario[]>;
  let invalidIds: WritableSignal<string[]>;
  let scenarioValidity: jasmine.Spy;

  const options = (): string[] =>
    Array.from<HTMLOptionElement>(fixture.nativeElement.querySelectorAll('option')).map(option => option.textContent.trim());
  const sankeys = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('app-phast-sankey'));

  beforeEach(() => {
    scenarios = signal(buildScenarios());
    invalidIds = signal<string[]>([]);
    scenarioValidity = jasmine.createSpy('scenarioValidity').and.callFake((id: string) => ({ isValid: !invalidIds().includes(id) }) as PhastValid);
    TestBed.configureTestingModule({
      declarations: [ProcessHeatingSankeyComponent],
      imports: [FormsModule],
      providers: [
        { provide: SankeyResultsService, useValue: { scenarios, settings: signal({ energyResultUnit: 'MMBtu' } as Settings) } },
        { provide: ProcessHeatingValidityService, useValue: { scenarioValidity } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ProcessHeatingSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('lists every valid scenario as an option', () => {
      expect(options()).toEqual(['Baseline', 'Scenario 1', 'Scenario 2']);
    });

    it('shows the baseline sankey by default', () => {
      expect(component.selectedScenario().id).toBe('baseline');
      expect(sankeys().length).toBe(1);
    });

    it('defaults label style to both', () => {
      expect(component.labelStyle()).toBe('both');
    });
  });

  describe('computed state', () => {
    it('hides invalid modifications', () => {
      invalidIds.set(['mod1']);
      fixture.detectChanges();
      expect(options()).toEqual(['Baseline', 'Scenario 2']);
    });

    it('falls back to the first scenario when the selected one becomes invalid', () => {
      component.selectedId.set('mod2');
      invalidIds.set(['mod2']);
      expect(component.selectedScenario().id).toBe('baseline');
    });

    it('falls back to the first scenario when the selected one is deleted', () => {
      component.selectedId.set('mod2');
      scenarios.set(buildScenarios(2));
      expect(component.selectedScenario().id).toBe('baseline');
    });

    it('renders no sankey when there are no scenarios', () => {
      scenarios.set([]);
      fixture.detectChanges();
      expect(sankeys().length).toBe(0);
    });
  });

  describe('user actions', () => {
    it('shows the scenario picked in the dropdown', async () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      select.selectedIndex = 2;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.selectedId()).toBe('mod2');
      expect(component.selectedScenario().phast).toBe(scenarios()[2].phast);
    });

    it('switches label style from the buttons and marks the active one', () => {
      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      buttons[0].click();
      fixture.detectChanges();

      expect(component.labelStyle()).toBe('percent');
      expect(buttons[0].classList).toContain('active');
      expect(buttons[2].classList).not.toContain('active');
    });
  });

  it('checks the sankey input against its scenario\'s cached module validity instead of legacy validity', () => {
    const { phast } = scenarios()[1];
    scenarioValidity.calls.reset();

    const result = fixture.debugElement.injector.get(PhastValidService).checkValid(phast, {} as Settings);

    expect(scenarioValidity).toHaveBeenCalledWith('mod1');
    expect(result.isValid).toBeTrue();
  });
});
