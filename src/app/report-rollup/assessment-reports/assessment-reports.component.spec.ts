import { AssessmentReportsComponent } from './assessment-reports.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { SSMT } from '../../shared/models/steam/ssmt';

function makeSsmtAssessment(setupDone: boolean, isExample: boolean = false): Assessment {
  return { id: 3, type: 'SSMT', isExample, ssmt: { setupDone } as SSMT } as Assessment;
}

describe('AssessmentReportsComponent.goToAssessment (SSMT)', () => {
  let component: AssessmentReportsComponent;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    component = new AssessmentReportsComponent(
      undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
      dashboardServiceSpy
    );
  });

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
