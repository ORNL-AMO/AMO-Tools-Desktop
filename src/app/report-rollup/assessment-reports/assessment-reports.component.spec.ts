import { AssessmentReportsComponent } from './assessment-reports.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SSMT } from '../../shared/models/steam/ssmt';
import { TreasureHunt } from '../../shared/models/treasure-hunt';

describe('AssessmentReportsComponent', () => {
  let component: AssessmentReportsComponent;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    // goToAssessment only uses DashboardService. Constructed directly so the rollup subscriptions in ngOnInit/ngOnDestroy never run.
    const unused = {} as never;
    component = new AssessmentReportsComponent(unused, unused, unused, unused, unused, unused, unused, unused, unused, unused, dashboardServiceSpy);
  });

  describe('goToAssessment for PSAT', () => {
    function makePsatAssessment(setupDone: boolean, isExample?: boolean): Assessment {
      return { id: 4, name: 'Pump', type: 'PSAT', isExample, psat: { setupDone } as PSAT };
    }

    it('opens the assessment tab when setup is done', () => {
      component.goToAssessment(makePsatAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/4/assessment', { shouldCollapse: true });
    });

    it('opens the baseline tab when setup is not done', () => {
      component.goToAssessment(makePsatAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/4/baseline', { shouldCollapse: true });
    });

    it('opens the baseline tab for an example assessment', () => {
      component.goToAssessment(makePsatAssessment(true, true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/psat/4/baseline', { shouldCollapse: true });
    });
  });

  describe('goToAssessment for SSMT', () => {
    function makeSsmtAssessment(setupDone: boolean, isExample: boolean = false): Assessment {
      return { id: 3, type: 'SSMT', isExample, ssmt: { setupDone } as SSMT } as Assessment;
    }

    it('opens baseline when setup is not done', () => {
      component.goToAssessment(makeSsmtAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/baseline', { shouldCollapse: true });
    });

    it('opens assessment when setup is done', () => {
      component.goToAssessment(makeSsmtAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/assessment', { shouldCollapse: true });
    });

    it('opens baseline for a completed example assessment', () => {
      component.goToAssessment(makeSsmtAssessment(true, true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/ssmt/3/baseline', { shouldCollapse: true });
    });
  });

  describe('goToAssessment for Treasure Hunt', () => {
    function makeTreasureHuntAssessment(setupDone: boolean, isExample: boolean = false): Assessment {
      return { id: 6, type: 'TreasureHunt', isExample, treasureHunt: { setupDone } as TreasureHunt } as Assessment;
    }

    it('opens baseline when setup is not done', () => {
      component.goToAssessment(makeTreasureHuntAssessment(false));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/6/baseline', { shouldCollapse: true });
    });

    it('opens the treasure chest when setup is done', () => {
      component.goToAssessment(makeTreasureHuntAssessment(true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/6/treasure-chest', { shouldCollapse: true });
    });

    it('opens baseline for a completed example assessment', () => {
      component.goToAssessment(makeTreasureHuntAssessment(true, true));
      expect(dashboardServiceSpy.navigateWithSidebarOptions).toHaveBeenCalledWith('/treasure-hunt/6/baseline', { shouldCollapse: true });
    });
  });
});
