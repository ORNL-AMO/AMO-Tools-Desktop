import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { O2UtilizationRateComponent } from './o2-utilization-rate.component';
import { O2UtilizationRateService } from './o2-utilization-rate.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';

function makeSettingsDbService(defaultPanelTab?: string): Partial<SettingsDbService> {
  return { globalSettings: { defaultPanelTab } as Settings };
}

describe('O2UtilizationRateComponent', () => {
  let component: O2UtilizationRateComponent;
  let fixture: ComponentFixture<O2UtilizationRateComponent>;
  let o2Service: O2UtilizationRateService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  async function configure(defaultPanelTab?: string) {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [O2UtilizationRateComponent],
      providers: [
        O2UtilizationRateService,
        { provide: SettingsDbService, useValue: makeSettingsDbService(defaultPanelTab) },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    o2Service = TestBed.inject(O2UtilizationRateService);
    fixture = TestBed.createComponent(O2UtilizationRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  describe('initialization', () => {
    it('sends the calculator analytics event', async () => {
      await configure();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-WW-o2-utilization-rate');
    });

    it('defaults to the help tab when no default panel tab is set', async () => {
      await configure();
      expect(component.tabSelect).toBe('help');
    });

    it('uses the global default panel tab when one is set', async () => {
      await configure('results');
      expect(component.tabSelect).toBe('results');
    });

    it('starts on the form small-screen tab', async () => {
      await configure();
      expect(component.smallScreenTab).toBe('form');
    });
  });

  describe('user actions', () => {
    beforeEach(async () => {
      await configure();
    });

    it('btnGenerateExample pushes the example data points to the service', () => {
      component.btnGenerateExample();
      expect(o2Service.inputDataPoints.getValue()).toEqual(o2Service.getExampleData());
    });

    it('btnResetData pushes the initial data points to the service', () => {
      component.btnGenerateExample();
      component.btnResetData();
      expect(o2Service.inputDataPoints.getValue()).toEqual(o2Service.getInitialDataPoints());
    });

    it('the Generate Example button triggers btnGenerateExample', () => {
      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      buttons.find(button => button.textContent.includes('Generate Example')).click();
      expect(o2Service.inputDataPoints.getValue()).toEqual(o2Service.getExampleData());
    });

    it('setTab updates the selected tab', () => {
      component.setTab('results');
      expect(component.tabSelect).toBe('results');
    });

    it('setSmallScreenTab updates the small-screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('resize', () => {
    beforeEach(async () => {
      await configure();
    });

    it('resizeTabs computes the header and container heights from the view', () => {
      component.resizeTabs();
      const header: HTMLElement = component.leftPanelHeader.nativeElement;
      const container: HTMLElement = component.contentContainer.nativeElement;
      const smallTabs: HTMLElement = component.smallTabSelect.nativeElement;
      expect(component.headerHeight).toBe(header.clientHeight);
      expect(component.containerHeight).toBe(container.offsetHeight - header.offsetHeight - smallTabs.offsetHeight);
    });

    it('window resize recalculates the tab sizes after a delay', fakeAsync(() => {
      const resizeSpy = spyOn(component, 'resizeTabs');
      window.dispatchEvent(new Event('resize'));
      expect(resizeSpy).not.toHaveBeenCalled();
      tick(100);
      expect(resizeSpy).toHaveBeenCalled();
    }));
  });

  describe('template visibility', () => {
    it('shows the help panel and hides the graph/results when the help tab is selected', async () => {
      await configure();
      expect(query('app-o2-utilization-rate-help')).not.toBeNull();
      expect(query('app-o2-utilization-rate-graph')).toBeNull();
      expect(query('app-o2-utilization-rate-results')).toBeNull();
    });

    it('shows the graph and results and hides the help panel when the results tab is selected', async () => {
      await configure();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-o2-utilization-rate-help')).toBeNull();
      expect(query('app-o2-utilization-rate-graph')).not.toBeNull();
      expect(query('app-o2-utilization-rate-results')).not.toBeNull();
    });

    it('switches back to help when the Help tab link is clicked', async () => {
      await configure('results');
      const links: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'));
      links.find(link => link.textContent.includes('Help')).click();
      fixture.detectChanges();
      expect(query('app-o2-utilization-rate-help')).not.toBeNull();
      expect(query('app-o2-utilization-rate-graph')).toBeNull();
    });

    it('always renders the data form', async () => {
      await configure();
      expect(query('app-o2-utilization-rate-form')).not.toBeNull();
    });
  });
});
