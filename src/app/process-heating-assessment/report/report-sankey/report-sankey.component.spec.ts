import { Component, Input, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PhastValidService } from '../../../phast/phast-valid.service';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { PHAST, PhastValid } from '../../../shared/models/phast/phast';
import { SankeyScenarioPickerComponent } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';
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
  let checkValid: jasmine.Spy;

  const pickers = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('app-sankey-scenario-picker'));

  beforeEach(() => {
    ui = signal<ReportSankeyUI | undefined>(buildUI());
    checkValid = jasmine.createSpy('checkValid');
    TestBed.configureTestingModule({
      declarations: [ReportSankeyComponent],
      providers: [
        { provide: ReportSankeyResultsService, useValue: { reportSankeyUI: ui } },
        { provide: ProcessHeatingValidityService, useValue: { checkValid: checkValid } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('checks the sankey input with the module validity service instead of legacy validity', () => {
    const invalid = { isValid: false } as PhastValid;
    checkValid.and.returnValue(invalid);
    const phast = { name: 'scenario' } as PHAST;
    const settings = { energyResultUnit: 'MMBtu' } as Settings;

    const result = fixture.debugElement.injector.get(PhastValidService).checkValid(phast, settings);

    expect(checkValid).toHaveBeenCalledWith(phast, settings);
    expect(result).toBe(invalid);
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
    expect(component.pickerOptions().map(option => option.name)).toEqual(['Baseline', 'Scenario 1']);
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

@Component({ selector: 'app-phast-sankey', template: '', standalone: false })
class StubPhastSankeyComponent {
  @Input() phast: PHAST;
  @Input() settings: Settings;
  @Input() labelStyle: string;
}

describe('ReportSankeyComponent with the shared scenario picker', () => {
  it('renders without looping change detection', async () => {
    TestBed.configureTestingModule({
      declarations: [ReportSankeyComponent, SankeyScenarioPickerComponent, StubPhastSankeyComponent],
      imports: [FormsModule],
      providers: [{ provide: ReportSankeyResultsService, useValue: { reportSankeyUI: signal(buildUI()) } }],
    });
    const fixture = TestBed.createComponent(ReportSankeyComponent);

    fixture.autoDetectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('option').length).toBe(4);
  });
});
