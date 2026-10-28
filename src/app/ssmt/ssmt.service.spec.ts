import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SsmtService } from './ssmt.service';
import { SteamService } from '../calculator/steam/steam.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ConvertSteamService } from '../calculator/steam/convert-steam.service';
import { BoilerService } from './boiler/boiler.service';
import { HeaderService } from './header/header.service';
import { TurbineService } from './turbine/turbine.service';
import { OperationsService } from './operations/operations.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

describe('SsmtService main tab navigation', () => {
  let service: SsmtService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        SsmtService,
        { provide: Router, useValue: routerSpy },
        { provide: SteamService, useValue: {} },
        { provide: AssessmentCo2SavingsService, useValue: {} },
        { provide: ConvertSteamService, useValue: {} },
        { provide: BoilerService, useValue: {} },
        { provide: HeaderService, useValue: {} },
        { provide: TurbineService, useValue: {} },
        { provide: OperationsService, useValue: {} },
        { provide: ConvertUnitsService, useValue: {} },
      ],
    });
    service = TestBed.inject(SsmtService);
  });

  describe('goToMainTab', () => {
    it('navigates to the main tab route for the assessment', () => {
      service.assessmentId = 7;
      service.goToMainTab('report');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 7, 'report']);
    });

    it('does nothing without an assessment id', () => {
      service.goToMainTab('report');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('does not change mainTab directly', () => {
      service.assessmentId = 7;
      service.goToMainTab('report');
      expect(service.mainTab.value).toBe('baseline');
    });
  });

  describe('continueMainTab / backMainTab', () => {
    beforeEach(() => {
      service.assessmentId = 7;
    });

    it('continue navigates to the next view', () => {
      service.mainTab.next('report');
      service.continueMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 7, 'sankey']);
    });

    it('back navigates to the previous view', () => {
      service.mainTab.next('report');
      service.backMainTab();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 7, 'diagram']);
    });

    it('continue does nothing at the last view', () => {
      service.mainTab.next('calculators');
      service.continueMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('back does nothing at the first view', () => {
      service.mainTab.next('baseline');
      service.backMainTab();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('continue / back (step footer)', () => {
    beforeEach(() => {
      service.assessmentId = 7;
    });

    it('continue from the turbine step navigates to the assessment tab', () => {
      service.stepTab.next('turbine');
      service.continue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 7, 'assessment']);
    });

    it('continue before the turbine step advances the step tab only', () => {
      service.stepTab.next('boiler');
      service.continue();
      expect(service.stepTab.value).toBe('header');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('back from the assessment tab navigates to baseline', () => {
      service.mainTab.next('assessment');
      service.back();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ssmt', 7, 'baseline']);
    });
  });
});
