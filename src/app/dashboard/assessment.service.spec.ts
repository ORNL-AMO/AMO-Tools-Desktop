import { TestBed } from '@angular/core/testing';
import { AssessmentService } from './assessment.service';
import { DashboardService } from './dashboard.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';
import { SSMT } from '../shared/models/steam/ssmt';
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

  describe('goToAssessment for SSMT', () => {
    function makeSsmtAssessment(setupDone: boolean, isExample: boolean = false): Assessment {
      return { id: 3, type: 'SSMT', isExample, ssmt: { setupDone } as SSMT } as Assessment;
    }

    it('opens baseline when setup is not done', () => {
      service.goToAssessment(makeSsmtAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/baseline', { shouldCollapse: true });
    });

    it('opens assessment when setup is done', () => {
      service.goToAssessment(makeSsmtAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/assessment', { shouldCollapse: true });
    });

    it('opens baseline for a completed example assessment', () => {
      service.goToAssessment(makeSsmtAssessment(true, true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/baseline', { shouldCollapse: true });
    });

    it('opens the explicitly requested main tab', () => {
      service.goToAssessment(makeSsmtAssessment(true), 'report');
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/report', { shouldCollapse: true });
    });
  });

  describe('goToAssessment for Treasure Hunt', () => {
    function makeTreasureHuntAssessment(setupDone: boolean): Assessment {
      return { id: 5, name: 'Hunt', type: 'TreasureHunt', treasureHunt: { setupDone } as TreasureHunt };
    }

    it('maps the generic assessment tab to the treasure chest', () => {
      service.goToAssessment(makeTreasureHuntAssessment(true), 'assessment');
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/5/treasure-chest', { shouldCollapse: true });
    });

    it('keeps other requested tabs', () => {
      service.goToAssessment(makeTreasureHuntAssessment(true), 'report');
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/5/report', { shouldCollapse: true });
    });

    it('opens baseline when setup is not done', () => {
      service.goToAssessment(makeTreasureHuntAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/5/baseline', { shouldCollapse: true });
    });

    it('opens the treasure chest when setup is done and no tab is given', () => {
      service.goToAssessment(makeTreasureHuntAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/5/treasure-chest', { shouldCollapse: true });
    });
  });
});
