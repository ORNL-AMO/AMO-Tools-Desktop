import { AssessmentReportsComponent } from './assessment-reports.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';

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
});
