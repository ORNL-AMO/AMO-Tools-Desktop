import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WasteWaterService } from './waste-water.service';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { WasteWaterSuiteApiService } from '../tools-suite-api/waste-water-suite-api.service';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { ConvertWasteWaterService } from './convert-waste-water.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { WasteWaterOperationsService } from './waste-water-operations/waste-water-operations.service';

describe('WasteWaterService main tab navigation', () => {
  let service: WasteWaterService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        WasteWaterService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedSludgeFormService, useValue: {} },
        { provide: SystemBasicsService, useValue: {} },
        { provide: AssessmentCo2SavingsService, useValue: {} },
        { provide: WasteWaterSuiteApiService, useValue: {} },
        { provide: AeratorPerformanceFormService, useValue: {} },
        { provide: ConvertWasteWaterService, useValue: {} },
        { provide: ConvertUnitsService, useValue: {} },
        { provide: WasteWaterOperationsService, useValue: {} },
      ],
    });
    service = TestBed.inject(WasteWaterService);
    service.assessmentId = 7;
  });

  describe('goToMainTab', () => {
    it('navigates to the main tab route for the assessment', () => {
      service.goToMainTab('report');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 7, 'report']);
    });

    it('does not navigate without an assessment id', () => {
      service.assessmentId = undefined;
      service.goToMainTab('report');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('continueMainTab / backMainTab', () => {
    it('continueMainTab navigates to the next main tab', () => {
      service.mainTab.next('analysis');
      service.continueMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 7, 'diagram']);
    });

    it('continueMainTab does nothing on the last main tab', () => {
      service.mainTab.next('calculators');
      service.continueMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('backMainTab navigates to the previous main tab', () => {
      service.mainTab.next('report');
      service.backMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 7, 'diagram']);
    });

    it('backMainTab does nothing on the first main tab', () => {
      service.mainTab.next('baseline');
      service.backMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('setup step continue / back', () => {
    it('continue from aerator-performance navigates to assessment', () => {
      service.setupTab.next('aerator-performance');
      service.continue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 7, 'assessment']);
    });

    it('continue from an earlier setup step advances the setup tab without navigating', () => {
      service.setupTab.next('operations');
      service.continue();
      expect(service.setupTab.value).toBe('activated-sludge');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('back from the assessment tab navigates to baseline', () => {
      service.mainTab.next('assessment');
      service.back();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/waste-water', 7, 'baseline']);
    });
  });
});
