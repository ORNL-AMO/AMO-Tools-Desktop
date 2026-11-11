import { WaterBannerComponent } from './water-banner.component';
import { WaterAssessmentService } from '../water-assessment.service';

describe('WaterBannerComponent changeTab', () => {
  let component: WaterBannerComponent;
  let waterAssessmentService: jasmine.SpyObj<WaterAssessmentService>;

  beforeEach(() => {
    waterAssessmentService = jasmine.createSpyObj('WaterAssessmentService', ['goToMainTab']);
    const unused = {} as never;
    component = new WaterBannerComponent(waterAssessmentService, unused, unused, unused);
  });

  (['baseline', 'diagram', 'report'] as const).forEach(view => {
    it(`navigates to ${view} by route`, () => {
      component.changeTab(view);
      expect(waterAssessmentService.goToMainTab).toHaveBeenCalledWith(view);
    });
  });

  it('does not route the placeholder assessment tab', () => {
    component.changeTab('assessment');
    expect(waterAssessmentService.goToMainTab).not.toHaveBeenCalled();
  });
});
