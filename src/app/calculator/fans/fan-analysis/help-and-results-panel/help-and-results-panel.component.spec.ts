import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HelpAndResultsPanelComponent } from './help-and-results-panel.component';
import { FanAnalysisService } from '../fan-analysis.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeFanAnalysisService(stepTab: string = 'fan-info'): Partial<FanAnalysisService> {
  return { stepTab: new BehaviorSubject<string>(stepTab) };
}

describe('HelpAndResultsPanelComponent', () => {
  let component: HelpAndResultsPanelComponent;
  let fixture: ComponentFixture<HelpAndResultsPanelComponent>;
  let fanAnalysisService: Partial<FanAnalysisService>;

  function tabLabels(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item') as NodeListOf<HTMLElement>)
      .map(tab => tab.textContent.trim());
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  beforeEach(async () => {
    fanAnalysisService = makeFanAnalysisService();

    await TestBed.configureTestingModule({
      declarations: [HelpAndResultsPanelComponent],
      providers: [{ provide: FanAnalysisService, useValue: fanAnalysisService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpAndResultsPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes stepTab from the fan analysis service', () => {
      expect(component.stepTab).toBe('fan-info');
    });

    it('starts on the help tab when stepTab is not gas-density', () => {
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('observe stepTab', () => {
    it('switches to the results tab when stepTab becomes gas-density', () => {
      fanAnalysisService.stepTab.next('gas-density');
      expect(component.tabSelect).toBe('results');
    });

    it('returns to the help tab when leaving gas-density while on results', () => {
      fanAnalysisService.stepTab.next('gas-density');
      fanAnalysisService.stepTab.next('fan-shaft-power');
      expect(component.tabSelect).toBe('help');
    });

    it('keeps the diagram tab when stepTab changes to a non gas-density step', () => {
      component.setTab('diagram');
      fanAnalysisService.stepTab.next('plane-data');
      expect(component.tabSelect).toBe('diagram');
    });
  });

  describe('setTab', () => {
    it('updates tabSelect', () => {
      component.setTab('diagram');
      expect(component.tabSelect).toBe('diagram');
    });
  });

  describe('template visibility', () => {
    it('hides the Results tab when stepTab is not gas-density', () => {
      expect(tabLabels()).toEqual(['Help', 'Diagram']);
    });

    it('shows the Results tab when stepTab is gas-density', () => {
      fanAnalysisService.stepTab.next('gas-density');
      fixture.detectChanges();
      expect(tabLabels()).toEqual(['Results', 'Help', 'Diagram']);
    });

    it('shows help content and hides diagram/results content on the help tab', () => {
      expect(query('app-operating-points-help')).not.toBeNull();
      expect(query('app-fan-diagram-image')).not.toBeNull();
      expect(query('app-planar-results')).toBeNull();
      expect(query('app-gas-density-results')).toBeNull();
    });

    it('shows diagram content and hides help/results content on the diagram tab', () => {
      component.setTab('diagram');
      fixture.detectChanges();
      expect(query('app-planar-results')).not.toBeNull();
      expect(query('app-fan-diagram-image')).not.toBeNull();
      expect(query('app-operating-points-help')).toBeNull();
      expect(query('app-gas-density-results')).toBeNull();
    });

    it('shows gas density results only when on results tab and stepTab is gas-density', () => {
      fanAnalysisService.stepTab.next('gas-density');
      fixture.detectChanges();
      expect(query('app-gas-density-results')).not.toBeNull();
      expect(query('app-operating-points-help')).toBeNull();
      expect(query('app-planar-results')).toBeNull();
      expect(query('app-fan-diagram-image')).toBeNull();
    });

    it('hides gas density results when results tab is selected but stepTab is not gas-density', () => {
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-gas-density-results')).toBeNull();
      expect(query('app-operating-points-help')).toBeNull();
      expect(query('app-planar-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops reacting to stepTab after destroy', () => {
      fixture.destroy();
      fanAnalysisService.stepTab.next('gas-density');
      expect(component.tabSelect).toBe('help');
    });
  });
});
