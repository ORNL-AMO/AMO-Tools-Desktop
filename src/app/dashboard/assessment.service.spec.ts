import { Assessment } from '../shared/models/assessment';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { DashboardService } from './dashboard.service';
import { AssessmentService } from './assessment.service';

function buildPhastAssessment(modifications: object[]): Assessment {
  return { id: 1, type: 'PHAST', phast: { setupDone: true, modifications } } as unknown as Assessment;
}

describe('AssessmentService.goToAssessment', () => {
  let service: AssessmentService;
  let dashboardService: jasmine.SpyObj<DashboardService>;

  beforeEach(() => {
    dashboardService = jasmine.createSpyObj<DashboardService>('DashboardService', ['navigateWithSidebarOptions']);
    service = new AssessmentService(dashboardService, {} as AssessmentCo2SavingsService);
  });

  it('opens a Process Heating assessment the legacy module can read in the legacy module', () => {
    service.goToAssessment(buildPhastAssessment([{ id: 'm1', phast: { name: 'Mod 1' } }]), 'baseline');

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/phast/1', { shouldCollapse: true });
  });

  it('opens a Process Heating assessment with a modification created in the rebuild in the rebuild', () => {
    service.goToAssessment(buildPhastAssessment([{ id: 'm1', scenarioOverrides: {} }]), 'baseline');

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1', { shouldCollapse: true });
  });

  it('opens the rebuild when asked to, whatever the saved data', () => {
    service.goToAssessment(buildPhastAssessment([]), 'baseline', undefined, 'process-heating');

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1', { shouldCollapse: true });
  });

  it('opens a legacy assessment Process Heating has saved in Process Heating', () => {
    service.goToAssessment(buildPhastAssessment([{ id: 'm1', phast: { name: 'Stale' }, scenarioOverrides: {} }]), 'baseline');

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1', { shouldCollapse: true });
  });

  it('opens a legacy assessment Process Heating has saved in the legacy module when asked to', () => {
    service.goToAssessment(buildPhastAssessment([{ id: 'm1', phast: { name: 'Stale' }, scenarioOverrides: {} }]), 'baseline', undefined, 'phast');

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/phast/1', { shouldCollapse: true });
  });

  it('opens the Process Heating view matching the requested tab', () => {
    const assessment = buildPhastAssessment([{ id: 'm1', scenarioOverrides: {} }]);

    service.goToAssessment(assessment, 'assessment');
    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1/assessment', { shouldCollapse: true });

    service.goToAssessment(assessment, 'report');
    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1/report', { shouldCollapse: true });
  });

  it('opens the Process Heating Assessment view for a set-up assessment when no tab is requested', () => {
    service.goToAssessment(buildPhastAssessment([{ id: 'm1', scenarioOverrides: {} }]));

    expect(dashboardService.navigateWithSidebarOptions).toHaveBeenCalledWith('/process-heating/1/assessment', { shouldCollapse: true });
  });
});
