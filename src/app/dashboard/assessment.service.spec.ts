import { TestBed } from '@angular/core/testing';
import { AssessmentService } from './assessment.service';
import { DashboardService } from './dashboard.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';
import { TreasureHunt } from '../shared/models/treasure-hunt';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    TestBed.configureTestingModule({
      providers: [
        AssessmentService,
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: AssessmentCo2SavingsService, useValue: {} },
      ],
    });
    service = TestBed.inject(AssessmentService);
  });

  describe('goToAssessment for PSAT', () => {
    function makePsatAssessment(setupDone: boolean, isExample?: boolean): Assessment {
      return { id: 3, name: 'Pump', type: 'PSAT', isExample, psat: { setupDone } as PSAT };
    }

    it('opens the baseline tab when setup is not done', () => {
      service.goToAssessment(makePsatAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/3/baseline', { shouldCollapse: true });
    });

    it('opens the assessment tab when setup is done and no tab is given', () => {
      service.goToAssessment(makePsatAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/3/assessment', { shouldCollapse: true });
    });

    it('opens the baseline tab for an example assessment', () => {
      service.goToAssessment(makePsatAssessment(true, true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/3/baseline', { shouldCollapse: true });
    });

    it('opens the requested tab', () => {
      service.goToAssessment(makePsatAssessment(true), 'report');
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/3/report', { shouldCollapse: true });
    });
  });

  describe('goToAssessment for Treasure Hunt', () => {
    function makeTreasureHuntAssessment(setupDone: boolean): Assessment {
      return { id: 5, name: 'Hunt', type: 'TreasureHunt', treasureHunt: { setupDone } as TreasureHunt };
    }

    it('maps the generic assessment tab to the treasure chest', () => {
      service.goToAssessment(makeTreasureHuntAssessment(true), 'assessment');
      expect(service.getStartingTab()).toBe('treasure-chest');
    });

    it('keeps other requested tabs', () => {
      service.goToAssessment(makeTreasureHuntAssessment(true), 'report');
      expect(service.getStartingTab()).toBe('report');
    });
  });
});
