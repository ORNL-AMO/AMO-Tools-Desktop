import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PsatTabService } from './psat-tab.service';
import { psatRoutes } from './routing/psat.routing';
import { deriveSteppedRoutes, PSAT_STEPPED_ROUTES } from './routing/stepped-routes';

describe('PsatTabService', () => {
  let service: PsatTabService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        PsatTabService,
        { provide: Router, useValue: routerSpy },
        { provide: PSAT_STEPPED_ROUTES, useValue: deriveSteppedRoutes(psatRoutes) },
      ],
    });
    service = TestBed.inject(PsatTabService);
    service.assessmentId = 7;
  });

  describe('goToMainTab', () => {
    it('navigates to the main tab route for the assessment', () => {
      service.goToMainTab('report');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/psat', 7, 'report']);
    });

    it('does not navigate without an assessment id', () => {
      service.assessmentId = undefined;
      service.goToMainTab('report');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('continueMainTab / backMainTab', () => {
    it('continueMainTab navigates to the next main tab', () => {
      service.mainTab.next('report');
      service.continueMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/psat', 7, 'sankey']);
    });

    it('continueMainTab does nothing on the last main tab', () => {
      service.mainTab.next('calculators');
      service.continueMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('backMainTab navigates to the previous main tab', () => {
      service.mainTab.next('calculators');
      service.backMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/psat', 7, 'sankey']);
    });

    it('backMainTab does nothing on the first main tab', () => {
      service.mainTab.next('baseline');
      service.backMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('continue / back', () => {
    it('continue advances the step tab before field-data', () => {
      service.stepTab.next('pump-fluid');
      service.continue();
      expect(service.stepTab.value).toBe('motor');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('continue navigates to assessment from field-data', () => {
      service.stepTab.next('field-data');
      service.continue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/psat', 7, 'assessment']);
    });

    it('back navigates to baseline from assessment', () => {
      service.mainTab.next('assessment');
      service.back();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/psat', 7, 'baseline']);
    });

    it('back moves to the previous step tab on baseline', () => {
      service.stepTab.next('motor');
      service.back();
      expect(service.stepTab.value).toBe('pump-fluid');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });
});
