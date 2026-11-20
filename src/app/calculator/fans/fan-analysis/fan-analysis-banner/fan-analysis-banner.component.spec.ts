import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FanAnalysisBannerComponent } from './fan-analysis-banner.component';
import { FanAnalysisService } from '../fan-analysis.service';
import { PlaneDataFormService } from '../fan-analysis-form/plane-data-form/plane-data-form.service';
import { FanInfoFormService } from '../fan-analysis-form/fan-info-form/fan-info-form.service';
import { GasDensityFormService } from '../fan-analysis-form/gas-density-form/gas-density-form.service';
import { FanShaftPowerFormService } from '../fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeFanAnalysisService(): FanAnalysisService {
  const service = new FanAnalysisService(null, null, null, null);
  service.inputData = service.getDefaultData();
  return service;
}

describe('FanAnalysisBannerComponent', () => {
  let component: FanAnalysisBannerComponent;
  let fixture: ComponentFixture<FanAnalysisBannerComponent>;
  let fanAnalysisService: FanAnalysisService;
  let planeDataFormServiceSpy: jasmine.SpyObj<PlaneDataFormService>;
  let fanInfoFormServiceSpy: jasmine.SpyObj<FanInfoFormService>;
  let gasDensityFormServiceSpy: jasmine.SpyObj<GasDensityFormService>;
  let fanShaftPowerFormServiceSpy: jasmine.SpyObj<FanShaftPowerFormService>;

  async function createComponent(inAssessment: boolean, allValid: boolean = true) {
    fanAnalysisService = makeFanAnalysisService();
    planeDataFormServiceSpy = jasmine.createSpyObj('PlaneDataFormService', ['checkPlaneDataValid']);
    planeDataFormServiceSpy.checkPlaneDataValid.and.returnValue(allValid);
    fanInfoFormServiceSpy = jasmine.createSpyObj('FanInfoFormService', ['getBasicsFormFromObject']);
    fanInfoFormServiceSpy.getBasicsFormFromObject.and.returnValue({ valid: allValid } as any);
    gasDensityFormServiceSpy = jasmine.createSpyObj('GasDensityFormService', ['getGasDensityFormFromObj']);
    gasDensityFormServiceSpy.getGasDensityFormFromObj.and.returnValue({ valid: allValid } as any);
    fanShaftPowerFormServiceSpy = jasmine.createSpyObj('FanShaftPowerFormService', ['getShaftPowerFormFromObj']);
    fanShaftPowerFormServiceSpy.getShaftPowerFormFromObj.and.returnValue({ valid: allValid } as any);

    await TestBed.configureTestingModule({
      declarations: [FanAnalysisBannerComponent],
      providers: [
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: PlaneDataFormService, useValue: planeDataFormServiceSpy },
        { provide: FanInfoFormService, useValue: fanInfoFormServiceSpy },
        { provide: GasDensityFormService, useValue: gasDensityFormServiceSpy },
        { provide: FanShaftPowerFormService, useValue: fanShaftPowerFormServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanAnalysisBannerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inAssessment', inAssessment);
    fixture.detectChanges();
  }

  describe('initialization', () => {
    beforeEach(async () => await createComponent(false));

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('takes the current main and step tabs from the service', () => {
      expect(component.mainTab).toBe('fan-setup');
      expect(component.stepTab).toBe('fan-info');
    });

    it('marks the current step tab active', () => {
      expect(component.basicsClassStatus).toEqual(['active']);
      expect(component.gasClassStatus).toEqual([]);
    });
  });

  describe('status class arrays', () => {
    it('marks incomplete steps as missing data and disables results', async () => {
      await createComponent(false, false);
      expect(component.planeDataClassStatus).toEqual(['missing-data']);
      expect(component.gasClassStatus).toEqual(['missing-data']);
      expect(component.shaftPowerClassStatus).toEqual(['missing-data']);
      expect(component.resultsTabClassStatus).toEqual(['disabled']);
    });

    it('recomputes status when getResults emits', async () => {
      await createComponent(false, true);
      planeDataFormServiceSpy.checkPlaneDataValid.and.returnValue(false);
      fanAnalysisService.getResults.next(true);
      expect(component.planeDataClassStatus).toEqual(['missing-data']);
      expect(component.resultsTabClassStatus).toEqual(['disabled']);
    });
  });

  describe('template visibility', () => {
    it('shows the standalone banner when not in an assessment', async () => {
      await createComponent(false);
      const banner = fixture.nativeElement.querySelector('nav.banner');
      expect(banner).not.toBeNull();
      expect(banner.textContent).toContain('Fan Traverse Analysis');
    });

    it('hides the standalone banner when in an assessment', async () => {
      await createComponent(true);
      expect(fixture.nativeElement.querySelector('nav.banner')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('changeStepTab moves to a regular step', async () => {
      await createComponent(false);
      component.changeStepTab('gas-density');
      expect(fanAnalysisService.stepTab.value).toBe('gas-density');
      expect(component.gasClassStatus).toEqual(['active']);
    });

    it('changeStepTab does not move to results while results are disabled', async () => {
      await createComponent(false, false);
      component.changeStepTab('fan-analysis-results');
      expect(fanAnalysisService.stepTab.value).toBe('fan-info');
    });

    it('changeStepTab moves to results when every step is complete', async () => {
      await createComponent(false, true);
      component.changeStepTab('fan-analysis-results');
      expect(fanAnalysisService.stepTab.value).toBe('fan-analysis-results');
    });

    it('changeTab sets the main tab', async () => {
      await createComponent(false);
      component.changeTab('fan-results');
      expect(fanAnalysisService.mainTab.value).toBe('fan-results');
    });

    it('changeTabNextOrBack emits the direction', async () => {
      await createComponent(false);
      const emitted: Array<string> = [];
      component.emitChangeTabs.subscribe(val => emitted.push(val));
      component.changeTabNextOrBack('next');
      expect(emitted).toEqual(['next']);
    });
  });

  describe('destroy', () => {
    it('stops following stepTab after the component is destroyed', async () => {
      await createComponent(false);
      fixture.destroy();
      fanAnalysisService.stepTab.next('gas-density');
      expect(component.stepTab).toBe('fan-info');
    });
  });
});
