import { AssessmentService } from './assessment.service';
import { DashboardService } from './dashboard.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Assessment } from '../shared/models/assessment';
import { SSMT } from '../shared/models/steam/ssmt';

function makeSsmtAssessment(setupDone: boolean, isExample: boolean = false): Assessment {
  return { id: 3, type: 'SSMT', isExample, ssmt: { setupDone } as SSMT } as Assessment;
}

describe('AssessmentService.goToAssessment (SSMT)', () => {
  let service: AssessmentService;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['navigateWithSidebarOptions']);
    service = new AssessmentService(dashboardServiceSpy, {} as AssessmentCo2SavingsService);
  });

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
