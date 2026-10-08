import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { PHAST } from '../../../shared/models/phast/phast';
import { ReportSankeyComponent } from './report-sankey.component';
import { ReportSankeyResultsService, ReportSankeyUI } from './report-sankey-results.service';

function buildUI(scenarioCount = 2): ReportSankeyUI {
  return {
    settings: { energyResultUnit: 'MMBtu' } as Settings,
    scenarios: Array.from({ length: scenarioCount }, (_, i) => ({
      id: i === 0 ? 'baseline' : `mod${i}`,
      name: i === 0 ? 'Baseline' : `Scenario ${i}`,
      phast: { name: `phast${i}` } as PHAST,
      costSavings: i * 1000,
      energySavings: i * 100,
    })),
    energySavingsUnit: 'MMBtu/yr',
  };
}

describe('ReportSankeyComponent', () => {
  let fixture: ComponentFixture<ReportSankeyComponent>;
  let component: ReportSankeyComponent;
  let ui: WritableSignal<ReportSankeyUI | undefined>;

  const pickers = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('app-sankey-scenario-picker'));

  beforeEach(() => {
    ui = signal<ReportSankeyUI | undefined>(buildUI());
    TestBed.configureTestingModule({
      declarations: [ReportSankeyComponent],
      providers: [{ provide: ReportSankeyResultsService, useValue: { reportSankeyUI: ui } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders one picker with a sankey per scenario', () => {
    expect(pickers().length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('app-phast-sankey').length).toBe(2);
  });

  it('shows each picker its own scenario by default', () => {
    expect(component.getScenario(ui(), 0).id).toBe('baseline');
    expect(component.getScenario(ui(), 1).id).toBe('mod1');
  });

  it('switches only the picker that was changed', () => {
    component.selectScenario(1, 'baseline');
    expect(component.getScenario(ui(), 1).id).toBe('baseline');
    expect(component.getScenario(ui(), 0).id).toBe('baseline');
  });

  it('lists every scenario as a picker option', () => {
    expect(component.getOptions(ui()).map(option => option.name)).toEqual(['Baseline', 'Scenario 1']);
  });

  it('defaults label style to both and switches it from the buttons', () => {
    expect(component.labelStyle()).toBe('both');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(component.labelStyle()).toBe('percent');
  });

  it('renders nothing when results are unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(pickers().length).toBe(0);
  });
});
